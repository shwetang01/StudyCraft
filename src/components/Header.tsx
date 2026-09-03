'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, ShieldAlert, History, Key, Volume2, VolumeX, FileText } from 'lucide-react';
import { sounds } from '@/lib/soundEffects';

interface HeaderProps {
  onOpenSandbox: () => void;
  onOpenHistory: () => void;
  onOpenApiKey: () => void;
  onOpenBrief: () => void;
  hasCustomKey?: boolean;
  modelUsed?: string;
}

export function Header({
  onOpenSandbox,
  onOpenHistory,
  onOpenApiKey,
  onOpenBrief,
  hasCustomKey,
  modelUsed,
}: HeaderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = (root.getAttribute('data-theme') as 'dark' | 'light') || 'dark';
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.enabled = !next;
  };

  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <div className="brand-icon">
          <Sparkles size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-title">StudyCraft AI</span>
            <span className="brand-badge">Adaptive Engine</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {modelUsed ? `Active: ${modelUsed}` : 'Resilient Structured Learning Platform'}
          </div>
        </div>
      </div>

      <div className="header-actions">
        {/* Assignment Brief Modal Trigger */}
        <button
          className="btn"
          onClick={onOpenBrief}
          title="View Assignment PDF Brief, Requirements & Evaluation Rubric"
          style={{ borderColor: 'rgba(99, 102, 241, 0.4)', color: 'var(--accent-primary)' }}
        >
          <FileText size={16} />
          <span>Assignment Brief</span>
        </button>

        {/* Chaos / Resilience Sandbox Trigger */}
        <button
          className="btn"
          onClick={onOpenSandbox}
          title="Open AI Resilience & Chaos Testing Panel"
          style={{ borderColor: 'rgba(236, 72, 153, 0.4)', color: 'var(--accent-pink)' }}
        >
          <ShieldAlert size={16} />
          <span>Resilience Sandbox</span>
        </button>

        {/* API Key Modal Trigger */}
        <button
          className="btn btn-icon"
          onClick={onOpenApiKey}
          title={hasCustomKey ? 'Custom API Key Active' : 'Configure Custom API Key'}
          aria-label="API Key Settings"
          style={hasCustomKey ? { borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' } : undefined}
        >
          <Key size={18} />
        </button>

        {/* Sound Toggle */}
        <button
          className="btn btn-icon"
          onClick={toggleSound}
          title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          aria-label="Toggle Sound Effects"
        >
          {isMuted ? <VolumeX size={18} style={{ color: 'var(--text-muted)' }} /> : <Volume2 size={18} style={{ color: 'var(--accent-cyan)' }} />}
        </button>

        {/* History Modal Trigger */}
        <button
          className="btn btn-icon"
          onClick={onOpenHistory}
          title="Past Saved Sessions"
          aria-label="View Saved Sessions"
        >
          <History size={18} />
        </button>

        {/* Dark / Light Toggle */}
        <button
          className="btn btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Color Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
