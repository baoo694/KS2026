# Quizlet Clone - Project Plan

> **Project Type:** WEB (Next.js App Router)  
> **Primary Agent:** `frontend-specialist`  
> **Created:** 2026-02-04

---

## Overview

A comprehensive flashcard study application with 4 learning modes:

- **Flashcard Mode** - 3D flip cards with keyboard navigation
- **Learn Mode** - Spaced repetition with multiple choice
- **Test Mode** - Multi-format exam generator with grading
- **Match Game** - Timed memory matching game

**Key Decisions:**
| Item | Decision |
|------|----------|
| Persistence | Supabase (PostgreSQL + Auth-ready) |
| Data Source | Full CRUD + CSV Import |
| Routing | Separate routes per mode |
| Responsive | Desktop-first, mobile-friendly |

---

## Success Criteria

| Criteria                      | Metric                                           |
| ----------------------------- | ------------------------------------------------ |
| Flashcard 3D flip works       | CSS transform with smooth animation              |
| Keyboard shortcuts functional | Spacebar, Arrows respond correctly               |
| Learn Mode logic accurate     | Correct cards → Mastered, Wrong → Learning queue |
| Test grading works            | Written answers normalized, score calculated     |
| Match Game timer functional   | Stopwatch + 1s penalty on miss                   |
| CRUD operations work          | Create, Read, Update, Delete study sets          |
| CSV Import works              | Parse valid CSV, create flashcards               |
| Mobile touch-friendly         | 44px+ touch targets, responsive grid             |

---

## Tech Stack

| Layer      | Technology                  | Rationale                                  |
| ---------- | --------------------------- | ------------------------------------------ |
| Framework  | Next.js 15 (App Router)     | Server components, routing, code splitting |
| Language   | TypeScript                  | Type safety for flashcard interfaces       |
| Styling    | Tailwind CSS v4             | Rapid prototyping, responsive utilities    |
| Icons      | Lucide React                | Modern, tree-shakeable icons               |
| State      | React Context + Local State | Simple, no external deps needed            |
| Database   | Supabase (PostgreSQL)       | Real persistence, easy setup, RLS          |
| Deployment | Vercel                      | Native Next.js hosting                     |

---

## File Structure

