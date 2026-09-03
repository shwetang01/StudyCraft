'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Sun, ShieldAlert, History } from 'lucide-react';

interface HeaderProps {
  onOpenSandbox: () => void;
  onOpenHistory: () => void;
  modelUsed?: string;
}

export function Header({ onOpenSandbox, onOpenHistory, modelUsed }: HeaderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

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
