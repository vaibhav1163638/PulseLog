import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { IStructuredData } from "@/models/report";

interface PDFInput {
    clinicName: string;
    doctorName: string;
    date: string;
    patientName: string;
    patientAge: number;
    patientGender: string;
    patientContact: string;
    structuredData: IStructuredData;
}

export async function generateMedicalPDF(input: PDFInput): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    const margin = 50;
    let y = height - margin;
    const blue = rgb(0.145, 0.388, 0.922); // #2563EB
    const black = rgb(0, 0, 0);
    const gray = rgb(0.4, 0.4, 0.4);
    const lineColor = rgb(0.85, 0.85, 0.85);

    // === HEADER ===
    // Blue top bar
    page.drawRectangle({
        x: 0,
        y: height - 5,
        width,
        height: 5,
        color: blue,
    });

    y -= 10;
    page.drawText(input.clinicName || "PulseLog Clinic", {
        x: margin,
        y,
        size: 20,
        font: helveticaBold,
        color: blue,
    });

    y -= 22;
    page.drawText(`Dr. ${input.doctorName}`, {
        x: margin,
        y,
        size: 12,
        font: helvetica,
        color: black,
    });

    page.drawText(`Date: ${input.date}`, {
        x: width - margin - 120,
        y,
        size: 10,
        font: helvetica,
        color: gray,
    });

    y -= 15;
    page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 1,
        color: lineColor,
    });

    // === PATIENT INFO ===
    y -= 25;
    page.drawText("PATIENT INFORMATION", {
        x: margin,
        y,
        size: 12,
        font: helveticaBold,
        color: blue,
    });

    y -= 20;
    const patientInfoLines = [
        `Name: ${input.patientName}`,
        `Age: ${input.patientAge} | Gender: ${input.patientGender}`,
        `Contact: ${input.patientContact}`,
    ];

    for (const line of patientInfoLines) {
        page.drawText(line, { x: margin + 10, y, size: 10, font: helvetica, color: black });
        y -= 16;
    }

    y -= 10;
    page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 0.5,
        color: lineColor,
    });

    // === SYMPTOMS ===
    y -= 25;
    page.drawText("SYMPTOMS", {
        x: margin,
        y,
        size: 12,
        font: helveticaBold,
        color: blue,
    });

    y -= 18;
    if (input.structuredData.symptoms.length > 0) {
        for (const symptom of input.structuredData.symptoms) {
            page.drawText(`• ${symptom}`, { x: margin + 10, y, size: 10, font: helvetica, color: black });
            y -= 16;
            if (y < 80) {
                // Add new page if needed
                break;
            }
        }
    } else {
        page.drawText("No symptoms recorded", { x: margin + 10, y, size: 10, font: helvetica, color: gray });
        y -= 16;
    }

    // === OBSERVATIONS ===
    y -= 15;
    page.drawText("OBSERVATIONS", {
        x: margin,
        y,
        size: 12,
        font: helveticaBold,
        color: blue,
    });

    y -= 18;
    if (input.structuredData.observations.length > 0) {
        for (const obs of input.structuredData.observations) {
            page.drawText(`• ${obs}`, { x: margin + 10, y, size: 10, font: helvetica, color: black });
            y -= 16;
            if (y < 80) break;
        }
    } else {
        page.drawText("No observations recorded", { x: margin + 10, y, size: 10, font: helvetica, color: gray });
        y -= 16;
    }

    // === DIAGNOSIS ===
    y -= 15;
    page.drawText("DIAGNOSIS", {
        x: margin,
        y,
        size: 12,
        font: helveticaBold,
        color: blue,
    });

    y -= 18;
    page.drawText(input.structuredData.diagnosis || "Pending", {
        x: margin + 10,
        y,
        size: 10,
        font: helvetica,
        color: black,
    });

    // === MEDICINES TABLE ===
    y -= 30;
    page.drawText("PRESCRIBED MEDICINES", {
        x: margin,
        y,
        size: 12,
        font: helveticaBold,
        color: blue,
    });

    y -= 20;
    const colX = [margin + 10, margin + 180, margin + 330];
    const headers = ["Medicine", "Dosage", "Duration"];

    // Table header
    page.drawRectangle({
        x: margin,
        y: y - 4,
        width: width - 2 * margin,
        height: 18,
        color: rgb(0.95, 0.95, 0.97),
    });

    for (let i = 0; i < headers.length; i++) {
        page.drawText(headers[i], {
            x: colX[i],
            y,
            size: 10,
            font: helveticaBold,
            color: black,
        });
    }

    y -= 20;
    if (input.structuredData.prescribed_medicines.length > 0) {
        for (const med of input.structuredData.prescribed_medicines) {
            page.drawText(med.name || "-", { x: colX[0], y, size: 9, font: helvetica, color: black });
            page.drawText(med.dosage || "-", { x: colX[1], y, size: 9, font: helvetica, color: black });
            page.drawText(med.duration || "-", { x: colX[2], y, size: 9, font: helvetica, color: black });
            y -= 16;
            if (y < 80) break;
        }
    } else {
        page.drawText("No medicines prescribed", { x: colX[0], y, size: 9, font: helvetica, color: gray });
        y -= 16;
    }

    // === NOTES ===
    y -= 20;
    page.drawText("DOCTOR'S NOTES", {
        x: margin,
        y,
        size: 12,
        font: helveticaBold,
        color: blue,
    });

    y -= 18;
    const notes = input.structuredData.doctor_notes || "No additional notes";
    // Split long notes into lines
    const maxCharsPerLine = 80;
    const noteLines = [];
    for (let i = 0; i < notes.length; i += maxCharsPerLine) {
        noteLines.push(notes.substring(i, i + maxCharsPerLine));
    }
    for (const line of noteLines) {
        page.drawText(line, { x: margin + 10, y, size: 10, font: helvetica, color: black });
        y -= 16;
        if (y < 80) break;
    }

    // === FOOTER ===
    y = 70;
    page.drawLine({
        start: { x: margin, y: y + 10 },
        end: { x: width - margin, y: y + 10 },
        thickness: 0.5,
        color: lineColor,
    });

    page.drawText("Doctor's Signature: ______________________", {
        x: margin,
        y: y - 10,
        size: 10,
        font: helvetica,
        color: black,
    });

    page.drawText("Generated by PulseLog", {
        x: width - margin - 140,
        y: 30,
        size: 8,
        font: helvetica,
        color: gray,
    });

    return pdfDoc.save();
}
