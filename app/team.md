# TEAM INSTRUCTIONS & TASK DIVISION

Welcome Abdul Wahab! Zaid is working via Antigravity on branch `Zaid`, and you are working via Qoder on branch `Abdul-Wahab`.
All instructions, roles, file ownership, and shared data contracts are established below so we never conflict and can merge effortlessly.

---

## 1. Quick Summary of What We Are Building
**Platform Name:** RecruLens  
**Tagline:** Explainable Talent Intelligence & Semantic Candidate Matching  
**Problem Statement:** AI-powered recruitment platform with semantic candidate matching, explainable scoring, resume parsing, interview generation/scheduling, and recruitment analytics.

---

## 2. Who Owns What

### 👨‍💻 Zaid (Person A - Lead & Integrator):
- Shared foundation: Data types (`app/src/types/index.ts`), routes (`app/src/app/routes.tsx`), nav (`app/src/app/nav.ts`), session auth (`app/src/lib/auth.ts`).
- Job Management & AI Requirements Extractor (`app/src/features/jobs/`).
- Candidate Matching Engine with Explainable Scoring & Skill Gap Inspector (`app/src/features/matching/`).
- Application Pipeline with 7-Stage State Machine & Audit Trail (`app/src/features/pipeline/`).
- Automated tests (`scripts/smoke.mjs`), final packaging, and git integration.

### 👨‍💻 Abdul Wahab (Person B - Experience & Partner Owner):
- Design System & Brand Styling (`app/src/styles/index.css`, UI theme tokens, icons, AppShell layout visuals).
- Resume Upload & Parsing Component with PDF support (`app/src/features/resumes/`).
- Candidate Portal: Candidate Profile, Browse Jobs, 1-Click Apply, and Live Application Tracker (`app/src/features/candidate-portal/`).
- Interview Question Generator (3 tiers + candidate project questions + answer guidelines) and Interview Scheduler with conflict detection (`app/src/features/interviews/`).
- Recruitment Analytics Dashboard with stage funnel & skill deficit charts (`app/src/features/analytics/`).
- Advanced Talent Intelligence (Natural-language talent search bar, duplicate detection with human merge, candidate side-by-side comparison) (`app/src/features/intelligence/`).
- Presentation coaching & documentation (`DEMO_SCRIPT.md`, `PROJECT_EXPLAINED.md`).

---

## 3. Strict Folder Ownership (NEVER edit Zaid's files, Zaid won't edit yours)

| Folder | Owner | Notes |
|---|---|---|
| `app/src/features/resumes/**` | **Abdul Wahab** | Resume uploader, parsed skills tagger, synonym normalizer |
| `app/src/features/candidate-portal/**` | **Abdul Wahab** | Candidate job browsing, application status tracker |
| `app/src/features/interviews/**` | **Abdul Wahab** | Question generator, schedule calendar, feedback form |
| `app/src/features/analytics/**` | **Abdul Wahab** | Metric cards, charts, skill gap bar chart |
| `app/src/features/intelligence/**` | **Abdul Wahab** | Natural language search, duplicate merge modal, comparison |
| `app/src/data/seed.b.ts` | **Abdul Wahab** | Put your seed resumes, mock candidates, and interviews here |
| `app/src/styles/**` | **Abdul Wahab** | Tailwind v4 tokens, brand colors, fonts |
| `app/src/components/ui/**` | **Abdul Wahab** | Shared UI components |
| `app/src/features/jobs/**` | **Zaid** | Jobs CRUD & AI extractor |
| `app/src/features/matching/**` | **Zaid** | Matching & explainability engine |
| `app/src/features/pipeline/**` | **Zaid** | Pipeline Kanban & audit trail |

---

## 4. Git Workflow For Abdul Wahab
1. In your terminal, fetch origin and pull the foundation:
   ```bash
   git fetch origin
   git checkout Abdul-Wahab
   git merge origin/main
   ```
2. Build your components inside your assigned feature directories.
3. Before committing, always run:
   ```bash
   npm run build
   ```
4. Commit and push only to your branch:
   ```bash
   git add app/
   git commit -m "feat(B): <what you built>"
   git push origin Abdul-Wahab
   ```
5. Merge with `main` at scheduled checkpoints or ask Zaid to merge your branch into `main`.

---

