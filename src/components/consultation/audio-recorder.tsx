"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mic, Square, Play, Pause, Upload, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

interface AudioRecorderProps {
    onUpload: (blob: Blob, transcript: string) => void;
    isUploading?: boolean;
}

/* ============================================================
   Browser SpeechRecognition type shim
============================================================ */

interface ISpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((e: any) => void) | null;
    onerror: ((e: any) => void) | null;
    onend: (() => void) | null;
}

function getSpeechRecognition(): (new () => ISpeechRecognition) | null {
    if (typeof window === "undefined") return null;
    const w = window as any;
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function AudioRecorder({ onUpload, isUploading }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [liveTranscript, setLiveTranscript] = useState("");
    const [speechSupported, setSpeechSupported] = useState(true);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const recognitionRef = useRef<ISpeechRecognition | null>(null);
    const transcriptRef = useRef("");

    useEffect(() => {
        if (!getSpeechRecognition()) setSpeechSupported(false);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    /* ── Start recording (audio + speech recognition) ────── */

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setLiveTranscript("");
            transcriptRef.current = "";

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                    ? "audio/webm;codecs=opus"
                    : "audio/webm",
            });

            chunksRef.current = [];
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });

                if (blob.size > MAX_FILE_SIZE) {
                    setError("Recording exceeds 25MB limit. Please record a shorter conversation.");
                    return;
                }

                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start(1000);

            // Start browser speech recognition (if supported)
            const SpeechRecognitionClass = getSpeechRecognition();
            if (SpeechRecognitionClass) {
                const recognition = new SpeechRecognitionClass();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = "en-US";

                recognition.onresult = (event: any) => {
                    let final = "";
                    let interim = "";
                    for (let i = 0; i < event.results.length; i++) {
                        const result = event.results[i];
                        if (result.isFinal) {
                            final += result[0].transcript + " ";
                        } else {
                            interim += result[0].transcript;
                        }
                    }
                    transcriptRef.current = final;
                    setLiveTranscript(final + interim);
                };

                recognition.onerror = (event: any) => {
                    // "no-speech" and "aborted" are normal — ignore them
                    if (event.error !== "no-speech" && event.error !== "aborted") {
                        console.warn("SpeechRecognition error:", event.error);
                    }
                };

                recognition.onend = () => {
                    // Auto-restart if we're still recording (recognition can timeout)
                    if (mediaRecorderRef.current?.state === "recording") {
                        try { recognition.start(); } catch { /* already running */ }
                    }
                };

                recognition.start();
                recognitionRef.current = recognition;
            }

            setIsRecording(true);
            setDuration(0);

            timerRef.current = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            setError("Microphone access denied. Please allow microphone permissions.");
            console.error("Recording error:", err);
        }
    }, []);

    /* ── Stop recording ──────────────────────────────────── */

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        // Stop speech recognition
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { /* ok */ }
            recognitionRef.current = null;
        }

        // Finalize transcript
        setLiveTranscript(transcriptRef.current.trim());
    }, []);

    /* ── Playback ─────────────────────────────────────────── */

    const togglePlayback = useCallback(() => {
        if (!audioRef.current || !audioUrl) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    }, [isPlaying, audioUrl]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    /* ── Upload ────────────────────────────────────────────── */

    const handleUpload = () => {
        if (!audioBlob) return;
        const finalTranscript = liveTranscript.trim() || transcriptRef.current.trim();
        if (finalTranscript.length < 10) {
            setError(
                "Transcript is too short. Please speak clearly during the recording " +
                "or check that your browser supports speech recognition."
            );
            return;
        }
        onUpload(audioBlob, finalTranscript);
    };

    /* ── Reset ─────────────────────────────────────────────── */

    const resetRecording = () => {
        setAudioBlob(null);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setDuration(0);
        setIsPlaying(false);
        setError(null);
        setLiveTranscript("");
        transcriptRef.current = "";
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Mic className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Record Consultation</CardTitle>
                        <CardDescription>
                            Record the doctor-patient conversation. Speech is transcribed live in your browser.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-6">
                    {/* Speech Recognition Warning */}
                    {!speechSupported && (
                        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg w-full">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            Your browser doesn&apos;t support speech recognition. Please use Chrome or Edge for live transcription.
                        </div>
                    )}

                    {/* Recording Visualizer */}
                    <div className="relative flex items-center justify-center w-40 h-40">
                        {isRecording && (
                            <>
                                <div className="absolute inset-0 rounded-full bg-red-100 animate-pulse-ring" />
                                <div className="absolute inset-4 rounded-full bg-red-50 animate-pulse-ring" style={{ animationDelay: "0.3s" }} />
                            </>
                        )}
                        <button
                            onClick={isRecording ? stopRecording : audioBlob ? resetRecording : startRecording}
                            className={cn(
                                "relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                                isRecording
                                    ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30"
                                    : "bg-primary hover:bg-primary/90 text-white shadow-primary/30"
                            )}
                        >
                            {isRecording ? (
                                <Square className="w-8 h-8" />
                            ) : (
                                <Mic className="w-8 h-8" />
                            )}
                        </button>
                    </div>

                    {/* Timer */}
                    <div className="text-center">
                        <p className="text-3xl font-mono font-semibold text-foreground">
                            {formatTime(duration)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {isRecording
                                ? "Recording & transcribing..."
                                : audioBlob
                                    ? "Recording complete"
                                    : "Click to start recording"}
                        </p>
                    </div>

                    {/* Live Transcript (visible during/after recording) */}
                    {(isRecording || liveTranscript) && (
                        <div className="w-full">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                Live Transcript {isRecording && <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1" />}
                            </p>
                            <div className="bg-muted/50 border rounded-lg p-3 text-sm max-h-40 overflow-y-auto">
                                {liveTranscript || (
                                    <span className="text-muted-foreground italic">
                                        Listening... speak clearly into the microphone.
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Playback & Upload */}
                    {audioUrl && (
                        <div className="w-full space-y-4">
                            <audio
                                ref={audioRef}
                                src={audioUrl}
                                onEnded={() => setIsPlaying(false)}
                                className="hidden"
                            />
                            <div className="flex items-center justify-center gap-3">
                                <Button variant="outline" size="sm" onClick={togglePlayback} className="gap-2">
                                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    {isPlaying ? "Pause" : "Play"} Preview
                                </Button>
                                <Button variant="outline" size="sm" onClick={resetRecording}>
                                    Re-record
                                </Button>
                            </div>

                            <Button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="w-full gap-2"
                                size="lg"
                            >
                                {isUploading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Upload className="w-5 h-5" />
                                )}
                                {isUploading ? "AI is transcribing..." : "Upload & Analyze with AI"}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
