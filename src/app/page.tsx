'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  HelpCircle,
  CheckSquare,
  BarChart3,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Wrench,
  BookOpen,
  XCircle,
  BrainCircuit,
  Zap,
  ShieldCheck,
  LayoutGrid,
  ListFilter,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { InputSection } from '@/components/InputSection';
import { FlashcardDeck } from '@/components/FlashcardDeck';
import { QuizEngine } from '@/components/QuizEngine';
import { ConceptsChecklist } from '@/components/ConceptsChecklist';
import { RefinementInput } from '@/components/RefinementInput';
import { ResilienceSandbox } from '@/components/ResilienceSandbox';
import { SavedSessionsModal } from '@/components/SavedSessionsModal';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { AssignmentBriefModal } from '@/components/AssignmentBriefModal';
import { useAIGenerator } from '@/hooks/useAIGenerator';

type ActiveTab = 'flashcards' | 'quiz' | 'checklist' | 'analytics';

const LOADING_TICKER_STEPS = [
  'Analyzing text & isolating foundational axioms...',
  'Synthesizing 3D interactive flashcard deck...',
  'Formulating multiple-choice quiz questions with explanations...',
  'Validating structured JSON schema & checking resilience...',
];

export default function HomePage() {
  const {
    session,
    isGenerating,
    isRefining,
    error,
    metaInfo,
    apiKeyOverride,
    saveApiKeys,
    generate,
    refine,
    retry,
    cancelGeneration,
    clearSession,
    loadSession,
    updateSession,
    dismissError,
  } = useAIGenerator();

  const [activeTab, setActiveTab] = useState<ActiveTab>('flashcards');
  const [viewMode, setViewMode] = useState<'tabbed' | 'all'>('tabbed');
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);

  // Cycle loading ticker steps smoothly
  useEffect(() => {
    if (!isGenerating) {
      setLoadingStepIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1) % LOADING_TICKER_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Handle flashcard mastery toggles
  const handleUpdateCardStatus = (cardId: string, status: 'learning' | 'mastered') => {
    updateSession((prev) => ({
      ...prev,
      flashcards: prev.flashcards.map((c) =>
        c.id === cardId ? { ...c, userStatus: status } : c
      ),
    }));
  };

  // Handle key concepts checklist toggles
  const handleToggleConcept = (conceptId: string) => {
    updateSession((prev) => ({
      ...prev,
      keyConcepts: prev.keyConcepts.map((c) =>
        c.id === conceptId ? { ...c, mastered: !c.mastered } : c
      ),
    }));
  };

  // Handle quiz questions progress updates
  const handleUpdateQuizProgress = (updatedQuiz: import('@/lib/types').QuizQuestion[]) => {
    updateSession((prev) => ({
      ...prev,
      quiz: updatedQuiz,
    }));
  };

  const hasCustomKey = Boolean(
    apiKeyOverride?.gemini || apiKeyOverride?.groq || apiKeyOverride?.openai
  );

  return (
    <div className="app-container">
      <Header
        onOpenSandbox={() => setIsSandboxOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        onOpenBrief={() => setIsBriefOpen(true)}
        hasCustomKey={hasCustomKey}
        modelUsed={metaInfo?.modelUsed}
      />

      {/* Hero & Input Section */}
      <InputSection
        onGenerate={(prompt) => generate(prompt, 'none')}
        isLoading={isGenerating}
        hasActiveSession={!!session}
        onClearSession={clearSession}
      />

      {/* Error Banner with Diagnostics & Retry */}
      {error && (
        <div className="error-banner">
          <div className="error-header">
            <div className="error-title">
              <AlertCircle size={18} />
              <span>AI Pipeline Anomaly Intercepted</span>
            </div>
            <span className="error-code">{error.code}</span>
          </div>
          <p className="error-message">{error.message}</p>
          <div className="error-actions">
            <button className="btn btn-primary" onClick={retry} style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
              <RotateCcw size={14} />
              <span>Retry Generation</span>
            </button>
            <button className="btn btn-ghost" onClick={dismissError} style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* AI Auto-Repair Diagnostic Indicator */}
      {metaInfo?.wasRepaired && metaInfo.repairNotes && metaInfo.repairNotes.length > 0 && (
        <div className="repair-pill-banner">
          <Wrench size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#fff' }}>Resilient Output Shield Active:</strong>{' '}
            Model returned irregular output that was auto-repaired without failing:
            <span style={{ marginLeft: '6px', opacity: 0.85 }}>
              {metaInfo.repairNotes.slice(0, 2).join(' • ')}
            </span>
          </div>
        </div>
      )}

      {/* Loading Skeleton with Step Ticker & Cancel Button */}
      {isGenerating && (
        <div className="glass-card" style={{ maxWidth: '760px', margin: '32px auto', padding: '32px', textAlign: 'center' }}>
          <div className="skeleton" style={{ height: '32px', width: '60%', margin: '0 auto 16px' }} />
          <div className="skeleton" style={{ height: '20px', width: '85%', margin: '0 auto 24px' }} />
          <div className="skeleton" style={{ height: '280px', width: '100%', marginBottom: '24px' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                fontSize: '0.92rem',
                fontWeight: 600,
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'fadeIn 0.3s ease',
              }}
            >
              <Sparkles size={16} />
              <span>{LOADING_TICKER_STEPS[loadingStepIdx]}</span>
            </div>

            <button
              className="btn btn-ghost"
              onClick={cancelGeneration}
              style={{ color: 'var(--error)', fontSize: '0.82rem', padding: '6px 14px' }}
            >
              <XCircle size={15} />
              <span>Cancel Request</span>
            </button>
          </div>
        </div>
      )}

      {/* Rich Empty State: How StudyCraft Works Showcase */}
      {!session && !isGenerating && (
        <div style={{ maxWidth: '960px', margin: '48px auto 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span className="brand-badge" style={{ fontSize: '0.75rem', marginBottom: '8px' }}>
              Architecture & Interactive Tools
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '6px' }}>
              Designed for Unpredictable AI Outputs
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', margin: '6px auto 0' }}>
              Unlike generic chatbots, StudyCraft converts natural text into strict, validated JSON schemas
              that feed stateful interactive components.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="glass-card" style={{ padding: '20px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <Layers size={18} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
                3D Interactive Flashcards
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Flip cards with Spacebar, navigate with arrow keys, rate confidence (*Need Practice* vs *Mastered*), and shuffle.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <HelpCircle size={18} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
                Adaptive Quiz Engine
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Multiple-choice testing with instant feedback, pedagogical explanations, keyboard shortcuts (1-4, Enter), and score assessment.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <Zap size={18} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
                Re-Test Wrong Answers
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Dedicated workflow isolating only incorrect responses into a targeted sub-quiz to achieve 100% concept mastery.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(236, 72, 153, 0.15)',
                  color: 'var(--accent-pink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <BrainCircuit size={18} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>
                Crash-Proof Resilience
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Dirty JSON auto-repair, Zod schema healing, and AbortController race-condition prevention ensuring UI never crashes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Session Views */}
      {session && !isGenerating && (
        <main style={{ marginTop: '24px' }}>
          {/* Session Title & Summary Header */}
          <div
            className="glass-card"
            style={{
              maxWidth: '820px',
              margin: '0 auto 24px',
              borderLeft: '4px solid var(--accent-primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={16} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {session.topic}
                </span>
              </div>

              {/* View Layout Toggle */}
              <button
                className="btn btn-ghost"
                onClick={() => setViewMode(viewMode === 'tabbed' ? 'all' : 'tabbed')}
                style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                title="Toggle between Tabbed View and Full Multi-Block Canvas"
              >
                {viewMode === 'tabbed' ? <LayoutGrid size={14} /> : <ListFilter size={14} />}
                <span>{viewMode === 'tabbed' ? 'Show All Blocks' : 'Tabbed View'}</span>
              </button>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
              {session.title}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
              {session.summary}
            </p>
          </div>

          {/* View Selection Tabs (Only shown in Tabbed Mode) */}
          {viewMode === 'tabbed' && (
            <div className="tabs-container" style={{ maxWidth: '820px', margin: '0 auto 24px' }}>
              <button
                className={`tab-btn ${activeTab === 'flashcards' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('flashcards')}
              >
                <Layers size={16} />
                <span>3D Flashcards</span>
                <span className="tab-badge">{session.flashcards.length}</span>
              </button>

              <button
                className={`tab-btn ${activeTab === 'quiz' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('quiz')}
              >
                <HelpCircle size={16} />
                <span>Adaptive Quiz</span>
                <span className="tab-badge">{session.quiz.length}</span>
              </button>

              <button
                className={`tab-btn ${activeTab === 'checklist' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('checklist')}
              >
                <CheckSquare size={16} />
                <span>Key Concepts</span>
                <span className="tab-badge">{session.keyConcepts.length}</span>
              </button>

              <button
                className={`tab-btn ${activeTab === 'analytics' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <BarChart3 size={16} />
                <span>Performance</span>
              </button>
            </div>
          )}

          {/* Tabbed View Rendering */}
          {viewMode === 'tabbed' ? (
            <>
              {activeTab === 'flashcards' && (
                <FlashcardDeck
                  cards={session.flashcards}
                  onUpdateCardStatus={handleUpdateCardStatus}
                />
              )}

              {activeTab === 'quiz' && (
                <QuizEngine
                  key={session.id}
                  initialQuestions={session.quiz}
                  onUpdateQuizProgress={handleUpdateQuizProgress}
                />
              )}

              {activeTab === 'checklist' && (
                <ConceptsChecklist
                  concepts={session.keyConcepts}
                  onToggleConcept={handleToggleConcept}
                />
              )}

              {activeTab === 'analytics' && (
                <div className="glass-card" style={{ maxWidth: '760px', margin: '0 auto', padding: '32px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>
                    Study Session Analytics & Progress
                  </h3>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px',
                      marginBottom: '28px',
                    }}
                  >
                    <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Flashcards Mastered</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
                        {session.flashcards.filter((c) => c.userStatus === 'mastered').length} / {session.flashcards.length}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quiz Questions Answered</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
                        {session.quiz.filter((q) => q.userAnswerIndex !== undefined).length} / {session.quiz.length}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Key Concepts Internalized</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>
                        {session.keyConcepts.filter((c) => c.mastered).length} / {session.keyConcepts.length}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    💡 <strong>Active Recall Principle:</strong> Combining 3D card flipping with targeted re-testing of
                    mistakes yields up to 150% higher memory consolidation than passive review.
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Multi-Block Full Canvas View (Renders All Blocks Sequentially) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
              <section>
                <div style={{ maxWidth: '720px', margin: '0 auto 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} style={{ color: 'var(--accent-primary)' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Interactive 3D Flashcards</h3>
                </div>
                <FlashcardDeck
                  cards={session.flashcards}
                  onUpdateCardStatus={handleUpdateCardStatus}
                />
              </section>

              <section>
                <div style={{ maxWidth: '760px', margin: '0 auto 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={18} style={{ color: 'var(--success)' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Adaptive Assessment Quiz</h3>
                </div>
                <QuizEngine
                  key={session.id}
                  initialQuestions={session.quiz}
                  onUpdateQuizProgress={handleUpdateQuizProgress}
                />
              </section>

              <section>
                <ConceptsChecklist
                  concepts={session.keyConcepts}
                  onToggleConcept={handleToggleConcept}
                />
              </section>
            </div>
          )}

          {/* Refinement Loop */}
          <RefinementInput onRefine={(instruction) => refine(instruction, 'none')} isRefining={isRefining} />
        </main>
      )}

      {/* Resilience Sandbox Chaos Testing Drawer */}
      <ResilienceSandbox
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
        onSimulate={(mode) => generate('Chaos Resilience Test Trigger', mode)}
        isLoading={isGenerating}
      />

      {/* Saved Sessions Modal */}
      <SavedSessionsModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSession={loadSession}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        savedKeys={apiKeyOverride}
        onSaveKeys={saveApiKeys}
      />

      {/* Assignment Brief Modal */}
      <AssignmentBriefModal
        isOpen={isBriefOpen}
        onClose={() => setIsBriefOpen(false)}
      />
    </div>
  );
}