```
QuizzletPKA/
├── .agent/                    # [EXISTS] Agent configuration
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with nav
│   │   ├── page.tsx           # Homepage (list study sets)
│   │   ├── globals.css        # Tailwind + custom CSS
│   │   ├── sets/
│   │   │   ├── page.tsx       # Study sets list
│   │   │   ├── new/
│   │   │   │   └── page.tsx   # Create new set
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Set overview
│   │   │       ├── edit/
│   │   │       │   └── page.tsx  # Edit set
│   │   │       ├── flashcards/
│   │   │       │   └── page.tsx  # Feature A: Flashcard Mode
│   │   │       ├── learn/
│   │   │       │   └── page.tsx  # Feature B: Learn Mode
│   │   │       ├── test/
│   │   │       │   └── page.tsx  # Feature C: Test Mode
│   │   │       └── match/
│   │   │            └── page.tsx # Feature D: Match Game
│   │   └── api/
│   │       └── import/
│   │           └── route.ts   # CSV import endpoint
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── ProgressCircle.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Navigation.tsx
│   │   ├── flashcard/
│   │   │   ├── FlashcardDeck.tsx      # Main flashcard mode controller
│   │   │   ├── FlashcardItem.tsx      # 3D flip card component
│   │   │   └── FlashcardControls.tsx  # Prev/Next/Shuffle controls
│   │   ├── learn/
│   │   │   ├── LearnMode.tsx          # Learn mode controller
│   │   │   ├── QuestionCard.tsx       # Question display
│   │   │   └── AnswerOptions.tsx      # Multiple choice options
│   │   ├── test/
│   │   │   ├── TestSetup.tsx          # Test configuration
│   │   │   ├── TestRunner.tsx         # Active test state
│   │   │   ├── QuestionRenderer.tsx   # Renders different Q types
│   │   │   └── TestResults.tsx        # Score display
│   │   ├── match/
│   │   │   ├── MatchGame.tsx          # Game controller
│   │   │   ├── MatchGrid.tsx          # 4x3 responsive grid
│   │   │   ├── MatchCard.tsx          # Individual tile
│   │   │   └── GameTimer.tsx          # Stopwatch + penalty
│   │   └── sets/
│   │       ├── StudySetForm.tsx       # Create/Edit form
│   │       ├── FlashcardEditor.tsx    # Add/Edit flashcards
│   │       ├── CSVImporter.tsx        # CSV upload component
│   │       └── StudySetCard.tsx       # Set preview card
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Supabase browser client
│   │   │   ├── server.ts              # Supabase server client
│   │   │   └── types.ts               # Database types
│   │   ├── utils/
│   │   │   ├── shuffle.ts             # Fisher-Yates algorithm
│   │   │   ├── normalize.ts           # String normalization for grading
│   │   │   └── csv-parser.ts          # CSV parsing utility
│   │   └── hooks/
│   │       ├── useFlashcards.ts       # Flashcard data hook
│   │       ├── useKeyboard.ts         # Keyboard shortcuts
│   │       └── useTimer.ts            # Stopwatch hook
│   └── types/
│       └── index.ts                   # Core interfaces (Flashcard, StudySet)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql     # Database schema
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## Database Schema (Supabase)

```sql
-- Study Sets table
CREATE TABLE study_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flashcards table
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_set_id UUID REFERENCES study_sets(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'mastered')),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_flashcards_study_set ON flashcards(study_set_id);
CREATE INDEX idx_flashcards_status ON flashcards(status);
```

---

## Task Breakdown

### Phase 1: Foundation (P0)

#### Task 1.1: Initialize Next.js Project

- **Agent:** `frontend-specialist`
- **INPUT:** Empty directory
- **OUTPUT:** Next.js 15 app with TypeScript, Tailwind CSS, Lucide React
- **VERIFY:** `npm run dev` starts without errors

#### Task 1.2: Setup Supabase

- **Agent:** `frontend-specialist`
- **INPUT:** Supabase project credentials
- **OUTPUT:** `lib/supabase/client.ts`, `lib/supabase/server.ts`, env variables
- **VERIFY:** Supabase client connects successfully

#### Task 1.3: Create Database Schema

- **Agent:** `frontend-specialist`
- **INPUT:** Schema design above
- **OUTPUT:** Migration file applied to Supabase
- **VERIFY:** Tables visible in Supabase dashboard

#### Task 1.4: Define TypeScript Types

- **Agent:** `frontend-specialist`
- **INPUT:** Database schema
- **OUTPUT:** `types/index.ts` with `Flashcard`, `StudySet` interfaces
- **VERIFY:** Types compile, match schema

#### Task 1.5: Create Layout & Navigation

- **Agent:** `frontend-specialist`
- **INPUT:** App structure
- **OUTPUT:** Root layout, Header, responsive Navigation
- **VERIFY:** All routes accessible, mobile nav works

---

### Phase 2: Data Layer - CRUD (P1)

#### Task 2.1: StudySet CRUD Operations

- **Agent:** `frontend-specialist`
- **Skill:** `api-patterns`
- **INPUT:** Supabase client
- **OUTPUT:** Server actions for Create, Read, Update, Delete study sets
- **VERIFY:** All operations work via Supabase dashboard

#### Task 2.2: Flashcard CRUD Operations

- **Agent:** `frontend-specialist`
- **INPUT:** Supabase client
- **OUTPUT:** Server actions for flashcard management
- **VERIFY:** Cards can be added, edited, reordered, deleted

#### Task 2.3: Study Set List Page

- **Agent:** `frontend-specialist`
- **INPUT:** CRUD operations
- **OUTPUT:** `/sets` page with cards, create button, delete option
- **VERIFY:** Sets display, can navigate to each set

#### Task 2.4: Create/Edit Study Set UI

- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **INPUT:** CRUD operations
- **OUTPUT:** `/sets/new` and `/sets/[id]/edit` with form + flashcard editor
- **VERIFY:** Can create set with cards, edit existing sets

#### Task 2.5: CSV Import Feature

- **Agent:** `frontend-specialist`
- **INPUT:** CSV format (term, definition per line)
- **OUTPUT:** `CSVImporter` component, `/api/import` route
- **VERIFY:** Upload CSV → flashcards created correctly

---

### Phase 3: Core Features (P2)

#### Task 3.1: Feature A - Flashcard Mode

- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **INPUT:** Flashcard data
- **OUTPUT:**
  - `FlashcardItem.tsx` with 3D CSS flip animation
  - `FlashcardControls.tsx` with Prev/Next/Shuffle
  - `FlashcardDeck.tsx` controller with progress bar
  - Keyboard shortcuts (Space, Left, Right arrows)
- **VERIFY:**
  - Card flips with smooth 3D animation
  - Progress bar shows "5/20" format
  - Shuffle uses Fisher-Yates algorithm
  - Keyboard shortcuts work on desktop

#### Task 3.2: Feature B - Learn Mode

- **Agent:** `frontend-specialist`
- **INPUT:** Flashcard data
- **OUTPUT:**
  - Queue management (new → learning → mastered)
  - `QuestionCard` showing Term
  - `AnswerOptions` with 4 choices (1 correct + 3 distractors)
  - Green/Red animations for feedback
  - Progress circle (New vs Learning vs Mastered)
- **VERIFY:**
  - Correct answer → green animation → mastered
  - Wrong answer → red animation → back to learning queue
  - Distractors are random from other cards
  - Progress circle updates

#### Task 3.3: Feature C - Test Mode

- **Agent:** `frontend-specialist`
- **INPUT:** Flashcard data
- **OUTPUT:**
  - `TestSetup` for question count and types selection
  - Question generation logic:
    - Multiple Choice: 1 Term vs 4 Definitions
    - True/False: 50% correct pair, 50% wrong pair
    - Written: Text input for definition
  - `TestResults` with score calculation
  - Written answer validation (trim, lowercase, normalize)
- **VERIFY:**
  - Can configure test parameters
  - Each question type works correctly
  - Written answers graded leniently
  - Score calculated and displayed

#### Task 3.4: Feature D - Match Game

- **Agent:** `frontend-specialist`
- **INPUT:** 6 random flashcard pairs
- **OUTPUT:**
  - `MatchGrid` - 4x3 responsive grid (adjusts on mobile)
  - `MatchCard` tiles with select state
  - Match logic: same ID → fade out
  - Miss logic: shake animation (red) → deselect
  - `GameTimer` stopwatch + 1s penalty on miss
- **VERIFY:**
  - 12 tiles (6 terms + 6 definitions) shuffled
  - Matching pair fades out
  - Wrong pair shakes
  - Timer runs, penalty applied
  - Game ends when all matched

---

### Phase 4: Polish & Responsive (P3)

#### Task 4.1: Responsive Adjustments

- **Agent:** `frontend-specialist`
- **INPUT:** Existing components
- **OUTPUT:**
  - Match Game grid: 4x3 → 3x4 → 2x6 based on viewport
  - Touch targets ≥ 44px
  - Hide keyboard shortcut hints on touch devices
- **VERIFY:** Test on mobile viewport, all interactive

#### Task 4.2: Accessibility Audit

- **Agent:** `frontend-specialist`
- **INPUT:** Complete app
- **OUTPUT:** ARIA labels, focus states, color contrast
- **VERIFY:** Run UX audit script, no critical issues

#### Task 4.3: Performance Optimization

- **Agent:** `frontend-specialist`
- **Skill:** `performance-profiling`
- **INPUT:** Complete app
- **OUTPUT:** Code splitting, lazy loading mode pages
- **VERIFY:** Lighthouse performance > 90

---

## Phase X: Final Verification

> 🔴 Execute these BEFORE marking complete:

### Pre-Verification Setup

```bash
# Install dependencies
npm install

