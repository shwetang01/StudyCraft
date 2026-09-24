# StudyCraft AI — Interactive AI Study Assistant & Adaptive Quiz Engine

> An interactive, resilient learning platform that converts free-form notes and topics into 3D interactive flashcards, adaptive self-testing quizzes with wrong-answer retesting, and mastery checklists. Built to demonstrate resilient UI architecture over unpredictable AI outputs.

Built for the **Frontend Internship Assignment** (Flam).

---

## 📹 Screen Recording Demonstration

Per the assignment submission instructions (*"A short screen recording showing the app working"*), a complete animated walkthrough demonstration of the finished application is embedded below and included directly in this repository:

![StudyCraft Interactive Walkthrough Demo](./demo_recording.webp)

*(The demonstration showcases: Dark/Light mode toggle with high-contrast text, the streamlined consumer header, topic synthesis, 3D perspective card flips, keyboard-assisted quiz evaluation with immediate explanations, and the Multi-Block continuous canvas view).*

▶️ **[Direct File Link: demo_recording.webp](./demo_recording.webp)**

---

## 🚀 Quick Start (Local Setup)

The project is configured so running `npm install && npm start` boots the application immediately on `http://localhost:3000`:

```bash
# 1. Install dependencies
npm install

# 2. Start the application
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 🔑 Environment Variables & Model Options

StudyCraft AI includes an **Intelligent Deterministic Mock Engine** enabled by default. **Zero setup or API keys are required to test all features out of the box.**

If you would like to connect a real LLM provider, you have two options:
1. **In-App Modal**: Click the **Key** icon in the header to paste your key directly in the browser (saved in sessionStorage, never committed).
2. **Environment File**: Copy `.env.example` to `.env.local`:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   # or
   GROQ_API_KEY=your_groq_api_key_here
   # or
   OPENAI_API_KEY=your_openai_api_key_here
   ```

*Note: In accordance with the assignment requirements, the API key is strictly routed through serverless backend endpoints (`/api/generate` and `/api/refine`) and is NEVER exposed in the client-side JavaScript bundle.*

---

## 💡 What Makes This Not a Chatbot?

The PDF specifies:
> *"The one firm rule: it can't be a chatbot. The AI should return structured data (e.g. JSON) that your code parses and renders as interactive components; printing the model's raw text in a chat box doesn't meet the requirement."*

StudyCraft AI treats the LLM purely as an **asynchronous structured data extraction engine**:
1. Free-form text or lecture notes are sent to `/api/generate`.
2. The AI returns a strict JSON payload adhering to our validated schema.
3. The client transforms this payload into **interactive, stateful UI blocks**:
   - **🗂️ 3D Perspective Flashcard Deck**: Flip cards with Spacebar or clicks, navigate with arrow keys (`←`, `→`), shuffle, and rate confidence (*Need Practice* vs *Mastered*).
   - **📝 Adaptive Interactive Quiz**: Multiple-choice testing with instant feedback, option letters (`A-D`), keyboard shortcuts (`1-4`, `Enter`), and detailed pedagogical explanations.
   - **⚡ "Re-Test Wrong Answers" Mode**: A dedicated workflow that isolates the questions the user got incorrect, resets their choices, and lets them re-test until 100% mastery is achieved.
   - **📋 Concept Mastery Checklist**: Interactive topic checkoffs with live progress bars.
   - **📊 Performance Analytics Dashboard**: Visual breakdown of retention and accuracy.
   - **🔄 Refinement Loop**: Follow-up natural language prompts ("Make questions harder", "Add edge cases") that edit/expand the session without destroying active user progress.
   - **📑 Multi-Block Canvas**: Toggle between **Tabbed View** and **Full Canvas** (renders all blocks together on one page).

---

## 🛡️ Handling Bad AI Output (The Core Signal — 20% Weight)

Handling unpredictable LLM output is the central evaluation criterion of this assignment:
> *"Handles the model returning bad output — malformed JSON, wrong shape, empty, slow, or failed. No crashes; show an error or a retry; don't let a stale response overwrite a newer one. Most of the signal is in that point."*

StudyCraft AI features a multi-tiered resilience pipeline:

```
Raw AI Output (Conversational, Truncated, or Markdown)
                       │
                       ▼
         [ Tier 1: JSON Extractor & Sanitizer ]
         - Strips markdown fences (```json ... ```)
         - Discards conversational preambles/postambles
         - Normalizes single-quoted keys and trailing commas
                       │
                       ▼
          [ Tier 2: Truncation & Token Healing ]
         - Detects unterminated strings from token limits
         - Balances unclosed brackets/braces via stack tracking
         - Recovers partial valid JSON arrays
                       │
                       ▼
         [ Tier 3: Zod Schema Validation & Healing ]
         - Guarantees non-null, strictly typed UI props
         - Clamps out-of-bounds `correctAnswerIndex`
         - Injects sensible fallback values if fields are missing
                       │
                       ▼
         [ Tier 4: Client Stale Request Shield ]
         - AbortController cancels obsolete requests
         - Monotonic request IDs prevent race conditions
                       │
                       ▼
             100% Crash-Proof React UI
```

