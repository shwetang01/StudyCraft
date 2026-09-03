'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Shuffle,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Award,
} from 'lucide-react';
import { Flashcard } from '@/lib/types';
import { sounds } from '@/lib/soundEffects';

interface FlashcardDeckProps {
  cards: Flashcard[];
  onUpdateCardStatus: (cardId: string, status: 'learning' | 'mastered') => void;
}

export function FlashcardDeck({ cards, onUpdateCardStatus }: FlashcardDeckProps) {
  const [deck, setDeck] = useState<Flashcard[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Sync internal state if cards change from external refinement
  useEffect(() => {
    setDeck(cards);
    if (currentIndex >= cards.length) {
      setCurrentIndex(0);
    }
  }, [cards, currentIndex]);

  const currentCard = deck[currentIndex] || deck[0];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
    sounds.playFlip();
  }, []);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  }, [deck.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  }, [deck.length]);

  // Keyboard navigation: Space to flip, Left/Right arrows to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
  };

  const handleMarkStatus = (status: 'learning' | 'mastered') => {
    if (!currentCard) return;
    onUpdateCardStatus(currentCard.id, status);
    // Auto advance to next card after marking
    setTimeout(() => {
      handleNext();
    }, 250);
  };

  const masteredCount = deck.filter((c) => c.userStatus === 'mastered').length;
  const progressPercent = Math.round((masteredCount / deck.length) * 100);

  if (!currentCard) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
        <p>No flashcards available for this session.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Top Deck Stats & Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
            Card {currentIndex + 1} of {deck.length}
          </span>
          <span
            style={{
              fontSize: '0.78rem',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              fontWeight: 600,
            }}
          >
            {masteredCount} / {deck.length} Mastered ({progressPercent}%)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn btn-ghost"
            onClick={handleShuffle}
            title="Shuffle Flashcard Deck"
            style={{ fontSize: '0.8rem', padding: '6px 10px' }}
          >
            <Shuffle size={14} />
            <span>Shuffle</span>
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setIsFlipped(false);
              setCurrentIndex(0);
            }}
            title="Restart from first card"
            style={{ fontSize: '0.8rem', padding: '6px 10px' }}
          >
            <RotateCw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 3D Flipping Card Stage */}
      <div className="flashcard-stage" onClick={handleFlip} role="button" tabIndex={0}>
        <div className={`flashcard-flipper ${isFlipped ? 'is-flipped' : ''}`}>
          {/* Card Front */}
          <div className="flashcard-face flashcard-front">
            <div className="flashcard-header">
              <span className="flashcard-category">{currentCard.category || 'General'}</span>
              <span className={`flashcard-difficulty difficulty-${currentCard.difficulty || 'medium'}`}>
                {currentCard.difficulty || 'medium'}
              </span>
            </div>

            <div className="flashcard-body">
              <p className="flashcard-text-front">{currentCard.front}</p>
            </div>

            <div className="flashcard-hint">
              <RotateCw size={14} />
              <span>Click card or press [Space] to reveal explanation</span>
            </div>
          </div>

          {/* Card Back */}
          <div className="flashcard-face flashcard-back">
            <div className="flashcard-header">
              <span className="flashcard-category" style={{ color: 'var(--accent-purple)' }}>
                Explanation & Key Takeaway
              </span>
              {currentCard.userStatus === 'mastered' && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: 'var(--success)',
                    fontWeight: 700,
                  }}
                >
                  <CheckCircle2 size={14} /> Mastered
                </span>
              )}
            </div>

            <div className="flashcard-body">
              <p className="flashcard-text-back">{currentCard.back}</p>
            </div>

            <div className="flashcard-hint">
              <RotateCw size={14} />
              <span>Click or press [Space] to flip back</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls & Mastery Actions */}
      <div className="flashcard-controls">
        <button
          className="btn"
          onClick={handlePrev}
          disabled={deck.length <= 1}
          style={{ minWidth: '100px' }}
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        {/* Mastery Feedback Buttons */}
        <div className="flashcard-rating-actions">
          <button
            className="btn"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkStatus('learning');
            }}
            style={{
              borderColor: 'rgba(245, 158, 11, 0.4)',
              color: 'var(--warning)',
              fontSize: '0.82rem',
            }}
          >
            <HelpCircle size={15} />
            <span>Need Review</span>
          </button>

          <button
            className="btn"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkStatus('mastered');
            }}
            style={{
              borderColor: 'rgba(16, 185, 129, 0.4)',
              color: 'var(--success)',
              fontSize: '0.82rem',
            }}
          >
            <CheckCircle2 size={15} />
            <span>Mark Mastered</span>
          </button>
        </div>

        <button
          className="btn"
          onClick={handleNext}
          disabled={deck.length <= 1}
          style={{ minWidth: '100px' }}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Keyboard Shortcut Help */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '16px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <span>
          <kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'var(--bg-tertiary)' }}>Space</kbd> Flip
        </span>
        <span>
          <kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'var(--bg-tertiary)' }}>←</kbd> Prev Card
        </span>
        <span>
          <kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'var(--bg-tertiary)' }}>→</kbd> Next Card
        </span>
      </div>
    </div>
  );
}