## 5. Clock & Schedule
- **10:10:** Competition Start
- **10:35:** Foundation ready on `main` (Zaid)
- **11:30:** First checkpoint — Core Job Posting & Resume Uploading working
- **12:30:** Second checkpoint — Matching Engine & Interview Scheduling working
- **13:10:** Third checkpoint — Analytics, NL Search, and Polish
- **13:30:** **FEATURE FREEZE** (Only bug fixes and styling polish)
- **14:10:** Final submission deadline!

---

## 6. CURRENT STATUS & MERGE PROTOCOL (updated by Zaid)

Both branches are synced with `main` as of the latest merge. **Build passes.**

### Merge rules (avoid losing work)
1. Never force-push. Never rewrite pushed history.
2. Always `git fetch origin` before pushing; if rejected, `git merge origin/main` and resolve.
3. Conflict in a file you own → keep yours. In your partner's file → keep theirs, re-apply your intent elsewhere.
4. After resolving: `cd app && npm run build` must pass, then push.
5. Keep `app/team.md` updated when ownership shifts.

### Motion system (available to both — do not duplicate)
Defined in `app/src/styles/index.css` + `app/src/components/ui/Motion.tsx`:
- Route transition: `PageTransition` (already wired in `App.tsx`)
- Scroll progress bar: `ScrollProgress` (already wired in `AppShell`)
- Scroll reveal: `<Reveal delay={ms}>…</Reveal>`
- Animated counter: `<AnimatedNumber value={n} suffix="%" />`
- CSS classes: `stagger` (container), `hover-lift`, `sheen`, `tilt-hover`, `animate-pop`, `animate-float`, `animate-breathe`, `animate-gradient-text`, `animate-gradient-surface`, `aurora-blob`, `page-enter`
- Loaders: `LoadingSpinner`, `LoadingState`, `DotsLoader` in `components/ui/States.tsx`
- Reduced motion is handled globally.

### UI/UX asks for Abdul Wahab
- [ ] Adopt the `JobsPage` hero pattern (aurora + gradient title) on Analytics / Interviews / Intelligence headers.
- [ ] Replace remaining `bg-blue-600` primary buttons with `bg-brand-600`.
- [ ] Use `LoadingState`/`LoadingSpinner` instead of any generic spinners.
- [ ] Keep custom SVG icons in `components/ui/CustomIcons.tsx` wired into new screens.

### UI/UX asks for Zaid
- (none pending — motion + shell nav fix complete)

---

## 7. HARDENING PASS (Zaid — latest)

Pull `main` before touching any of these files; they were fixed against real judge flows:

- `lib/resumeText.ts` (**new**): dependency-free PDF (FlateDecode + Tj/TJ) and DOCX (ZIP + `word/document.xml`) text extraction, fully offline.
- `features/resumes/ResumeUploader.tsx`: real parsing (no mock profiles, no fabricated emails/phones), skill alias normalization, location + education cleanup, drag-and-drop, keyboard activation, 5 MB/format validation, "no readable text" error for scanned PDFs.
- `features/resumes/ResumeIntakePage.tsx` (**new**) + route `/resumes`: uploader now saves parsed candidates to the candidate pool and persists. Old `ResumeUploadPage.tsx` mock was deleted; `ResumesPage.tsx` is unused legacy (safe to remove later).
- `features/candidate-portal/CandidatePortalPage.tsx`: 1-Click Apply now stores `matchScore` + `scoreBreakdown` and uses the profile email (was leaving pipeline cards unscored).
- `features/pipeline/PipelinePage.tsx`: cards compute a live score/breakdown when an application has no stored one instead of showing a fake `75%`; shows "Unscored" only when impossible.
- `features/interviews/InterviewsPage.tsx`: fixed modal candidate/job state initialising empty (Generate Questions / Confirm Schedule were dead buttons on fresh mounts); active-id fallback now used. Overlap-based conflict detection retained.
- `features/analytics/AnalyticsPage.tsx`: funnel is now monotonic by stage rank (was 60% → 80% drops); completed interviews count toward the funnel; export button reports "Report Downloaded".
- `features/intelligence/IntelligencePage.tsx`: merge now repoints applications from the discarded profile to the kept one.
- `features/intelligence/CandidateComparisonModal.tsx`: prefers stored per-application breakdowns so comparisons match pipeline/analytics scores.

Verification: `scripts/smoke.mjs` extended to 15 journeys (job AI extract, resume TXT intake, pipeline advance + audit, review shortlist, overlap conflict, portal apply scoring, export download, NL search + blind mode, 375px overflow). Latest run 15/15 PASS. `node scripts/audit.mjs` → **0 critical / 0 high / 0 medium** (lows are dense-dashboard 11px labels).