### 🛡️ How Bad AI Output Is Handled Under the Hood

StudyCraft AI was architected from the ground up to guarantee a zero-crash UI when dealing with unpredictable LLM responses:

- **Corrupt JSON & Markdown Clutter**: Strips conversational preambles/postambles and markdown fences, repairs trailing commas, and balances unclosed brackets and braces (`src/lib/jsonRepair.ts`).
- **Wrong Shape & Missing Fields**: Validates data with Zod schemas and heals unexpected or incomplete structures with synthesized fallbacks (`src/lib/schemaValidator.ts`).
- **Slow Responses**: Includes a dynamic progress ticker and an active **"Cancel Request"** button that halts pending requests via `AbortController`.
- **Server Failures (500s / Disconnections)**: Displays a clear error banner with diagnostic codes and an instant one-click "Retry" mechanism.
- **Race Conditions**: Uses monotonic request ID tracking to ensure older, slower network responses never overwrite newer user requests.

---

## 📊 Evaluation Rubric Alignment

| Area (from PDF) | Weight | How It Is Achieved in StudyCraft |
| :--- | :--- | :--- |
| **React & Frontend Architecture** | **25%** | Custom hooks (`useAIGenerator`), clean separation of concerns, strict TypeScript interfaces, memoized callbacks, no unnecessary re-renders. |
| **AI Integration & Data Handling** | **25%** | Server-side API endpoints (`/api/generate` and `/api/refine`), strict system prompting, structured JSON schema parsing, multi-model support (Gemini, Groq, OpenAI). |
| **Handling Bad AI Output** | **20%** | Multi-tier pipeline (`jsonRepair.ts` + `schemaValidator.ts`), dirty JSON balancing, Zod schema healing, stale request cancellation, and crash-proof defaults. |
| **UI/UX & Product Sense** | **15%** | 3D CSS perspective card flips, tactile Web Audio sound effects, dark/light mode, full keyboard navigation (Space, arrows, 1-4, Enter), mobile responsiveness. |
| **Communication & Understanding** | **15%** | Comprehensive documentation, clean architectural separation, clear commit history with structured milestones (`git log --oneline`). |

---

## 🏛️ System Architecture & Tech Stack

StudyCraft is structured as a **decoupled, event-driven React client with a resilient serverless AI gateway**. Every component is designed around fault isolation, unidirectional state flow, and deterministic UI rendering.

