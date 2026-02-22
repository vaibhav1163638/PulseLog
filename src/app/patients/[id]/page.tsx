"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeft,
    User,
    FileText,
    Download,
    Stethoscope,
    Phone,
    Calendar,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";

interface PatientDetail {
    _id: string;
    name: string;
    age: number;
    gender: string;
    contact: string;
    createdAt: string;
}

interface ReportItem {
    _id: string;
    structuredData: {
        diagnosis: string;
        symptoms: string[];
    };
    pdfUrl: string | null;
    status: string;
    createdAt: string;
}

export default function PatientDetailPage() {
    const params = useParams();
    const [patient, setPatient] = useState<PatientDetail | null>(null);
    const [reports, setReports] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`/api/patients/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setPatient(data.patient);
                setReports(data.reports);
            }
        } catch (err) {
            console.error("Failed to fetch patient:", err);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="max-w-4xl mx-auto space-y-6">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </DashboardLayout>
        );
    }

    if (!patient) {
        return (
            <DashboardLayout>
                <div className="text-center py-20">
                    <p className="text-muted-foreground">Patient not found</p>
                    <Link href="/patients">
                        <Button variant="outline" className="mt-4">
                            Back to Patients
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
                <div className="flex items-center gap-3">
                    <Link href="/patients">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            {patient.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Patient since {formatDate(patient.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Patient Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Full Name</p>
                                <p className="font-medium">{patient.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Age</p>
                                <p className="font-medium">{patient.age} years</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Gender</p>
                                <p className="font-medium capitalize">{patient.gender}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Contact</p>
                                    <p className="font-medium">{patient.contact}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Reports */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">
                            Consultation History ({reports.length})
                        </CardTitle>
                        <Link href="/consultation/new">
                            <Button size="sm">New Consultation</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {reports.length > 0 ? (
                            <div className="space-y-3">
                                {reports.map((report) => (
                                    <div
                                        key={report._id}
                                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Stethoscope className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {report.structuredData?.diagnosis || "Pending diagnosis"}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDateTime(report.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={report.status === "finalized" ? "success" : "secondary"}
                                            >
                                                {report.status}
                                            </Badge>
                                            <Link href={`/consultation/${report._id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <FileText className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            {report.pdfUrl && (
                                                <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="ghost" size="sm">
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-muted-foreground text-sm">No reports yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
