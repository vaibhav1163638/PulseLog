"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Stethoscope,
    Users,
    Settings,
    ShieldCheck,
    FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/consultation/new", label: "New Consultation", icon: Stethoscope },
    { href: "/patients", label: "Patients", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
];

const adminItems = [
    { href: "/admin", label: "Admin Panel", icon: ShieldCheck },
];

interface SidebarProps {
    role?: string;
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-6 py-5 border-b">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white">
                    <FileText className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-foreground tracking-tight">
                        PulseLog
                    </h1>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                        AI Platform
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
                <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Main Menu
                </p>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                            {item.label}
                        </Link>
                    );
                })}

                {role === "admin" && (
                    <>
                        <div className="my-4 border-t" />
                        <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Administration
                        </p>
                        {adminItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-primary/10 text-primary shadow-sm"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            {/* Footer */}
            <div className="px-4 py-3 border-t">
                <p className="text-xs text-muted-foreground text-center">
                    © 2026 PulseLog
                </p>
            </div>
        </aside>
    );
}
