'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Header } from '@/components/Header';
import { InputSection } from '@/components/InputSection';
import { FlashcardDeck } from '@/components/FlashcardDeck';
import { QuizEngine } from '@/components/QuizEngine';
import { ConceptsChecklist } from '@/components/ConceptsChecklist';
import { RefinementInput } from '@/components/RefinementInput';
import { ResilienceSandbox } from '@/components/ResilienceSandbox';
import { SavedSessionsModal } from '@/components/SavedSessionsModal';
import { useAIGenerator } from '@/hooks/useAIGenerator';

type ActiveTab = 'flashcards' | 'quiz' | 'checklist' | 'analytics';

export default function HomePage() {
  const {
    session,
    isGenerating,
    isRefining,
    error,
    metaInfo,
    generate,
    refine,
    retry,
    clearSession,
    loadSession,
    updateSession,
    dismissError,
  } = useAIGenerator();

  const [activeTab, setActiveTab] = useState<ActiveTab>('flashcards');
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

  return (
    <div className="app-container">
      <Header
        onOpenSandbox={() => setIsSandboxOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
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

      {/* Loading Skeleton */}
      {isGenerating && (
        <div className="glass-card" style={{ maxWidth: '760px', margin: '32px auto', padding: '32px' }}>
          <div className="skeleton" style={{ height: '32px', width: '60%', marginBottom: '16px' }} />
          <div className="skeleton" style={{ height: '20px', width: '85%', marginBottom: '24px' }} />
          <div className="skeleton" style={{ height: '280px', width: '100%', marginBottom: '20px' }} />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Synthesizing structured flashcards and adaptive quiz questions...
            </span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <BookOpen size={16} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {session.topic}
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
              {session.title}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
              {session.summary}
            </p>
          </div>

          {/* View Selection Tabs */}
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

          {/* Active Tab Content */}
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
                💡 <strong>Learning Tip:</strong> Active recall through flashcards and targeted re-testing of
                mistakes produces a 150% higher long-term retention rate compared to passive re-reading.
              </div>
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
    </div>
  );
}
