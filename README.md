# RecruLens — Explainable Talent Intelligence & Semantic Matching

> An AI-powered recruitment platform that enables transparent candidate matching, explainable evidence extraction, bias-safe evaluation, and structured hiring pipelines. Built for the **RC3 Web App Development Competition**.

---

## 🌐 Live Production Deployment
- **Live URL:** **[https://recrulens.vercel.app](https://recrulens.vercel.app)**
- **Status:** 🟢 Production Ready (Deployed on Vercel with Global CDN Edge Routing)

---

## ⚡ Quick Start (No Install Needed, Node.js 18+)

RecruLens ships with a prebuilt production distribution in `app/dist` and a zero-dependency server:

```bash
cd app
node serve.mjs
```

Open your browser to: **[http://localhost:4173](http://localhost:4173)**

---

## 💻 Development & Build

```bash
# 1. Install dependencies
cd app
npm install

# 2. Run local development server (with HMR)
npm run dev
# Running at http://localhost:5173

# 3. Compile production build
npm run build

# 4. Run automated Playwright smoke tests
node ../scripts/smoke.mjs
```

---

## 🔑 Environment Variables & AI Configuration
**No environment variables or API keys are required.**  
RecruLens contains a built-in deterministic NLP rule engine for requirement extraction and candidate scoring that works 100% offline.

### Optional Live AI:
- Google Gemini API can be configured in **Settings** (`/settings`) or via `.env`:
  ```env
  VITE_GEMINI_API_KEY=your_gemini_api_key_here
  ```
- Supports real-time LLM job extraction and structured interview generation.
- **Graceful Fallback:** If the key is unset, rate-limited, or offline, the app automatically switches to its local semantic engine without interruption.

---

## 🌟 Key Features & Problem Statement Coverage

| Category | Implemented Features | Rubric Marks |
|---|---|---|
| **Architecture & Completeness** | Hash-based SPA, responsive at 375/768/1440px, role switching (Recruiter vs Candidate), full localStorage persistence + demo data reset. | **30 Marks** |
| **AI Matching & Scoring Quality** | Strict 4-component rubric: **50% Skills (weighted), 25% Experience, 15% Project Relevance, 10% Qualifications**. Semantic synonym normalization, verified quote extraction, and human score overrides. | **25 Marks** |
| **Pipeline & Audit Trail** | 7-stage interactive Kanban: *Submitted → Parsed → AI Assessed → Recruiter Review → Shortlisted → Interview → Selected*. Immutable audit logging and confidential recruiter notes. | **15 Marks** |
| **Interview & Analytics** | 3-tier question generation (beginner, intermediate, advanced) tailored to candidate projects with answer rubrics; interview calendar conflict detection; analytics on common skill deficits. | **15 Marks** |
| **Testing, Security & Offline** | 100% offline bundled fonts/icons, input sanitization, Playwright smoke tests (`scripts/smoke.mjs`). | **15 Marks** |

---

## 🎬 3-Minute Demonstration Walkthrough

1. **Job Posting with AI Extraction (`/jobs/new`):** Paste a free-text job description for a Backend Developer. Click *"Extract Requirements with AI"* to automatically parse Python, Django, PostgreSQL, and Docker with importance weights.
2. **Explainable Candidate Matching (`/candidates`):** Review 3 applicants ranked by match percentage (Alex Rivera 92%, Marcus Chen 74%, Priya Sharma 61%).
3. **Evidence Grounding Inspection:** Click *"Inspect Evidence"* on Alex Rivera to view exact quote chips from his resume justifying his 92% score, distinguish missing evidence from confirmed absence, and test human-in-the-loop manual score override.
4. **Hiring Pipeline Progression (`/pipeline`):** Advance shortlisted candidates across the 7-stage Kanban board and inspect the append-only audit trail.
5. **Interview Scheduling (`/interviews`):** Generate project-specific technical questions with expected answer criteria.
6. **Analytics & Candidate Portal (`/analytics` & `/portal`):** View aggregate skill gaps across applicants and toggle to Candidate Mode to preview the applicant experience.

---

## 👥 Team RC3
- **Zaid (Lead & Integrator):** Core architecture, semantic matching engine, AI job extraction, pipeline Kanban, audit trail, packaging, and tests.
- **Abdul Wahab (Experience Owner):** Design tokens, candidate portal, resume upload component, interview scheduling, analytics, and presentation coaching.

---

## 📜 Credits & Licenses
- **Typography:** Inter & Fraunces (OFL, bundled offline via `@fontsource`).
- **Icons:** Lucide React (ISC).
- **Framework:** React 18, Vite 6, Tailwind CSS v4.
