"use client";

import { useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import Link from "next/link";
import { X, FileText, LayoutDashboard, Stethoscope, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const mobileNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/consultation/new", label: "New Consultation", icon: Stethoscope },
    { href: "/patients", label: "Patients", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Sidebar role={(session?.user as Record<string, unknown>)?.role as string} />

            {/* Mobile sidebar overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl animate-in slide-in-from-left">
                        <div className="flex items-center justify-between px-6 py-5 border-b">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <span className="text-lg font-bold">PulseLog</span>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="px-3 py-4 space-y-1">
                            {mobileNavItems.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-muted"
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="lg:pl-64">
                <Header onMenuToggle={() => setMobileMenuOpen(true)} />
                <main className="p-4 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
