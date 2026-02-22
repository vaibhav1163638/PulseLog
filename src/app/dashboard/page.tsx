"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Users,
    FileText,
    Stethoscope,
    ArrowRight,
    Clock,
    TrendingUp,
    Trash2,
    AlertTriangle,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";

interface DashboardStats {
    totalPatients: number;
    totalReports: number;
    recentConsultations: Array<{
        _id: string;
        patientName: string;
        diagnosis: string;
        createdAt: string;
        status: string;
    }>;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/dashboard");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/reports/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                const data = await res.json();
                setStats((prev) => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        totalPatients: data.patientDeleted ? prev.totalPatients - 1 : prev.totalPatients,
                        totalReports: prev.totalReports - 1,
                        recentConsultations: prev.recentConsultations.filter(
                            (c) => c._id !== id
                        ),
                    };
                });
            } else {
                console.error("Failed to delete report");
            }
        } catch (error) {
            console.error("Error deleting report:", error);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Welcome + CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Welcome back, Doctor
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Here&apos;s an overview of your practice activity.
                        </p>
                    </div>
                    <Link href="/consultation/new">
                        <Button size="lg" className="gap-2 shadow-md shadow-primary/20">
                            <Stethoscope className="w-5 h-5" />
                            Start New Consultation
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Patients
                            </CardTitle>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-8 w-20" />
                            ) : (
                                <div className="text-3xl font-bold">{stats?.totalPatients || 0}</div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                                Registered patients
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Reports
                            </CardTitle>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <FileText className="h-5 w-5 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-8 w-20" />
                            ) : (
                                <div className="text-3xl font-bold">{stats?.totalReports || 0}</div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                                Generated reports
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                This Month
                            </CardTitle>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-8 w-20" />
                            ) : (
                                <div className="text-3xl font-bold">
                                    {stats?.recentConsultations?.length || 0}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                                Recent consultations
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Consultations */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Recent Consultations</CardTitle>
                        <Link href="/patients">
                            <Button variant="ghost" size="sm" className="gap-1">
                                View All <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-[200px]" />
                                            <Skeleton className="h-3 w-[150px]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : stats?.recentConsultations && stats.recentConsultations.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recentConsultations.map((consultation) => (
                                    <div
                                        key={consultation._id}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                                    >
                                        <Link
                                            href={`/consultation/${consultation._id}`}
                                            className="flex items-center justify-between flex-1 mr-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Stethoscope className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                                        {consultation.patientName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {consultation.diagnosis || "Pending diagnosis"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant={consultation.status === "finalized" ? "success" : "secondary"}
                                                >
                                                    {consultation.status}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatDateTime(consultation.createdAt)}
                                                </div>
                                            </div>
                                        </Link>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2 text-destructive">
                                                        <AlertTriangle className="h-5 w-5" />
                                                        Delete Consultation?
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        This action cannot be undone. This will permanently delete the consultation report for <span className="font-medium text-foreground">{consultation.patientName}</span>.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline">Cancel</Button>
                                                    </DialogClose>
                                                    <DialogClose asChild>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={() => handleDelete(consultation._id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Stethoscope className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-muted-foreground">No consultations yet</p>
                                <Link href="/consultation/new" className="mt-3 inline-block">
                                    <Button variant="outline" size="sm">
                                        Start your first consultation
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
