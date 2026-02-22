"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientFormSchema, type PatientFormData } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { User, ArrowRight } from "lucide-react";

interface PatientFormProps {
    onSubmit: (data: PatientFormData) => void;
}

export function PatientForm({ onSubmit }: PatientFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<PatientFormData>({
        resolver: zodResolver(patientFormSchema),
        defaultValues: {
            name: "",
            age: undefined,
            gender: undefined,
            contact: "",
            consent: undefined,
        },
    });

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Patient Information</CardTitle>
                        <CardDescription>
                            Enter the patient&apos;s details before starting the consultation recording.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                placeholder="Enter patient's full name"
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="age">Age *</Label>
                            <Input
                                id="age"
                                type="number"
                                placeholder="Age"
                                {...register("age")}
                            />
                            {errors.age && (
                                <p className="text-xs text-destructive">{errors.age.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender *</Label>
                            <Select onValueChange={(value) => setValue("gender", value as "male" | "female" | "other")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && (
                                <p className="text-xs text-destructive">{errors.gender.message}</p>
                            )}
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="contact">Contact Number *</Label>
                            <Input
                                id="contact"
                                placeholder="Phone number or email"
                                {...register("contact")}
                            />
                            {errors.contact && (
                                <p className="text-xs text-destructive">{errors.contact.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Consent */}
                    <div className="rounded-lg border bg-amber-50/50 p-4">
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="consent"
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                {...register("consent")}
                            />
                            <Label htmlFor="consent" className="text-sm leading-relaxed font-normal">
                                I confirm that the patient has been informed about and consented to the
                                recording of this consultation for medical documentation purposes.
                            </Label>
                        </div>
                        {errors.consent && (
                            <p className="text-xs text-destructive mt-2 ml-7">
                                {errors.consent.message}
                            </p>
                        )}
                    </div>

                    <Button type="submit" className="w-full gap-2">
                        Continue to Recording
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
