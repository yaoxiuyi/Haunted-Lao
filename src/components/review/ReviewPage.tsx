/**
 * ReviewPage — Wrong-word review flashcards.
 * T-05b: full structure. Audio wired in T-08.
 * "Return to results" does NOT reset answers.
 */

import { useState } from 'react'
import type { Word } from '../../types'
import { ReviewCard } from './ReviewCard'

interface ReviewPageProps {
  wrongWords: Word[]
  onBack: () => void
}

export function ReviewPage({ wrongWords, onBack }: ReviewPageProps) {
  const [index, setIndex] = useState(0)
  const total = wrongWords.length
  const current = wrongWords[index]

  if (total === 0) {
    // Should not be reachable (ResultPage hides the button when wrongWords is empty)
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>没有需要复习的词语。</p>
        <button type="button" onClick={onBack} style={backBtnStyle}>← 返回结果</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', textAlign: 'center', width: '100%', maxWidth: '480px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button type="button" onClick={onBack} style={backBtnStyle}>← 返回结果</button>
        <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
          错词回顾 {index + 1} / {total}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        {/* onPlay placeholder — audio wired in T-08 */}
        <ReviewCard word={current!} onPlay={() => {}} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <button
          type="button"
          onClick={() => setIndex(i => Math.max(0, i - 1))}
          disabled={index === 0}
          aria-label="上一张"
          style={navBtnStyle}
        >
          ‹
        </button>
        <span style={{ color: '#aaa', minWidth: '4rem' }}>
          {index + 1} / {total}
        </span>
        <button
          type="button"
          onClick={() => setIndex(i => Math.min(total - 1, i + 1))}
          disabled={index === total - 1}
          aria-label="下一张"
          style={navBtnStyle}
        >
          ›
        </button>
      </div>
    </div>
  )
}

const backBtnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
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
}
