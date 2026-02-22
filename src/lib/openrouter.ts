import OpenAI from "openai";

/* ============================================================
   ENV REQUIRED

   OPENROUTER_API_KEY=your_key_here
   OPENROUTER_SITE_URL=http://localhost:3000
   OPENROUTER_SITE_NAME=PulseLog
============================================================ */

/* ============================================================
   OpenRouter Client (DeepSeek Free Only)
============================================================ */

const openrouter = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY!,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer":
            process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
        "X-Title":
            process.env.OPENROUTER_SITE_NAME || "PulseLog",
    },
});

/* ============================================================
   MODEL (FREE)
============================================================ */

const EXTRACTION_MODEL = "deepseek/deepseek-r1-0528:free";

/* ============================================================
   MEDICAL DATA TYPE
============================================================ */

export interface MedicalData {
    symptoms: string[];
    observations: string[];
    diagnosis: string;
    prescribed_medicines: {
        name: string;
        dosage: string;
        duration: string;
    }[];
    doctor_notes: string;
}

const EMPTY_DATA: MedicalData = {
    symptoms: [],
    observations: [],
    diagnosis: "",
    prescribed_medicines: [],
    doctor_notes: "",
};

/* ============================================================
   STRICT PROMPT (DeepSeek-Optimized)
============================================================ */

const SYSTEM_PROMPT = `
You are a strict medical information extraction engine.

RULES:
- Return ONLY valid JSON.
- No markdown.
- No explanation.
- No commentary.
- No text before or after JSON.
- Extract ONLY explicitly stated information.
- If not present, return empty values.

Return EXACTLY this structure:

{
  "symptoms": [],
  "observations": [],
  "diagnosis": "",
  "prescribed_medicines": [
    {"name": "", "dosage": "", "duration": ""}
  ],
  "doctor_notes": ""
}
`;

/* ============================================================
   SAFE JSON PARSER (Prevents "<!DOCTYPE" crash)
============================================================ */

function safeParseJSON(raw: string): Record<string, unknown> | null {
    if (!raw) return null;

    // If response starts with HTML, reject immediately
    if (raw.trim().startsWith("<!DOCTYPE")) {
        console.error("Received HTML instead of JSON.");
        return null;
    }

    let cleaned = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```$/i, "");

    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) cleaned = match[0];

    cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");

    try {
        return JSON.parse(cleaned);
    } catch {
        return null;
    }
}

/* ============================================================
   VALIDATION
============================================================ */

function validateMedicalData(raw: Record<string, any>): MedicalData {
    return {
        symptoms: Array.isArray(raw.symptoms)
            ? raw.symptoms.filter((s) => typeof s === "string")
            : [],
        observations: Array.isArray(raw.observations)
            ? raw.observations.filter((o) => typeof o === "string")
            : [],
        diagnosis:
            typeof raw.diagnosis === "string" ? raw.diagnosis : "",
        prescribed_medicines: Array.isArray(raw.prescribed_medicines)
            ? raw.prescribed_medicines.map((m: any) => ({
                name: typeof m?.name === "string" ? m.name : "",
                dosage: typeof m?.dosage === "string" ? m.dosage : "",
                duration:
                    typeof m?.duration === "string" ? m.duration : "",
            }))
            : [],
        doctor_notes:
            typeof raw.doctor_notes === "string"
                ? raw.doctor_notes
                : "",
    };
}

/* ============================================================
   EXTRACTION FUNCTION (DeepSeek Free)
============================================================ */

export async function extractMedicalData(
    transcription: string
): Promise<MedicalData> {

    if (!transcription || transcription.trim().length < 10) {
        console.warn("Transcript too short.");
        return { ...EMPTY_DATA };
    }

    console.log("Using model:", EXTRACTION_MODEL);

    try {
        const response = await openrouter.chat.completions.create({
            model: EXTRACTION_MODEL,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: transcription }
            ],
            temperature: 0,
            top_p: 0,
            max_tokens: 1200,
        });

        const content =
            response.choices?.[0]?.message?.content || "";

        if (!content) {
            console.error("Empty response from OpenRouter.");
            return { ...EMPTY_DATA };
        }

        const parsed = safeParseJSON(content);

        if (!parsed) {
            console.error("JSON parsing failed. Raw output:");
            console.error(content);
            return { ...EMPTY_DATA };
        }

        return validateMedicalData(parsed);

    } catch (error: any) {

        console.error(
            "OpenRouter API error:",
            error?.response?.data || error.message
        );

        return { ...EMPTY_DATA };
    }
}

export default openrouter;