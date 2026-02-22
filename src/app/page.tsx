import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Mic,
    Brain,
    Shield,
    ArrowRight,
    Stethoscope,
    CheckCircle,
} from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white">
                                <FileText className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold text-foreground tracking-tight">
                                PulseLog
                            </span>
                        </div>
                        <Link href="/login">
                            <Button>Sign In</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                        <Stethoscope className="w-4 h-4" />
                        AI-Powered Medical Documentation
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-bold text-foreground leading-tight mb-6">
                        Transform Doctor-Patient
                        <br />
                        <span className="text-primary">Conversations into Reports</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                        Record consultations, automatically transcribe and extract medical data with AI,
                        generate professional prescription PDFs — all in seconds.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link href="/login">
                            <Button size="lg" className="text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                                Get Started Free
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-foreground mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Three simple steps to transform your consultations into professional medical documentation.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Mic,
                                title: "Record Conversation",
                                desc: "Simply press record during your consultation. Our browser-based recorder captures the entire doctor-patient conversation securely.",
                                color: "bg-blue-50 text-blue-600",
                            },
                            {
                                icon: Brain,
                                title: "AI Analysis",
                                desc: "OpenAI Whisper transcribes the audio, then GPT-4o extracts symptoms, diagnosis, medicines and notes into a structured format.",
                                color: "bg-purple-50 text-purple-600",
                            },
                            {
                                icon: FileText,
                                title: "Generate Report",
                                desc: "Review and edit the AI-generated report, then generate a professional PDF prescription ready for download or printing.",
                                color: "bg-green-50 text-green-600",
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="relative p-8 bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 group"
                            >
                                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                                    {i + 1}
                                </div>
                                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-foreground mb-6">
                                Built for Modern Healthcare
                            </h2>
                            <div className="space-y-4">
                                {[
                                    "Reduce documentation time by 80%",
                                    "HIPAA-aware security with encrypted storage",
                                    "Full doctor control — review before saving",
                                    "Professional PDF prescriptions in seconds",
                                    "Complete patient history at your fingertips",
                                    "OAuth-only — no passwords to manage",
                                ].map((benefit, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                                        <span className="text-muted-foreground">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border">
                            <div className="flex items-center gap-2 mb-6">
                                <Shield className="w-6 h-6 text-primary" />
                                <span className="font-semibold text-foreground">Security First</span>
                            </div>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <p>• End-to-end encrypted data storage</p>
                                <p>• OAuth-only authentication (Google)</p>
                                <p>• JWT session management</p>
                                <p>• Role-based access control</p>
                                <p>• Rate-limited AI endpoints</p>
                                <p>• No API keys exposed to client</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">PulseLog</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © 2026 PulseLog. Built for healthcare professionals.
                    </p>
                </div>
            </footer>
        </div>
    );
}
