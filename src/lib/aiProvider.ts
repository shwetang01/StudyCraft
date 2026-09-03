import { extractAndRepairJson } from './jsonRepair';
import { validateAndHealAIOutput } from './schemaValidator';
import { GenerateRequestBody, RefineRequestBody, StudySession, ApiResponse } from './types';

const SYSTEM_PROMPT = `
You are an expert educational curriculum architect.
Your task is to analyze study notes or a topic and convert them into a structured interactive learning package.

You MUST reply ONLY with a valid JSON object matching this schema:
{
  "title": "Concise title of the study guide",
  "topic": "The central topic name",
  "summary": "A 2-3 sentence engaging overview of the core subject matter",
  "keyConcepts": [
    {
      "id": "unique_string",
      "concept": "Name of concept",
      "summary": "Brief 1-sentence explanation"
    }
  ],
  "flashcards": [
    {
      "id": "card_1",
      "front": "Clear question, prompt, or term on the front",
      "back": "Accurate, concise, informative answer on the back",
      "category": "Category or Sub-topic",
      "difficulty": "easy" | "medium" | "hard"
    }
  ],
  "quiz": [
    {
      "id": "quiz_1",
      "question": "A clear multiple-choice question testing understanding (not trivial trivia)",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "Clear explanation of why this answer is correct and others are not"
    }
  ]
}

Ensure:
- flashcards have at least 4 to 8 cards.
- quiz has at least 4 to 6 questions.
- keyConcepts has at least 3 to 5 core items.
- Output MUST be pure JSON with NO markdown formatting, NO conversational text.
`;

export async function generateStudySession(
  body: GenerateRequestBody
): Promise<ApiResponse<StudySession>> {
  const startTime = Date.now();
  const { prompt, options, simulationMode } = body;

  // 1. Handle Evaluator Chaos / Failure Simulation Modes
  if (simulationMode === 'server_500') {
    return {
      success: false,
      error: {
        code: 'SIMULATED_INTERNAL_SERVER_ERROR',
        message: 'Simulated 500 Server Error: The upstream AI inference worker encountered an unhandled exception.',
        canAutoRepair: false,
      },
    };
  }

  if (simulationMode === 'slow_timeout') {
    // Artificial 8-second delay to test client timeout or abort
    await new Promise((resolve) => setTimeout(resolve, 8000));
  }

  // Check for available real API keys
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  let rawContent = '';
  let modelUsed = 'Intelligent Deterministic Mock Engine';

  // If simulation requested malformed JSON or schema mismatch, inject immediately
  if (simulationMode === 'malformed_json') {
    rawContent = `Here is your JSON output:
\`\`\`json
{
  "title": "Cellular Biology (Corrupt Output Simulation)",
  "topic": "Biology",
  "summary": "This is a simulated broken output with dangling comma and unclosed braces",
  "keyConcepts": [
    {"concept": "Mitochondria", "summary": "Energy powerhouse"},
  ],
  "flashcards": [
    {"front": "What is ATP?", "back": "Adenosine Triphosphate", "category": "Energy", "difficulty": "easy"}
\`\`\``;
    modelUsed = 'Chaos Simulator (Malformed JSON)';
  } else if (simulationMode === 'schema_mismatch') {
    rawContent = JSON.stringify({
      unexpectedKey: 'This does not match standard shape',
      topic: prompt.slice(0, 30),
      // Missing flashcards, missing quiz, invalid index
      randomNotes: ['Some loose string notes'],
    });
    modelUsed = 'Chaos Simulator (Schema Mismatch)';
  } else if (geminiKey) {
    try {
      const response = await callGeminiApi(prompt, geminiKey, options);
      rawContent = response;
      modelUsed = 'Google Gemini 2.0 / 1.5 Flash';
    } catch (err) {
      console.warn('Gemini API call failed, falling back to intelligent generator:', err);
      rawContent = generateRealisticMockResponse(prompt, options);
      modelUsed = 'Intelligent Fallback Engine (Gemini Quota/Error)';
    }
  } else if (groqKey) {
    try {
      const response = await callGroqApi(prompt, groqKey, options);
      rawContent = response;
      modelUsed = 'Groq Llama-3.3-70b';
    } catch (err) {
      console.warn('Groq API call failed, falling back to intelligent generator:', err);
      rawContent = generateRealisticMockResponse(prompt, options);
      modelUsed = 'Intelligent Fallback Engine (Groq Error)';
    }
  } else if (openaiKey) {
    try {
      const response = await callOpenAiApi(prompt, openaiKey, options);
      rawContent = response;
      modelUsed = 'OpenAI GPT-4o-mini';
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to intelligent generator:', err);
      rawContent = generateRealisticMockResponse(prompt, options);
      modelUsed = 'Intelligent Fallback Engine (OpenAI Error)';
    }
  } else {
    // Zero-config instant mock generator (provides rich real-time experience out of the box)
    // Small artificial delay for natural UX feeling (800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));
    rawContent = generateRealisticMockResponse(prompt, options);
  }

  // 2. Resilient JSON Extraction & Repair Pipeline
  let parsedJson: unknown;
  let wasRepaired = false;
  let repairNotes: string[] = [];

  try {
    const repairResult = extractAndRepairJson(rawContent);
    parsedJson = repairResult.parsed;
    wasRepaired = repairResult.wasRepaired;
    repairNotes = repairResult.notes;
  } catch (parseError) {
    return {
      success: false,
      error: {
        code: 'MALFORMED_JSON_PARSE_FAILED',
        message: (parseError as Error).message,
        rawSnippet: rawContent.slice(0, 300),
        canAutoRepair: true,
      },
    };
  }

  // 3. Zod Schema Validation & Graceful Healing
  try {
    const topicFallback = prompt.split('\n')[0].replace(/[^a-zA-Z0-9 ]/g, '').trim().slice(0, 40) || 'Study Guide';
    const { session, warnings } = validateAndHealAIOutput(parsedJson, topicFallback);

    if (warnings.length > 0) {
      wasRepaired = true;
      repairNotes.push(...warnings);
    }

    return {
      success: true,
      data: session,
      meta: {
        modelUsed,
        durationMs: Date.now() - startTime,
        wasRepaired,
        repairNotes,
      },
    };
  } catch (schemaError) {
    return {
      success: false,
      error: {
        code: 'SCHEMA_HEALING_FAILED',
        message: (schemaError as Error).message,
        rawSnippet: JSON.stringify(parsedJson).slice(0, 300),
        canAutoRepair: true,
      },
    };
  }
}

