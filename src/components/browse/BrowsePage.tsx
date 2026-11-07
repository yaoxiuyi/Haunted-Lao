/**
 * BrowsePage — Flashcard browse view.
 * T-06: complete implementation. Audio playback wired in T-08.
 *
 * - Only shows words with status === 'verified' (fixed order from words.ts)
 * - Shows empty-state placeholder if no verified words exist yet
 * - Navigation buttons + page indicator
 * - "Start quiz" button always visible at top
 */

import { useState } from 'react'
import type { Word } from '../../types'
import { WordCard } from './WordCard'

interface BrowsePageProps {
  /** Full word list — component filters to verified entries internally. */
  words: Word[]
  /** Called when user clicks "Start quiz". App handles initQuiz + phase change. */
  onStartQuiz: () => void
  onHome: () => void
}

export function BrowsePage({ words, onStartQuiz, onHome }: BrowsePageProps) {
  const [index, setIndex] = useState(0)

  // Filter once per render; order preserved from words.ts (fixed order per design).
  const verifiedWords = words.filter(w => w.status === 'verified')
  const total = verifiedWords.length

  // Clamp index in case verified list shrinks (defensive: shouldn't happen at runtime).
  const safeIndex = total > 0 ? Math.min(index, total - 1) : 0
  const current = verifiedWords[safeIndex]

  const prev = () => setIndex(i => Math.max(0, i - 1))
  const next = () => setIndex(i => Math.min(total - 1, i + 1))

  return (
    <div
      style={{
        padding: '1.5rem',
        textAlign: 'center',
        width: '100%',
        maxWidth: '480px',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <button type="button" onClick={onHome} style={ghostBtnStyle}>
          ← 首页
        </button>
        <button type="button" onClick={onStartQuiz} style={primaryBtnStyle}>
          🎃 开始练习
        </button>
      </div>

      {total === 0 ? (
        /* Empty state */
        <div style={{ padding: '3rem 1rem', color: '#888' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
          <p style={{ margin: 0 }}>
            暂无已核实词条。
            <br />
            词条核实完成后（T-10）将在此显示。
          </p>
        </div>
      ) : (
        <>
          {/* Word card — onPlay is a placeholder; real audio wired in T-08 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <WordCard
              word={current!}
              onPlay={() => {
                // T-08: replaced by useAudio.play()
              }}
            />
          </div>

          {/* Navigation */}
          <nav
            aria-label="词卡翻页"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
            }}
          >
            <button
              type="button"
              onClick={prev}
              disabled={safeIndex === 0}
              aria-label="上一张"
              style={navBtnStyle}
            >
              ‹
            </button>

            <span
              aria-live="polite"
              aria-atomic="true"
              style={{ color: '#aaa', minWidth: '4rem', fontSize: '0.9rem' }}
            >
              {safeIndex + 1} / {total}
            </span>

            <button
              type="button"
              onClick={next}
              disabled={safeIndex === total - 1}
              aria-label="下一张"
              style={navBtnStyle}
            >
              ›
            </button>
          </nav>
        </>
      )}
    </div>
  )
}

// ── Styles ──────────────────────────────────────────────────────────────────

const primaryBtnStyle: React.CSSProperties = {
  padding: '0.6rem 1.2rem',
  background: '#ff6b00',
  color: '#fff',
  border: 'none',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  fontSize: '0.95rem',
}

const ghostBtnStyle: React.CSSProperties = {
  padding: '0.6rem 1rem',
  background: 'transparent',
  color: '#aaa',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.95rem',
}

const navBtnStyle: React.CSSProperties = {
  width: '2.5rem',
  height: '2.5rem',
  fontSize: '1.5rem',
  background: 'transparent',
  color: '#e8e0f0',
  border: '1px solid #444',
  borderRadius: '50%',
  cursor: 'pointer',
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
