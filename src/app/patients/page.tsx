"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, ArrowRight, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PatientItem {
    _id: string;
    name: string;
    age: number;
    gender: string;
    contact: string;
    createdAt: string;
}

export default function PatientsPage() {
    const [patients, setPatients] = useState<PatientItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [total, setTotal] = useState(0);

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            const res = await fetch(`/api/patients?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setPatients(data.patients);
                setTotal(data.total);
            }
        } catch (err) {
            console.error("Failed to fetch patients:", err);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(fetchPatients, 300);
        return () => clearTimeout(timer);
    }, [fetchPatients]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Patients</h1>
                        <p className="text-muted-foreground mt-1">
                            {total} patient{total !== 1 ? "s" : ""} registered
                        </p>
                    </div>
                    <Link href="/consultation/new">
                        <Button>New Consultation</Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search patients by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Patient List */}
                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-6">
                                    <Skeleton className="h-5 w-32 mb-3" />
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-4 w-20" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : patients.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {patients.map((patient) => (
                            <Link key={patient._id} href={`/patients/${patient._id}`}>
                                <Card className="h-full cursor-pointer hover:border-primary/30 transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground">
                                                        {patient.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {patient.age}y • {patient.gender}
                                                    </p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-xs text-muted-foreground">{patient.contact}</span>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(patient.createdAt)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground">
                                {search ? "No patients match your search" : "No patients yet"}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