export async function refineStudySession(
  body: RefineRequestBody
): Promise<ApiResponse<StudySession>> {
  const startTime = Date.now();
  const { currentSession, refinementInstruction, simulationMode } = body;

  if (simulationMode === 'server_500') {
    return {
      success: false,
      error: {
        code: 'SIMULATED_REFINEMENT_ERROR',
        message: 'Simulated 500: Follow-up refinement worker failed.',
        canAutoRepair: false,
      },
    };
  }

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();

  let rawContent = '';
  let modelUsed = 'Intelligent Refinement Engine';

  const refinePrompt = `
Existing Study Session Data:
${JSON.stringify({
  title: currentSession.title,
  topic: currentSession.topic,
  summary: currentSession.summary,
  keyConcepts: currentSession.keyConcepts,
  flashcards: currentSession.flashcards.map((f) => ({ front: f.front, back: f.back, category: f.category, difficulty: f.difficulty })),
  quiz: currentSession.quiz.map((q) => ({ question: q.question, options: q.options, correctAnswerIndex: q.correctAnswerIndex, explanation: q.explanation })),
})}

User Refinement Request:
"${refinementInstruction}"

Please update, expand, or adjust the study session according to the user's instructions.
Return the updated complete JSON object strictly matching the schema.
`;

  if (geminiKey) {
    try {
      rawContent = await callGeminiApi(refinePrompt, geminiKey);
      modelUsed = 'Google Gemini (Refinement)';
    } catch {
      rawContent = applyMockRefinement(currentSession, refinementInstruction);
    }
  } else if (groqKey) {
    try {
      rawContent = await callGroqApi(refinePrompt, groqKey);
      modelUsed = 'Groq Llama-3.3 (Refinement)';
    } catch {
      rawContent = applyMockRefinement(currentSession, refinementInstruction);
    }
  } else {
    await new Promise((r) => setTimeout(r, 700));
    rawContent = applyMockRefinement(currentSession, refinementInstruction);
  }

  const repairResult = extractAndRepairJson(rawContent);
  const { session, warnings } = validateAndHealAIOutput(repairResult.parsed, currentSession.topic);

  // Preserve original user progress on cards that weren't changed
  const cardStatusMap = new Map(currentSession.flashcards.map((c) => [c.front.toLowerCase().trim(), c.userStatus]));
  session.flashcards.forEach((c) => {
    const existingStatus = cardStatusMap.get(c.front.toLowerCase().trim());
    if (existingStatus) c.userStatus = existingStatus;
  });

  return {
    success: true,
    data: session,
    meta: {
      modelUsed,
      durationMs: Date.now() - startTime,
      wasRepaired: repairResult.wasRepaired || warnings.length > 0,
      repairNotes: [...repairResult.notes, ...warnings],
    },
  };
}

