# RECRUITLENS - TEAM WORK DIVISION & STATUS

**Platform Name:** RecruLens  
**Tagline:** Explainable Talent Intelligence & Semantic Candidate Matching

---

## 🎯 CURRENT STATUS (Zaid's Branch)
- ✅ Foundation committed & merged from Abdul-Wahab branch
- 🔄 Currently improving: UI/UX drastically with professional Linear + Vercel aesthetics
- 🔜 Next: Push UI improvements to GitHub, then merge Abdul-Wahab's features

---

## 👨‍💻 Zaid (Person A - Lead & Integrator):

### Ownership Areas:
1. **Shared Infrastructure**: Data types (`app/src/types/index.ts`), routes (`app/src/app/routes.tsx`), navigation (`app/src/app/nav.ts`)
2. **Job Management** (`app/src/features/jobs/`): All job CRUD operations, AI requirements extractor
3. **Matching Engine** (`app/src/features/matching/`): Candidate matching, explainable scoring, skill gap analysis
4. **Application Pipeline** (`app/src/features/pipeline/`): 7-stage Kanban board, audit trail, recruiter workflow
5. **AI Integration** (`app/src/lib/ai/`): Gemini API integration with local fallbacks
6. **Testing & Packaging** (`scripts/smoke.mjs`, documentation, final submission package

### Current Focus (Priority 1):
- Fix any build issues after merging Abdul-Wahab's code
- Final testing and QA before feature freeze

---

## 👨‍💻 Abdul Wahab (Person B - Experience & Design Owner):

### Ownership Areas:
1. **Design System & Brand** (`app/src/styles/index.css`): All Tailwind v4 tokens, brand colors, fonts, animations
2. **Resume Features** (`app/src/features/resumes/`): PDF upload, parsing, skill normalization, resume viewer
3. **Candidate Portal** (`app/src/features/candidate-portal/`): Job browsing, application tracker, candidate-facing screens
4. **Interview System** (`app/src/features/interviews/`): Question generator, scheduling, feedback forms
5. **Analytics Dashboard** (`app/src/features/analytics/`): Recruitment metrics, funnel charts, skill gaps
6. **Talent Intelligence** (`app/src/features/intelligence/`): NL search, duplicate detection, comparison views
7. **Seed Data B** (`app/src/data/seed.b.ts`): Resumes, candidates, interview data
8. **Presentation Coach** (`DEMO_SCRIPT.md`, `PROJECT_EXPLAINED.md`, demo scripting

### Current Status:
- ✅ All Package B features completed and pushed to origin/Abdul-Wahab branch
- ⏳ Waiting for: Merge into main branch, focus on UI polish and animations

---

## 📁 File Ownership Matrix (STRICT - NEVER CROSS EDIT)

| Folder/File | Owner | Purpose |
|---|---|---|
| `app/src/app/nav.ts` | Zaid | Navigation wiring |
| `app/src/app/routes.tsx` | Zaid | Route definitions |
| `app/src/types/index.ts` | Zaid | Shared TypeScript types |
| `app/src/lib/auth.ts` | Zaid | Authentication logic |
| `app/src/lib/storage.ts` | Zaid | localStorage layer |
| `app/src/lib/ai/*.ts` | Zaid | All AI integration files |
| `app/src/features/jobs/**` | Zaid | Job posting & management |
| `app/src/features/matching/**` | Zaid | Candidate matching engine |
| `app/src/features/pipeline/**` | Zaid | Hiring pipeline/Kanban |
| `app/src/data/seed.a.ts` | Zaid | Jobs seed data |
| `app/src/features/resumes/**` | **Abdul Wahab** | Resume upload & parsing |
| `app/src/features/candidate-portal/**` | **Abdul Wahab** | Candidate portal screens |
| `app/src/features/interviews/**` | **Abdul Wahab** | Interview scheduling |
| `app/src/features/analytics/**` | **Abdul Wahab** | Analytics dashboards |
| `app/src/features/intelligence/**` | **Abdul Wahab** | NL search & comparisons |
| `app/src/data/seed.b.ts` | **Abdul Wahab** | Candidates & resumes seed |
| `app/src/styles/index.css` | **Abdul Wahab** | ALL design tokens & animations |
| `app/src/components/ui/**` | **Abdul Wahab** | All shared UI components |
| `app/src/pages/Home.tsx` | **Abdul Wahab** | Main dashboard screen |

---

## 🔄 Git Workflow (Branch Strategy)

### Zaid's Process:
```bash
git checkout Zaid
git pull origin Zaid
# Implement Package A features, test locally
git add app/
git commit -m "feat(A): <description>"
git push origin Zaid
```

### Abdul Wahab's Process:
```bash
git checkout Abdul-Wahab
git pull origin Abdul-Wahab
# Implement Package B features, test locally  
git add app/
git commit -m "feat(B): <description>"
git push origin Abdul-Wahab
```

### Sync Protocol (Both):
At scheduled checkpoints (~45% of T, ~70% of T):
1. Both fetch latest: `git fetch origin`
2. Zaid pulls Abdul-Wahab: `git pull origin Abdul-Wahab` into main
3. Test merged app builds
4. Push main: `git push origin main`
5. Pull main into respective branches

---

## 🕐 Clock Schedule (Today's Timeline)

| Time | Event | Responsible |
|------|-------|-------------|
| **10:10** | Competition Start | Both start work |
| **10:30** | Foundation Ready | Zaid pushes foundation |
| **11:00** | First Checkpoint | Merge Abdul-Wahab's features |
| **11:45** | Core Features Complete | Both packages built |
| **12:30** | Second Checkpoint | Signature feature merged |
| **13:00** | UI/UX Pass | Abdul Wahab global polish |
| **13:30** | FEATURE FREEZE | No new features after this |
| **13:30-14:10** | Bug fixes & Packaging | Only A commits |
| **14:10** | HARD DEADLINE | Submission due |

**Note:** Break window: none (no break configured)

---

## 🎨 Design Tokens (Current Style Guide)

**Brand Identity**: RecruLens - Professional tech recruitment platform
**Style Reference**: Linear + Vercel aesthetic
**Primary Colors**:
- Primary: `var(--color-brand-600)` (#0d9488) - Teal
- Accent: `var(--color-accent-600)` (#d97706) - Amber
- Background: `var(--color-canvas)` (#f7f7f5) - Off-white
- Surface: `var(--color-surface)` (#ffffff) - Pure white
- Ink: `var(--color-ink)` (#17201f) - Dark charcoal

**Typography**:
- Display: Fraunces Variable (headings, logo)
- Sans: Inter Variable (body text, UI)
- Scale: 2xl → xs (1.5rem → 0.75rem)

**Animations**:
- Fade up: 220ms ease-out
- Shimmer loading states
- Smooth transitions everywhere
- Respect prefers-reduced-motion

---

## 🚫 IMPORTANT RULES FOR BOTH DEVS

1. **NEVER edit partner's files** - work around them, use TEAM_NOTES.md
2. **Build must pass always** - `npm run build` before every commit
3. **Check repo clean** - `node scripts/check-repo-clean.mjs` before every commit
4. **No fake features** - all implemented features must work end-to-end
5. **Data persists** - use storage layer, never lose data on refresh
6. **Offline safe** - no CDN dependencies, remote fonts blocked
7. **Professional names** - never use "App Name", always "RecruLens"

---

## 📢 Communication Channel (Human Relays)

Add requests/tasks here for your partner to pick up:

**From Zaid to Abdul Wahab:**
- [ ] Finish UI/UX polish on analytics dashboard
- [ ] Ensure all component interactions feel smooth and polished

**From Abdul Wahab to Zaid:**
- [ ] No pending items at moment

---

*Last Updated: During UI/UX improvement phase*
