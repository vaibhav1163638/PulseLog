"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Mic, FileText, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStep {
    id: string;
    label: string;
    icon: React.ElementType;
    status: "pending" | "processing" | "completed" | "error";
}

interface ProcessingViewProps {
    currentStep: string;
    error?: string;
}

export function ProcessingView({ currentStep, error }: ProcessingViewProps) {
    const steps: ProcessingStep[] = [
        {
            id: "upload",
            label: "Uploading audio to secure storage",
            icon: Mic,
            status:
                currentStep === "upload"
                    ? "processing"
                    : ["transcribe", "extract", "complete"].includes(currentStep)
                        ? "completed"
                        : "pending",
        },
        {
            id: "transcribe",
            label: "Transcribing with OpenAI Whisper",
            icon: FileText,
            status:
                currentStep === "transcribe"
                    ? "processing"
                    : ["extract", "complete"].includes(currentStep)
                        ? "completed"
                        : "pending",
        },
        {
            id: "extract",
            label: "Extracting medical data with GPT-4o",
            icon: Brain,
            status:
                currentStep === "extract"
                    ? "processing"
                    : currentStep === "complete"
                        ? "completed"
                        : "pending",
        },
        {
            id: "complete",
            label: "Report ready for review",
            icon: CheckCircle,
            status: currentStep === "complete" ? "completed" : "pending",
        },
    ];

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">
                    {error ? "Processing Error" : "AI Processing Your Consultation"}
                </CardTitle>
                {!error && (
                    <p className="text-sm text-muted-foreground mt-1">
                        This usually takes 30-60 seconds. Please don&apos;t close this page.
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-lg transition-all duration-300",
                                step.status === "processing" && "bg-primary/5 border border-primary/20",
                                step.status === "completed" && "bg-green-50/50",
                                step.status === "pending" && "opacity-50"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                    step.status === "processing" && "bg-primary/10",
                                    step.status === "completed" && "bg-green-100",
                                    step.status === "pending" && "bg-muted"
                                )}
                            >
                                {step.status === "processing" ? (
                                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                ) : step.status === "completed" ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                    <step.icon className="w-5 h-5 text-muted-foreground" />
                                )}
                            </div>
                            <div>
                                <p
                                    className={cn(
                                        "text-sm font-medium",
                                        step.status === "processing" && "text-primary",
                                        step.status === "completed" && "text-green-700",
                                        step.status === "pending" && "text-muted-foreground"
                                    )}
                                >
                                    {step.label}
                                </p>
                            </div>
                        </div>
                    ))}

                    {error && (
                        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                            {error}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