// ================= API CALL IMPLEMENTATIONS =================

async function callGeminiApi(prompt: string, apiKey: string, options?: GenerateRequestBody['options']): Promise<string> {
  // Using Gemini REST API with system instructions
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Input / Topic / Notes:\n${prompt}` }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const json = await response.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty text candidate received from Gemini');
  return text;
}

async function callGroqApi(prompt: string, apiKey: string, options?: GenerateRequestBody['options']): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error (${response.status}): ${err}`);
  }

  const json = await response.json();
  return json?.choices?.[0]?.message?.content || '';
}

async function callOpenAiApi(prompt: string, apiKey: string, options?: GenerateRequestBody['options']): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${err}`);
  }

  const json = await response.json();
  return json?.choices?.[0]?.message?.content || '';
}

// ================= INTELLIGENT MOCK / FALLBACK ENGINE =================

function generateRealisticMockResponse(prompt: string, options?: GenerateRequestBody['options']): string {
  const lower = prompt.toLowerCase();

  // 1. Photosynthesis & Biology
  if (lower.includes('photo') || lower.includes('cell') || lower.includes('bio') || lower.includes('plant')) {
    return JSON.stringify({
      title: 'Photosynthesis & Cellular Respiration Mastery Guide',
      topic: 'Cellular Biology & Bioenergetics',
      summary: 'Explore the fundamental biochemical engines of life: converting solar radiant energy into chemical glucose via chloroplasts, and converting glucose into cellular ATP through mitochondrial respiration.',
      keyConcepts: [
        { id: 'c1', concept: 'Light-Dependent Reactions', summary: 'Occur in the thylakoid membranes, utilizing photons to split water, release oxygen, and generate ATP and NADPH.' },
        { id: 'c2', concept: 'Calvin Cycle (Light-Independent)', summary: 'Operates in the stroma, using CO2, ATP, and NADPH to synthesize glucose via RuBisCO carbon fixation.' },
        { id: 'c3', concept: 'Cellular Respiration Stages', summary: 'Glycolysis in cytoplasm, Krebs cycle in mitochondrial matrix, and Oxidative Phosphorylation on the inner membrane.' },
        { id: 'c4', concept: 'ATP Synthase Chemiosmosis', summary: 'Proton gradient across the inner membrane drives the rotational engine of ATP synthase to yield ~30-32 ATP per glucose.' }
      ],
      flashcards: [
        { id: 'fc1', front: 'Where do the light-dependent reactions of photosynthesis take place?', back: 'In the thylakoid membranes of chloroplasts.', category: 'Chloroplast Anatomy', difficulty: 'easy' },
        { id: 'fc2', front: 'What molecule acts as the primary electron donor in photosystem II?', back: 'Water (H2O), which photolytically splits into protons, electrons, and oxygen gas (O2).', category: 'Biochemistry', difficulty: 'medium' },
        { id: 'fc3', front: 'What is the key enzyme responsible for carbon fixation in the Calvin Cycle?', back: 'RuBisCO (Ribulose-1,5-bisphosphate carboxylase-oxygenase).', category: 'Enzymology', difficulty: 'medium' },
        { id: 'fc4', front: 'How does the net ATP yield of anaerobic glycolysis compare to aerobic respiration?', back: 'Anaerobic glycolysis produces 2 net ATP per glucose, while aerobic cellular respiration generates approximately 30-32 ATP.', category: 'Bioenergetics', difficulty: 'hard' },
        { id: 'fc5', front: 'What is the role of NADP+ in photosynthesis?', back: 'It serves as the terminal electron acceptor in the light reactions, being reduced to NADPH.', category: 'Electron Transport', difficulty: 'medium' },
        { id: 'fc6', front: 'Where is the proton gradient established during oxidative phosphorylation?', back: 'In the intermembrane space of mitochondria, pumping protons from the matrix.', category: 'Mitochondria', difficulty: 'hard' }
      ],
      quiz: [
        {
          id: 'q1',
          question: 'What is the primary gaseous byproduct released during the light reactions of photosynthesis?',
          options: ['Carbon dioxide (CO2)', 'Oxygen (O2)', 'Methane (CH4)', 'Nitrogen (N2)'],
          correctAnswerIndex: 1,
          explanation: 'Oxygen is released as a byproduct when water molecules (H2O) are split by photolysis in Photosystem II.'
        },
        {
          id: 'q2',
          question: 'In which cellular compartment does glycolysis take place?',
          options: ['Mitochondrial matrix', 'Inner mitochondrial membrane', 'Cytoplasm (Cytosol)', 'Endoplasmic reticulum'],
          correctAnswerIndex: 2,
          explanation: 'Glycolysis is the anaerobic breakdown of glucose that occurs directly in the cytosol of the cell.'
        },
        {
          id: 'q3',
          question: 'What happens to pyruvate before it can enter the citric acid (Krebs) cycle?',
          options: ['It is converted into Acetyl-CoA and CO2', 'It is reduced directly into lactic acid', 'It is polymerized into glycogen', 'It binds to RuBisCO'],
          correctAnswerIndex: 0,
          explanation: 'Pyruvate dehydrogenase converts 3-carbon pyruvate into 2-carbon Acetyl-CoA while releasing CO2 and NADH.'
        },
        {
          id: 'q4',
          question: 'Which of the following creates the proton motive force driving ATP synthase?',
          options: ['Osmotic pressure from sucrose', 'Active pumping of H+ across a membrane by the electron transport chain', 'Spontaneous hydrolysis of ADP', 'Centrifugal force inside ribosomes'],
          correctAnswerIndex: 1,
          explanation: 'Electrons flowing down the electron transport chain power transmembrane protein complexes to pump H+ ions, establishing a steep electrochemical proton gradient.'
        }
      ]
    });
  }

  // 2. System Design & Distributed Systems / Computer Science
  if (lower.includes('system') || lower.includes('cach') || lower.includes('database') || lower.includes('distribut') || lower.includes('api') || lower.includes('network')) {
    return JSON.stringify({
      title: 'Distributed Systems & Caching Architecture',
      topic: 'Computer Science & System Design',
      summary: 'A deep dive into high-availability architecture, caching topologies, the CAP theorem trade-offs, and horizontal scalability patterns for modern cloud infrastructure.',
      keyConcepts: [
        { id: 'c1', concept: 'CAP Theorem', summary: 'A distributed system can guarantee at most two of Consistency, Availability, and Partition Tolerance.' },
        { id: 'c2', concept: 'Cache Invalidation Strategies', summary: 'Write-through, Write-around, and Write-back caching patterns with TTL and LRU eviction.' },
        { id: 'c3', concept: 'Consistent Hashing', summary: 'Minimizes key reorganization when scaling cluster nodes horizontally using a ring topology with virtual nodes.' },
        { id: 'c4', concept: 'Idempotency in Distributed APIs', summary: 'Ensures duplicate retried network requests produce the exact same system state without double-processing.' }
      ],
      flashcards: [
        { id: 'fc1', front: 'What is the primary difference between Strong Consistency and Eventual Consistency?', back: 'Strong consistency guarantees all readers see the latest write immediately; eventual consistency guarantees all nodes converge after a time delay if no new updates occur.', category: 'Consistency Models', difficulty: 'medium' },
        { id: 'fc2', front: 'How does Consistent Hashing avoid mass cache invalidation during node addition/removal?', back: 'It maps both keys and servers to a virtual 360-degree hash ring. Adding/removing a node only affects adjacent keys, moving an average of K/N keys.', category: 'Load Balancing', difficulty: 'hard' },
        { id: 'fc3', front: 'What is a Cache Stampede (Thundering Herd)?', back: 'A phenomenon where a popular cached key expires, causing hundreds of concurrent requests to hit the database simultaneously.', category: 'Caching Patterns', difficulty: 'medium' },
        { id: 'fc4', front: 'Explain the difference between Write-Through and Write-Back caching.', back: 'Write-Through writes synchronously to cache and DB simultaneously; Write-Back writes to cache immediately and flushes asynchronously to DB in batches.', category: 'Storage Layers', difficulty: 'hard' },
        { id: 'fc5', front: 'What is an Idempotency Key in HTTP APIs?', back: 'A unique client-provided UUID attached to mutating requests (e.g. POST /payments) allowing the server to safely detect and discard retries.', category: 'API Design', difficulty: 'easy' },
        { id: 'fc6', front: 'What role does a Read Replica serve in database scalability?', back: 'It offloads read-heavy queries from the primary write master node via asynchronous replication log streaming.', category: 'Databases', difficulty: 'easy' }
      ],
      quiz: [
        {
          id: 'q1',
          question: 'Under network partition (P) in CAP theorem, a system that rejects writes to preserve data correctness chooses which guarantee?',
          options: ['Consistency over Availability (CP)', 'Availability over Consistency (AP)', 'Partition Tolerance omission', 'Zero Latency'],
          correctAnswerIndex: 0,
          explanation: 'When a network split occurs, refusing to accept conflicting writes prioritizes Consistency (CP) over Availability.'
        },
        {
          id: 'q2',
          question: 'Which cache eviction policy discards the items that have not been accessed for the longest duration?',
          options: ['FIFO (First In, First Out)', 'LFU (Least Frequently Used)', 'LRU (Least Recently Used)', 'Random Eviction'],
          correctAnswerIndex: 2,
          explanation: 'LRU (Least Recently Used) tracks access timestamps or uses a doubly linked list + hash map to evict the oldest unaccessed item.'
        },
        {
          id: 'q3',
          question: 'What is the main danger of a Write-Back (Write-Behind) cache policy?',
          options: ['Extremely slow write throughput', 'Risk of data loss if the cache node crashes before flushing to permanent storage', 'High network latency on client read requests', 'Immediate database deadlock'],
          correctAnswerIndex: 1,
          explanation: 'Because updates are held in volatile memory before reaching persistent disks, an ungraceful server crash can cause uncommitted writes to be lost.'
        },
        {
          id: 'q4',
          question: 'Why are Virtual Nodes (vnodes) utilized in Consistent Hashing implementations?',
          options: ['To encrypt hash tokens', 'To ensure balanced uniform key distribution across physical servers with different capacities', 'To eliminate RAM usage', 'To force synchronous replication'],
          correctAnswerIndex: 1,
          explanation: 'Virtual nodes prevent hot-spots and uneven partition clustering by assigning multiple virtual points on the ring to each physical node.'
        }
      ]
    });
  }

  // 3. Generic Dynamic Generator for any custom text/topic
  const cleanTopic = prompt.split('\n')[0].replace(/[^a-zA-Z0-9 ]/g, '').trim().slice(0, 40) || 'Custom Notes';
  const sentences = prompt.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
  const firstSentence = sentences[0] || `An exploration of ${cleanTopic} and fundamental principles.`;
  const secondSentence = sentences[1] || `Key paradigms, mechanics, and practical applications of ${cleanTopic}.`;

  return JSON.stringify({
    title: `${cleanTopic} Study Accelerator`,
    topic: cleanTopic,
    summary: `Structured review session based on your custom notes regarding ${cleanTopic}. Master key terminology, internal relationships, and test your recall with interactive self-assessment.`,
    keyConcepts: [
      { id: 'c1', concept: `Foundation of ${cleanTopic}`, summary: firstSentence },
      { id: 'c2', concept: 'Core Mechanics & Dynamics', summary: secondSentence },
      { id: 'c3', concept: 'Critical Applications & Edge Cases', summary: `Recognizing boundary constraints, exceptions, and key patterns in ${cleanTopic}.` },
      { id: 'c4', concept: 'Synthesis & Best Practices', summary: `Consolidating the theoretical frameworks into reliable, actionable understanding.` }
    ],
    flashcards: [
      { id: 'fc1', front: `What is the core premise of ${cleanTopic}?`, back: firstSentence, category: 'Fundamentals', difficulty: 'easy' },
      { id: 'fc2', front: `Why is understanding ${cleanTopic} critical?`, back: secondSentence, category: 'Application', difficulty: 'medium' },
      { id: 'fc3', front: `What is a common misconception regarding ${cleanTopic}?`, back: 'Assuming surface familiarity equals deep conceptual mastery; nuances emerge during edge cases and active recall.', category: 'Critical Thinking', difficulty: 'medium' },
      { id: 'fc4', front: `How do you measure mastery in ${cleanTopic}?`, back: 'The ability to explain the underlying mechanisms from first principles without relying on rote memorization.', category: 'Evaluation', difficulty: 'hard' },
      { id: 'fc5', front: `What are the primary components of ${cleanTopic}?`, back: 'The foundational axioms, operational rules, and systematic feedback loops outlined in the source notes.', category: 'Architecture', difficulty: 'medium' }
    ],
    quiz: [
      {
        id: 'q1',
        question: `According to the source material, which statement best characterizes ${cleanTopic}?`,
        options: [
          firstSentence.slice(0, 70),
          `It operates independently of any surrounding contextual conditions.`,
          `It is primarily an outdated historical convention with no modern utility.`,
          `It requires complete manual recalculation at every operational step.`
        ],
        correctAnswerIndex: 0,
        explanation: `The foundational notes emphasize: "${firstSentence.slice(0, 100)}"`
      },
      {
        id: 'q2',
        question: `Which factor is most vital when implementing or analyzing ${cleanTopic}?`,
        options: [
          'Ensuring strict adherence to verified core principles and structural coherence',
          'Maximizing unnecessary complexity to impress external observers',
          'Ignoring edge cases and assuming average conditions will always hold',
          'Deleting all documentation to save storage space'
        ],
        correctAnswerIndex: 0,
        explanation: 'Effective study and real-world execution require coherent understanding of core rules and careful handling of constraints.'
      },
      {
        id: 'q3',
        question: `What distinguishes an advanced practitioner of ${cleanTopic} from a beginner?`,
        options: [
          'The ability to diagnose root causes and adapt to unexpected deviations',
          'Memorizing raw terms without understanding how they interact',
          'Avoiding all practice quizzes and hands-on testing',
          'Never revising or updating prior assumptions'
        ],
        correctAnswerIndex: 0,
        explanation: 'Deep domain competence is proven through active problem solving, diagnostic capability, and iterative refinement.'
      }
    ]
  });
}

function applyMockRefinement(session: StudySession, instruction: string): string {
  const lower = instruction.toLowerCase();
  const updated = { ...session };

  if (lower.includes('hard') || lower.includes('difficult') || lower.includes('advanced')) {
    updated.flashcards = [
      ...updated.flashcards,
      {
        id: `fc_refine_${Date.now()}`,
        front: `[Advanced Challenge] How does edge-case latency impact ${session.topic}?`,
        back: 'It can cascade into systemic bottlenecks or degraded throughput if backpressure mechanisms are missing.',
        category: 'Advanced Mastery',
        difficulty: 'hard' as const,
        userStatus: 'learning' as const,
      },
    ];
    updated.quiz = [
      ...updated.quiz,
      {
        id: `quiz_refine_${Date.now()}`,
        question: `[Advanced Analysis] In an edge-case scenario involving ${session.topic}, what is the recommended contingency strategy?`,
        options: [
          'Graceful degradation with fallback circuit breakers',
          'Unconstrained retry storm without jitter',
          'Immediate system shutdown',
          'Ignoring telemetry warnings'
        ],
        correctAnswerIndex: 0,
        explanation: 'Circuit breakers and graceful degradation prevent cascading failure across interdependent components.',
      },
    ];
    updated.summary += ' (Refined with advanced difficulty questions and edge-case flashcards).';
  } else {
    // General refinement
    updated.flashcards = [
      ...updated.flashcards,
      {
        id: `fc_refine_${Date.now()}`,
        front: `Key Insight: Practical application of ${session.topic}`,
        back: `Applied in production to ensure high reliability, predictable performance, and maintainable workflows.`,
        category: 'Applied Knowledge',
        difficulty: 'medium' as const,
        userStatus: 'learning' as const,
      },
    ];
    updated.summary += ` (Updated per request: "${instruction.slice(0, 40)}...")`;
  }

  return JSON.stringify(updated);
}
