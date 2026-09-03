# StudyCraft AI — Interactive AI Study Assistant & Adaptive Quiz Engine

> An interactive, resilient learning platform that converts free-form notes and topics into 3D interactive flashcards, adaptive self-testing quizzes with wrong-answer retesting, and mastery checklists. Built to demonstrate resilient UI architecture over unpredictable AI outputs.

Built for the **Frontend Internship Assignment** (Flam).

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

### 🔑 Environment Variables (Optional)

StudyCraft AI includes an **Intelligent Deterministic Mock Engine** enabled by default. **Zero setup or API keys are required to test all features out of the box.**

If you would like to connect a real LLM provider, copy `.env.example` to `.env.local` and provide your key:

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
# or
GROQ_API_KEY=your_groq_api_key_here
# or
OPENAI_API_KEY=your_openai_api_key_here
```

*Note: In accordance with the assignment requirements, the API key is strictly routed through serverless backend endpoints (`/api/generate` and `/api/refine`) and is NEVER exposed in the client-side JavaScript bundle.*

---

## 💡 What Makes This Not a Chatbot?

Chatbots simply spit out raw streaming text into a chat scroll container. 

StudyCraft AI treats the LLM purely as an **asynchronous structured data extraction engine**:
1. Free-form text or lecture notes are sent to `/api/generate`.
2. The AI returns a strict JSON payload adhering to our validated schema.
3. The client transforms this payload into **interactive, stateful UI blocks**:
   - **🗂️ 3D Perspective Flashcard Deck**: Flip cards with Spacebar or clicks, navigate with arrow keys (`←`, `→`), shuffle, and rate confidence (*Need Practice* vs *Mastered*).
   - **📝 Adaptive Interactive Quiz**: Multiple-choice testing with instant feedback, option letters, and detailed pedagogical explanations.
   - **⚡ "Re-Test Wrong Answers" Mode**: A dedicated workflow that isolates the questions the user got incorrect, resets their choices, and lets them re-test until 100% mastery is achieved.
   - **📋 Concept Mastery Checklist**: Interactive topic checkoffs with live progress bars.
   - **📊 Performance Analytics Dashboard**: Visual breakdown of retention and accuracy.
   - **🔄 Refinement Loop**: Follow-up natural language prompts ("Make questions harder", "Add edge cases") that edit/expand the session without destroying active user progress.

---

## 🛡️ Handling Bad AI Output (The Core Signal)

Handling unpredictable LLM output is the central evaluation criterion of this assignment. StudyCraft AI features a multi-tiered resilience pipeline:

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

### 🧪 Live Evaluator Chaos / Resilience Sandbox

Interviewers and reviewers can test all failure scenarios in real time! Click the **"Resilience Sandbox"** button in the header to trigger:
- **💥 Corrupt JSON**: Injects unclosed braces, dangling commas, and conversational text. The JSON repair pipeline fixes it automatically and displays the diagnostic repair log.
- **⚠️ Wrong Shape / Schema Mismatch**: Injects unexpected keys and missing properties. The Zod healing layer synthesizes valid defaults with zero crashes.
- **⏳ Slow Timeout (8s)**: Tests delayed network responses and verifies the abort/cancel lifecycle.
- **🚫 Server 500 Error**: Simulates upstream failure, displaying the error banner with diagnostic codes and one-click "Retry".
- **⚡ Rapid Race Condition**: Rapidly click different prompts—`AbortController` guarantees that slow earlier requests never overwrite newer active state.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 15 (App Router) + React 19
- **Type Safety**: Strict TypeScript
- **Schema Validation**: Zod runtime parsing & lenient coercion
- **Styling**: Handcrafted modern Vanilla CSS (Glassmorphism, custom 3D flip card transforms, CSS variables, dark/light themes, zero external CSS bloat)
- **State Management**: React Hooks (`useAIGenerator`, `useState`, `useCallback`, `useRef`, `useEffect`) + LocalStorage persistence
- **Icons & Polish**: Lucide React, Canvas Confetti

---

## 🤖 AI Usage Disclosure

In compliance with the assignment instructions:
- **How AI was used**: AI was used as a rapid prototyping accelerator to generate the initial schema definitions and boilerplates for mock topics (photosynthesis, distributed systems, quantum computing). 
- **What was handcrafted & deeply engineered**:
  - The custom dirty JSON repair algorithm and delimiter balancing stack (`jsonRepair.ts`).
  - The Zod lenient schema healing pipeline (`schemaValidator.ts`).
  - The stale-response cancellation architecture using `AbortController` and sequential request counters in `useAIGenerator.ts`.
  - The 3D CSS flip-card perspective system and responsive glassmorphism UI.
  - The wrong-answer filtering and state transitions in `QuizEngine.tsx`.
  - The interactive chaos/resilience sandbox for evaluator testing.

---

## ⏱️ Time Spent Breakdown

| Activity | Time Spent |
| :--- | :--- |
| PDF requirements analysis & architecture planning | 45 mins |
| Backend API routes, multi-model support & mock generator | 1 hr 15 mins |
| Resilient JSON repair, balance parser & Zod schema healing | 1 hr 30 mins |
| 3D Flashcard deck, keyboard shortcuts & mastery ratings | 1 hr |
| Interactive Quiz engine & "Re-test Wrong Answers" mode | 1 hr 15 mins |
| Concepts checklist, refinement loop & session persistence | 45 mins |
| Resilience Sandbox (Chaos tester) & error UI | 45 mins |
| Styling polish, dark/light themes & mobile responsiveness | 45 mins |
| Testing, build validation & documentation | 40 mins |
| **Total Time** | **~8 hours** |

---

## 🚧 Known Limitations & Future Roadmap

1. **Streaming Partial JSON**: Currently, responses are sanitized and repaired as complete chunks. A streaming JSON parser (e.g., using `jsonrepair` stream or OJSON) could render flashcards progressively as each individual card finishes generating.
2. **Audio Pronunciation**: Adding Web Speech API synthesis for flashcard terms to facilitate language learning.
3. **Spaced Repetition Algorithm**: Expanding the "Need Practice" / "Mastered" tags into a full SM-2 (SuperMemo) spaced repetition schedule with review intervals.
