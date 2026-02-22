"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PatientForm } from "@/components/consultation/patient-form";
import { AudioRecorder } from "@/components/consultation/audio-recorder";
import { ProcessingView } from "@/components/consultation/processing-view";
import type { PatientFormData } from "@/lib/validations";
import { Badge } from "@/components/ui/badge";

type Step = "patient" | "recording" | "processing";

export default function NewConsultationPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("patient");
    const [patientData, setPatientData] = useState<PatientFormData | null>(null);
    const [processingStep, setProcessingStep] = useState("upload");
    const [processingError, setProcessingError] = useState<string | undefined>();
    const [isUploading, setIsUploading] = useState(false);

    const handlePatientSubmit = (data: PatientFormData) => {
        setPatientData(data);
        setStep("recording");
    };

    const handleAudioUpload = async (blob: Blob, transcript?: string) => {
        if (!patientData) return;

        // Transcript is required — backend no longer does STT
        const transcriptText = transcript || "";
        if (transcriptText.trim().length < 10) {
            setProcessingError("Transcript is too short. Please record a longer conversation.");
            return;
        }

        setIsUploading(true);
        setStep("processing");
        setProcessingStep("upload");
        setProcessingError(undefined);

        try {
            const formData = new FormData();
            formData.append("audio", blob, "recording.webm");
            formData.append("transcript", transcriptText);
            formData.append("patientName", patientData.name);
            formData.append("patientAge", patientData.age.toString());
            formData.append("patientGender", patientData.gender);
            formData.append("patientContact", patientData.contact);

            setProcessingStep("transcribe");

            const response = await fetch("/api/transcribe", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Processing failed");
            }

            setProcessingStep("extract");

            const data = await response.json();

            setProcessingStep("complete");

            // Wait a moment, then redirect to the report page
            setTimeout(() => {
                router.push(`/consultation/${data.reportId}`);
            }, 1500);
        } catch (error) {
            setProcessingError(
                error instanceof Error ? error.message : "An unexpected error occurred"
            );
        } finally {
            setIsUploading(false);
        }
    };

    const steps = [
        { id: "patient", label: "Patient Info", number: 1 },
        { id: "recording", label: "Recording", number: 2 },
        { id: "processing", label: "AI Processing", number: 3 },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2">
                            <Badge
                                variant={
                                    step === s.id
                                        ? "default"
                                        : steps.findIndex((x) => x.id === step) > i
                                            ? "success"
                                            : "secondary"
                                }
                                className="gap-1.5"
                            >
                                {s.number}. {s.label}
                            </Badge>
                            {i < steps.length - 1 && (
                                <div className="w-8 h-px bg-border" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                {step === "patient" && <PatientForm onSubmit={handlePatientSubmit} />}
                {step === "recording" && (
                    <AudioRecorder onUpload={handleAudioUpload} isUploading={isUploading} />
                )}
                {step === "processing" && (
                    <ProcessingView currentStep={processingStep} error={processingError} />
                )}
            </div>
        </DashboardLayout>
    );
}
