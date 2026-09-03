export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: DifficultyLevel;
  userStatus: 'learning' | 'mastered';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  userAnswerIndex?: number;
}

export interface KeyConcept {
  id: string;
  concept: string;
  summary: string;
  mastered: boolean;
}

export interface StudySession {
  id: string;
  title: string;
  topic: string;
  summary: string;
  keyConcepts: KeyConcept[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  createdAt: string;
  lastModifiedAt: string;
}

export interface GenerateRequestBody {
  prompt: string;
  options?: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    cardCount?: number;
    quizCount?: number;
  };
  simulationMode?: ResilienceSimulationMode;
  apiKeyOverride?: {
    gemini?: string;
    groq?: string;
    openai?: string;
  };
}

export interface RefineRequestBody {
  currentSession: StudySession;
  refinementInstruction: string;
  simulationMode?: ResilienceSimulationMode;
  apiKeyOverride?: {
    gemini?: string;
    groq?: string;
    openai?: string;
  };
}

export type ResilienceSimulationMode =
  | 'none'
  | 'malformed_json'
  | 'schema_mismatch'
  | 'slow_timeout'
  | 'server_500'
  | 'stale_race';

export interface ApiResponseSuccess<T> {
  success: true;
  data: T;
  meta: {
    modelUsed: string;
    durationMs: number;
    wasRepaired?: boolean;
    repairNotes?: string[];
  };
}

export interface ApiResponseError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    rawSnippet?: string;
    canAutoRepair?: boolean;
  };
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;
