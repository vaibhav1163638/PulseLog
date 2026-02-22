"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function AdminPage() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session && (session.user as Record<string, unknown>)?.role !== "admin") {
            router.push("/dashboard");
        }
    }, [session, router]);

    if ((session?.user as Record<string, unknown>)?.role !== "admin") {
        return null;
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
                    <p className="text-muted-foreground mt-1">
                        System administration and management.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            Admin Access
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Admin features will be available here. You can manage users,
                            view system analytics, and configure platform settings.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
