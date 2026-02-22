"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Save,
    FileDown,
    Trash2,
    Plus,
    Loader2,
    ArrowLeft,
    Stethoscope,
} from "lucide-react";
import Link from "next/link";

interface Medicine {
    name: string;
    dosage: string;
    duration: string;
}

interface ReportData {
    _id: string;
    patientId: {
        _id: string;
        name: string;
        age: number;
        gender: string;
        contact: string;
    };
    transcription: string;
    structuredData: {
        symptoms: string[];
        observations: string[];
        diagnosis: string;
        prescribed_medicines: Medicine[];
        doctor_notes: string;
    };
    pdfUrl: string | null;
    status: string;
    createdAt: string;
}

export default function ConsultationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    // Editable fields
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [observations, setObservations] = useState<string[]>([]);
    const [diagnosis, setDiagnosis] = useState("");
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [notes, setNotes] = useState("");

    const fetchReport = useCallback(async () => {
        try {
            const res = await fetch(`/api/reports/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setReport(data);
                setSymptoms(data.structuredData?.symptoms || []);
                setObservations(data.structuredData?.observations || []);
                setDiagnosis(data.structuredData?.diagnosis || "");
                setMedicines(data.structuredData?.prescribed_medicines || []);
                setNotes(data.structuredData?.doctor_notes || "");
            }
        } catch (err) {
            console.error("Failed to fetch report:", err);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/reports/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symptoms,
                    observations,
                    diagnosis,
                    prescribed_medicines: medicines,
                    doctor_notes: notes,
                }),
            });
            if (res.ok) {
                await fetchReport();
            }
        } catch (err) {
            console.error("Failed to save:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleGeneratePdf = async () => {
        setGeneratingPdf(true);
        try {
            const res = await fetch(`/api/reports/${params.id}/pdf`, {
                method: "POST",
            });
            if (res.ok) {
                const data = await res.json();
                // Download the PDF
                if (data.pdfUrl) {
                    window.open(data.pdfUrl, "_blank");
                } else if (data.pdf) {
                    // Base64 PDF fallback
                    const link = document.createElement("a");
                    link.href = `data:application/pdf;base64,${data.pdf}`;
                    link.download = `report-${params.id}.pdf`;
                    link.click();
                }
                await fetchReport();
            }
        } catch (err) {
            console.error("Failed to generate PDF:", err);
        } finally {
            setGeneratingPdf(false);
        }
    };

    const addMedicine = () => {
        setMedicines([...medicines, { name: "", dosage: "", duration: "" }]);
    };

    const removeMedicine = (index: number) => {
        setMedicines(medicines.filter((_, i) => i !== index));
    };

    const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
        const updated = [...medicines];
        updated[index] = { ...updated[index], [field]: value };
        setMedicines(updated);
    };

    const updateListItem = (
        list: string[],
        setList: (items: string[]) => void,
        index: number,
        value: string
    ) => {
        const updated = [...list];
        updated[index] = value;
        setList(updated);
    };

    const addListItem = (list: string[], setList: (items: string[]) => void) => {
        setList([...list, ""]);
    };

    const removeListItem = (
        list: string[],
        setList: (items: string[]) => void,
        index: number
    ) => {
        setList(list.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="max-w-4xl mx-auto space-y-6">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </DashboardLayout>
        );
    }

    if (!report) {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    <p className="text-muted-foreground">Report not found</p>
                    <Link href="/dashboard">
                        <Button variant="outline" className="mt-4">
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <Stethoscope className="w-5 h-5 text-primary" />
                                Consultation Report
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {report.patientId.name} • {report.patientId.age}y •{" "}
                                {report.patientId.gender}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={report.status === "finalized" ? "success" : "secondary"}>
                            {report.status}
                        </Badge>
                    </div>
                </div>

                {/* Transcription */}
                {report.transcription && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Transcription</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {report.transcription}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Symptoms */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Symptoms</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => addListItem(symptoms, setSymptoms)}>
                            <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {symptoms.map((symptom, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Input
                                    value={symptom}
                                    onChange={(e) => updateListItem(symptoms, setSymptoms, i, e.target.value)}
                                    placeholder="Enter symptom"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeListItem(symptoms, setSymptoms, i)}
                                >
                                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Observations */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Observations</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => addListItem(observations, setObservations)}>
                            <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {observations.map((obs, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Input
                                    value={obs}
                                    onChange={(e) => updateListItem(observations, setObservations, i, e.target.value)}
                                    placeholder="Enter observation"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeListItem(observations, setObservations, i)}
                                >
                                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Diagnosis */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Diagnosis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder="Enter diagnosis"
                        />
                    </CardContent>
                </Card>

                {/* Medicines */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Prescribed Medicines</CardTitle>
                        <Button variant="ghost" size="sm" onClick={addMedicine}>
                            <Plus className="w-4 h-4 mr-1" /> Add Medicine
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {medicines.map((med, i) => (
                            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Medicine</Label>
                                    <Input
                                        value={med.name}
                                        onChange={(e) => updateMedicine(i, "name", e.target.value)}
                                        placeholder="Name"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Dosage</Label>
                                    <Input
                                        value={med.dosage}
                                        onChange={(e) => updateMedicine(i, "dosage", e.target.value)}
                                        placeholder="e.g., 500mg"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Duration</Label>
                                    <Input
                                        value={med.duration}
                                        onChange={(e) => updateMedicine(i, "duration", e.target.value)}
                                        placeholder="e.g., 7 days"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mt-5"
                                    onClick={() => removeMedicine(i)}
                                >
                                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            </div>
                        ))}
                        {medicines.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No medicines prescribed. Click &quot;Add Medicine&quot; to add one.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Doctor&apos;s Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional notes, follow-up instructions..."
                            rows={4}
                        />
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pb-8">
                    <Link href="/dashboard">
                        <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Report
                    </Button>
                    <Button
                        onClick={handleGeneratePdf}
                        disabled={generatingPdf}
                        variant="success"
                        className="gap-2"
                    >
                        {generatingPdf ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <FileDown className="w-4 h-4" />
                        )}
                        Generate PDF
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