### 📐 End-to-End Architectural Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER (React 19)                                   │
│                                                                                             │
│   [ User Input / Presets ] ───► useAIGenerator Hook                                         │
│                                      │                                                      │
│                                      ├─► AbortController (Cancels stale in-flight requests) │
│                                      ├─► Request ID Sequencer (Prevents race conditions)    │
│                                      └─► LocalStorage Syncer (Persists active sessions)     │
└──────────────────────────────────────┬──────────────────────────────────────────────────────┘
                                       │ POST { prompt, simulationMode }
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           SERVERLESS API GATEWAY (Next.js 15 App Router)                    │
│                                                                                             │
│   /api/generate  &  /api/refine                                                             │
│   ├── Key Isolation: LLM secrets remain on the server; never exposed to browser bundles      │
│   └── Multi-Provider Router: Gemini 2.5 Flash / Groq Llama 3 / OpenAI GPT-4o / Local Engine │
└──────────────────────────────────────┬──────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                         DEFENSIVE INGESTION & DATA REPAIR PIPELINE                          │
│                                                                                             │
│   1. Markdown Fence Stripper  ──► Removes ```json fences & conversational preambles         │
│   2. Dirty JSON Repair Stack  ──► Auto-balances unclosed delimiters & trims trailing commas │
│   3. Zod Schema Validation    ──► Type-checks & auto-heals missing keys or corrupt indices  │
└──────────────────────────────────────┬──────────────────────────────────────────────────────┘
                                       │ Validated & Healed StudySession JSON
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                             INTERACTIVE STATEFUL UI BLOCKS                                  │
│                                                                                             │
│   ├── FlashcardDeck.tsx      ──► 3D hardware-accelerated CSS perspective & Spacebar flips   │
│   ├── QuizEngine.tsx         ──► Keyboard selection (1-4, Enter) & wrong-answer re-testing  │
│   ├── ConceptsChecklist.tsx  ──► Milestone tracking & completion percentage calculation     │
│   └── soundEffects.ts        ──► Zero-latency synthesized Web Audio sound synthesizer       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 📂 Directory Structure & Module Responsibilities

```
StudyCraft/
├── public/
│   └── demo_recording.webp       # Demonstration recording for evaluators
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/route.ts # Serverless POST endpoint for full session synthesis
│   │   │   └── refine/route.ts   # Serverless POST endpoint for iterative session mutation
│   │   ├── globals.css           # Vanilla CSS tokens, 3D perspective, light/dark themes
│   │   ├── layout.tsx            # Root HTML metadata, font configuration, ambient backdrops
│   │   └── page.tsx              # Root orchestration view: Tabbed vs Full Canvas coordinator
│   ├── components/
│   │   ├── ApiKeyModal.tsx       # In-browser evaluator modal for custom LLM key testing
│   │   ├── ConceptsChecklist.tsx # Interactive checkable topic mastery checklist
│   │   ├── FlashcardDeck.tsx     # 3D interactive flip deck with arrow key navigation
│   │   ├── Header.tsx            # Consumer navigation, theme switcher, sound & history controls
│   │   ├── InputSection.tsx      # Prompt textarea, curated preset chips, character counter
│   │   ├── QuizEngine.tsx        # Adaptive testing, keyboard shortcuts, Re-Test Wrong Answers
│   │   ├── RefinementInput.tsx   # Follow-up conversational prompt interface
│   │   └── SavedSessionsModal.tsx# LocalStorage history viewer and session restore drawer
│   ├── hooks/
│   │   └── useAIGenerator.ts     # Generation state machine, AbortController, persistence
│   └── lib/
│       ├── aiProvider.ts         # Multi-LLM caller & intelligent deterministic mock engine
│       ├── jsonRepair.ts         # Delimiter balancing stack & malformed JSON sanitizer
│       ├── schemaValidator.ts    # Zod runtime parsing & schema auto-healing defaults
│       ├── soundEffects.ts       # Synthesized Web Audio API sound generator
│       └── types.ts              # Strict TypeScript domain models & request contracts
├── package.json                  # Next 15, React 19, Zod, Lucide, Canvas Confetti
└── README.md                     # Complete project documentation & audit guide
```

---

### ⚙️ Technology Stack Justification

| Technology | Role | Why It Was Chosen |
| :--- | :--- | :--- |
| **Next.js 15 (App Router)** | Framework | Provides high-performance React Server Components and native serverless route handlers (`/api/*`), fulfilling the core assignment mandate that API keys must never be shipped to the client browser. |
| **React 19** | View Layer | Functional components and modern React hooks (`useState`, `useCallback`, `useRef`, `useEffect`) manage localized interactive state across multiple independent blocks without requiring heavyweight global store libraries like Redux. |
| **Strict TypeScript** | Type Safety | Enforces strict domain contracts for `StudySession`, `Flashcard`, and `QuizQuestion`. Guarantees compile-time consistency across API payloads and React prop trees. |
| **Zod** | Runtime Validation | AI model outputs cannot be verified by compile-time TypeScript alone. Zod provides dynamic runtime parsing with custom lenient coercion, guaranteeing zero undefined property access crashes in the UI. |
| **Handcrafted Vanilla CSS** | Styling System | Avoids CSS framework bloat and provides granular control over hardware-accelerated 3D perspective transforms (`perspective: 1400px; transform-style: preserve-3d; backface-visibility: hidden;`), glassmorphism filters, and CSS custom property theme swapping. |
| **Web Audio API** | Audio Feedback | Eliminates external MP3 asset downloads. Synthesizes frequencies programmatically (e.g. 523Hz card flips, 880Hz chime, 220Hz low tone) in real time with zero network overhead. |
| **Lucide React** | Iconography | Clean, feather-weight SVG icon set matching modern educational design aesthetics. |

---

### 💡 Core Architectural Decisions

1. **Server-Side API Key Protection**:
   The LLM provider call is routed exclusively through `/api/generate` and `/api/refine`. Even if a client configures their own key via the in-app settings modal, the key is passed inside the POST request body to the serverless function, processed server-side, and never logged or included in bundled client assets.
2. **Deterministic Fallback Engine**:
   To ensure immediate evaluation without requiring developers to register API accounts or purchase credits, the backend features an intelligent fallback engine that returns structured, curriculum-accurate study sets for topics like Distributed Systems, Cellular Biology, and Quantum Computing.
3. **Stale Request Cancellation**:
   When users rapidly click different topics or submit follow-up prompts, previous network connections are aborted via `AbortController.abort()`. Coupled with a monotonic request counter (`latestRequestIdRef`), late-arriving responses are automatically dropped, preventing out-of-order state corruption.
4. **Wrong-Answer Sub-Quiz Isolation**:
   Rather than merely resetting the whole quiz, the application isolates the specific question IDs answered incorrectly into an active subset, recalculates passing scores, and rewards the user with celebratory confetti once 100% mastery is attained.

---

## 🤖 AI Usage Disclosure

In compliance with the assignment instructions (*"Add a short note in your README on what you used AI for — being honest about it counts in your favor"*):
- **How AI was used**: AI was used as a rapid prototyping accelerator to generate the initial TypeScript schema definitions and mock study topics (cellular biology, distributed systems, quantum computing).
- **What was handcrafted & deeply engineered**:
  - The custom dirty JSON repair algorithm and delimiter balancing stack (`src/lib/jsonRepair.ts`).
  - The Zod lenient schema healing pipeline (`src/lib/schemaValidator.ts`).
  - The stale-response cancellation architecture using `AbortController` and sequential request counters in `src/hooks/useAIGenerator.ts`.
  - The 3D CSS flip-card perspective system and responsive glassmorphism UI in `src/app/globals.css`.
  - The wrong-answer filtering and state transitions in `src/components/QuizEngine.tsx`.
  - The Web Audio synthesizer in `src/lib/soundEffects.ts`.

---

## ⏱️ Time Spent Breakdown

Aim was for ~8 hours total:

| Activity | Time Spent |
| :--- | :--- |
| PDF requirements analysis & architecture planning | 45 mins |
| Backend API routes, multi-model support & mock generator | 1 hr 15 mins |
| Resilient JSON repair, balance parser & Zod schema healing | 1 hr 30 mins |
| 3D Flashcard deck, keyboard shortcuts & mastery ratings | 1 hr |
| Interactive Quiz engine & "Re-test Wrong Answers" mode | 1 hr 15 mins |
| Concepts checklist, refinement loop & session persistence | 45 mins |
| Error boundary UI, cancellation ticker & retry handling | 45 mins |
| High-contrast styling polish, dark/light themes & mobile responsiveness | 45 mins |
| Sound effects synthesizer & browser verification | 30 mins |
| Documentation, screen recording & git commits | 30 mins |
| **Total Time** | **~8 hours** |

---

## 🎯 Interview Walkthrough & Pairing Guide

Page 4 of the PDF states:
> *"If your submission moves forward, expect to demo it, walk through your code, review a short AI-generated snippet, fix a bug we introduce, and add a small feature."*

### Key Code Locations for Walkthrough:
1. **Handling Malformed JSON**: Inspect [src/lib/jsonRepair.ts](file:///c:/Users/Shwetang/Downloads/Flam_Frontend/src/lib/jsonRepair.ts). Walk through `extractAndRepairJson()` and `balanceUnclosedJson()`—shows how stack-based tracking auto-closes dangling quotes, braces, and brackets when token limits truncate the response.
2. **Schema Healing**: Inspect [src/lib/schemaValidator.ts](file:///c:/Users/Shwetang/Downloads/Flam_Frontend/src/lib/schemaValidator.ts). Walk through `validateAndHealAIOutput()`—demonstrates how missing options or out-of-bounds indices are clamped and defaulted so the React tree never crashes.
3. **Race Condition Prevention**: Inspect [src/hooks/useAIGenerator.ts](file:///c:/Users/Shwetang/Downloads/Flam_Frontend/src/hooks/useAIGenerator.ts). Walk through `activeAbortControllerRef` and `latestRequestIdRef`—proves that when users rapidly type or click presets, previous slower requests are aborted and discarded.
4. **"Re-Test Wrong Answers"**: Inspect [src/components/QuizEngine.tsx](file:///c:/Users/Shwetang/Downloads/Flam_Frontend/src/components/QuizEngine.tsx). Walk through `handleStartRetestWrongAnswers()`—shows how wrong questions are filtered into `activeSet` with reset answer states.

---

## 🚧 Known Limitations & What I'd Do Next

1. **Streaming Partial JSON**: Currently, responses are sanitized and repaired as complete chunks. A streaming JSON parser (e.g., using an incremental stream decoder) could render flashcards progressively as each individual card finishes generating.
2. **Spaced Repetition Algorithm**: Expanding the "Need Practice" / "Mastered" tags into a full SM-2 (SuperMemo) spaced repetition schedule with review intervals over multiple days.
3. **Audio Pronunciation**: Adding Web Speech API speech synthesis for flashcard terms to facilitate language learning.
