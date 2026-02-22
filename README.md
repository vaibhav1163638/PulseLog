# MediScribe AI

> AI-Powered Doctor–Patient Conversation Analyzer & Medical Report Generator

MediScribe AI is a secure HealthTech SaaS platform that records doctor-patient conversations, converts speech to text using OpenAI Whisper, extracts structured medical information using GPT-4o, and generates professional PDF prescriptions.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/UI
- **Backend:** Next.js API Routes, Server Actions
- **Auth:** Auth.js v5 (NextAuth) — Google OAuth only, JWT strategy
- **AI:** OpenAI API (Whisper + GPT-4o)
- **Database:** MongoDB Atlas + Mongoose
- **PDF:** pdf-lib (server-side generation)
- **Storage:** AWS S3

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone <repo-url>
cd mediscribe-ai
npm install
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Set Application type: **Web application**
6. Add **Authorized redirect URIs:**
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-domain.com/api/auth/callback/google` (prod)
7. Copy the Client ID and Client Secret

### 3. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or use `0.0.0.0/0` for Vercel)
5. Get your connection string

### 4. OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Ensure you have access to `whisper-1` and `gpt-4o` models
4. Add billing information if needed

### 5. AWS S3 Setup

1. Go to [AWS Console](https://aws.amazon.com/console/)
2. Create an S3 bucket (e.g., `mediscribe-ai`)
3. Create an IAM user with S3 access
4. Get Access Key ID and Secret Access Key
5. Configure bucket CORS if needed

### 6. Environment Variables

Copy the `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in all values:

```env
AUTH_SECRET=<generate with: npx auth secret>
AUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=<your-google-client-id>
AUTH_GOOGLE_SECRET=<your-google-client-secret>
MONGODB_URI=<your-mongodb-uri>
OPENAI_API_KEY=<your-openai-key>
AWS_ACCESS_KEY_ID=<your-aws-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
AWS_REGION=us-east-1
AWS_S3_BUCKET=mediscribe-ai
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Set `AUTH_URL` to your Vercel domain
5. Update Google OAuth redirect URI to your Vercel domain
6. Deploy

---

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Auth.js handler
│   │   ├── dashboard/    # Dashboard stats
│   │   ├── patients/     # Patient CRUD
│   │   ├── reports/      # Report CRUD + PDF
│   │   ├── settings/     # User settings
│   │   └── transcribe/   # AI pipeline
│   ├── admin/            # Admin page
│   ├── consultation/     # Consultation flow
│   ├── dashboard/        # Dashboard
│   ├── login/            # Auth page
│   ├── patients/         # Patient history
│   ├── settings/         # Settings page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── consultation/     # Consultation components
│   ├── layout/           # Layout components
│   ├── ui/               # Shadcn/UI primitives
│   └── providers.tsx     # Session provider
├── lib/
│   ├── db/               # Database connection
│   ├── auth.ts           # Auth.js config
│   ├── openai.ts         # AI integration
│   ├── pdf.ts            # PDF generation
│   ├── rate-limit.ts     # Rate limiter
│   ├── s3.ts             # S3 storage
│   ├── utils.ts          # Utilities
│   └── validations.ts    # Zod schemas
├── models/               # Mongoose models
├── middleware.ts          # Route protection
└── types/                # TypeScript types
```

---

## Features

- ✅ Google OAuth authentication (no passwords)
- ✅ Audio recording with MediaRecorder API
- ✅ OpenAI Whisper transcription
- ✅ GPT-4o structured medical data extraction
- ✅ Editable reports with doctor approval
- ✅ Professional PDF prescription generation
- ✅ Patient history with search
- ✅ Role-based access control
- ✅ Rate-limited AI endpoints
- ✅ Middleware-protected routes

## License

MIT
