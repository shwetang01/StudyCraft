'use client';

import React from 'react';
import {
  ShieldAlert,
  X,
  Bug,
  AlertTriangle,
  Clock,
  ServerOff,
  FastForward,
  CheckCircle2,
} from 'lucide-react';
import { ResilienceSimulationMode } from '@/lib/types';

interface ResilienceSandboxProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulate: (mode: ResilienceSimulationMode) => void;
  isLoading: boolean;
}

export function ResilienceSandbox({
  isOpen,
  onClose,
  onSimulate,
  isLoading,
}: ResilienceSandboxProps) {
  if (!isOpen) return null;

  return (
    <div className="chaos-drawer">
      <div className="chaos-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="chaos-title">
            <ShieldAlert size={18} />
            <span>AI Resilience & Chaos Tester</span>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            style={{ width: '28px', height: '28px' }}
            aria-label="Close Chaos Panel"
          >
            <X size={16} />
          </button>
        </div>

        <p className="chaos-desc">
          Evaluate how gracefully StudyCraft AI handles real-world LLM anomalies, corrupt JSON,
          and network race conditions without crashing.
        </p>

        <div className="chaos-button-grid">
          {/* Test 1: Malformed JSON */}
          <button
            className="chaos-btn"
            disabled={isLoading}
            onClick={() => onSimulate('malformed_json')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <Bug size={14} style={{ color: 'var(--accent-pink)' }} />
              <span>Corrupt JSON</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Tests JSON repair engine
            </div>
          </button>

          {/* Test 2: Schema Mismatch */}
          <button
            className="chaos-btn"
            disabled={isLoading}
            onClick={() => onSimulate('schema_mismatch')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <AlertTriangle size={14} style={{ color: 'var(--warning)' }} />
              <span>Wrong Shape</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Tests Zod schema healing
            </div>
          </button>

          {/* Test 3: Slow Timeout */}
          <button
            className="chaos-btn"
            disabled={isLoading}
            onClick={() => onSimulate('slow_timeout')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <Clock size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span>Slow Timeout</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              8s delayed connection
            </div>
          </button>

          {/* Test 4: Server 500 Error */}
          <button
            className="chaos-btn"
            disabled={isLoading}
            onClick={() => onSimulate('server_500')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <ServerOff size={14} style={{ color: 'var(--error)' }} />
              <span>Server 500</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Graceful error UI & retry
            </div>
          </button>
        </div>

        <div
          style={{
            marginTop: '12px',
            padding: '8px 10px',
            borderRadius: '6px',
            background: 'var(--bg-tertiary)',
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <CheckCircle2 size={13} style={{ color: 'var(--success)' }} />
          <span>AbortController active: rapid clicks safely abort stale requests.</span>
        </div>
      </div>
    </div>
  );
}
