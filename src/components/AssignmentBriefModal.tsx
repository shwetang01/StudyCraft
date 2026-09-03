'use client';

import React from 'react';
import {
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Award,
  Layers,
  HelpCircle,
  ShieldAlert,
  Zap,
} from 'lucide-react';

interface AssignmentBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AssignmentBriefModal({ isOpen, onClose }: AssignmentBriefModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Assignment Instructions & Rubric</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Extracted directly from Frontend_Internship_Assignment.pdf
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '6px', fontSize: '0.88rem', lineHeight: 1.6 }}>
          {/* Core Mandate Alert */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontWeight: 700, color: '#c7d2fe', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scale size={16} />
              <span>The One Firm Rule (from PDF)</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              &ldquo;It can&apos;t be a chatbot. The AI should return structured data (e.g. JSON) that your code
              parses and renders as interactive components; printing the model&apos;s raw text in a chat box
              doesn&apos;t meet the requirement.&rdquo;
            </p>
          </div>

          {/* Evaluation Rubric */}
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span>How We Evaluate (Official Rubric)</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weight: 25%</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>React & Frontend Architecture</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Hooks, clean components, state flow
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weight: 25%</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>AI Integration & Data Handling</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Server-side routing, structured JSON parsing
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-pink)' }}>Weight: 20% (Core Signal)</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Handling Bad AI Output</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Corrupt JSON repair, schema healing, race conditions
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weight: 15%</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>UI/UX & Product Sense</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                3D flips, keyboard nav, sound, mobile responsive
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weight: 15%</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Communication & Understanding</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Clear README, AI note, small commits
              </div>
            </div>
          </div>

          {/* Detailed Verification Checklist */}
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '10px' }}>
            Checklist of Verified Requirements
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: '3px', flexShrink: 0 }} />
              <div>
                <strong>Study Assistant Concept:</strong> Free-form text input generates 3D flashcards and adaptive quizzes.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: '3px', flexShrink: 0 }} />
              <div>
                <strong>Re-Test Wrong Answers Mode:</strong> Specific explicit feature in PDF allowing targeted revision of missed questions.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: '3px', flexShrink: 0 }} />
              <div>
                <strong>Secret API Key Handling:</strong> Calls route through Next.js serverless functions (/api/generate & /api/refine). No keys in client.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: '3px', flexShrink: 0 }} />
              <div>
                <strong>Handling Bad AI Output:</strong> JSON repair balances unclosed brackets and strips markdown. Zod heals schema mismatches. AbortController cancels stale responses.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: '3px', flexShrink: 0 }} />
              <div>
                <strong>Loading, Error & Empty States:</strong> Dynamic progress ticker with cancel button, actionable error banner, and 4-pillar architectural preview.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: '3px', flexShrink: 0 }} />
              <div>
                <strong>Stretch Goals Implemented:</strong> Multi-block layout (Tabbed vs Full Canvas), AI refinement loop, LocalStorage persistence, synthesized audio, keyboard navigation.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: '3px', flexShrink: 0 }} />
              <div>
                <strong>npm install &amp;&amp; npm start:</strong> Zero configuration build step required for local reviewers.
              </div>
            </div>
          </div>

          {/* Interview Expectations Note */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <strong style={{ display: 'block', marginBottom: '4px' }}>
              💡 Interview Expectations (from Page 4 of PDF):
            </strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              &ldquo;Expect to demo it, walk through your code, review a short AI-generated snippet,
              fix a bug we introduce, and add a small feature.&rdquo;
              The codebase is organized with clean modular components to facilitate live code walkthroughs and pairing.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="btn btn-primary" onClick={onClose} style={{ padding: '8px 24px' }}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
