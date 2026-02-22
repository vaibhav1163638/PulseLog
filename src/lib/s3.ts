import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET = process.env.AWS_S3_BUCKET || "pulselog";

export async function uploadToS3(
    buffer: Buffer,
    key: string,
    contentType: string
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });

    await s3Client.send(command);

    return `https://${BUCKET}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
}

export async function uploadAudio(
    buffer: Buffer,
    doctorId: string,
    patientId: string
): Promise<string> {
    const key = `audio/${doctorId}/${patientId}/${randomUUID()}.webm`;
    return uploadToS3(buffer, key, "audio/webm");
}

export async function uploadPDF(
    buffer: Uint8Array,
    doctorId: string,
    reportId: string
): Promise<string> {
    const key = `reports/${doctorId}/${reportId}.pdf`;
    return uploadToS3(Buffer.from(buffer), key, "application/pdf");
}

export async function getFileFromS3(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
    });

    const response = await s3Client.send(command);
    const stream = response.Body;

    if (!stream) {
        throw new Error("No file body returned from S3");
    }

    const chunks: Uint8Array[] = [];
    // @ts-expect-error - stream is an async iterable in Node.js
    for await (const chunk of stream) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}

export { s3Client, BUCKET };
