import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "PulseLog — AI-Powered Medical Report Generator",
    description:
        "Secure HealthTech SaaS platform that records doctor-patient conversations, converts speech to text, and generates structured medical reports using AI.",
    keywords: ["medical", "AI", "health", "transcription", "report", "SaaS"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body className={`${inter.className} antialiased`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