# Apply Supabase migrations
npx supabase db push

# Start dev server
npm run dev
```

### Automated Checks

```bash
# 1. Lint & Type Check
npm run lint && npx tsc --noEmit

# 2. Build Check
npm run build

# 3. Security Scan (if available)
python .agent/skills/vulnerability-scanner/scripts/security_scan.py .

# 4. UX Audit
python .agent/skills/frontend-design/scripts/ux_audit.py .

# 5. Lighthouse Audit (with dev server running)
python .agent/skills/performance-profiling/scripts/lighthouse_audit.py http://localhost:3000
```

### Manual Verification Checklist

- [ ] Create a study set with 10+ flashcards
- [ ] Flashcard Mode: Flip works, keyboard shortcuts work, shuffle works
- [ ] Learn Mode: Correct → mastered, Wrong → learning queue reappears
- [ ] Test Mode: All 3 question types work, written answer graded leniently
- [ ] Match Game: Timer runs, matches fade, misses shake + penalty
- [ ] CSV Import: Upload valid CSV, cards created
- [ ] Mobile: Touch targets ≥ 44px, grid responsive
- [ ] No purple/violet colors used (per design rules)

### User Acceptance Testing

| Feature            | Test Steps                    | Expected Result                         |
| ------------------ | ----------------------------- | --------------------------------------- |
| Flashcard Flip     | Click card, press Space       | Card shows back, flips on either action |
| Keyboard Nav       | Press Left/Right arrows       | Previous/Next card shown                |
| Learn Wrong Answer | Click wrong option            | Red animation, card reappears later     |
| Test Written       | Type answer with extra spaces | Should match if content correct         |
| Match Penalty      | Click two non-matching tiles  | Timer increases by 1 second             |

---

## Risk Mitigation

| Risk                           | Mitigation                                     |
| ------------------------------ | ---------------------------------------------- |
| Supabase rate limits           | Cache frequently accessed sets client-side     |
| 3D flip not smooth             | Test on low-end devices, simplify if needed    |
| Fisher-Yates incorrect         | Unit test the shuffle function                 |
| Written answer false negatives | Normalize: trim, lowercase, remove punctuation |

---

## Estimated Timeline

| Phase                 | Estimated Duration |
| --------------------- | ------------------ |
| Phase 1: Foundation   | ~1 hour            |
| Phase 2: CRUD         | ~1.5 hours         |
| Phase 3: Features     | ~3 hours           |
| Phase 4: Polish       | ~1 hour            |
| Phase X: Verification | ~30 min            |
| **Total**             | **~7 hours**       |

---

## Next Steps After Approval

1. Run `npx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir`
2. Install dependencies: `lucide-react`, `@supabase/supabase-js`
3. Begin Phase 1 implementation

> ⚠️ **Awaiting your approval to proceed with implementation.**
