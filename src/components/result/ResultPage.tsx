/**
 * ResultPage — Post-quiz result summary.
 * T-05b: full structure. Score copy uses score utils from T-04.
 */

import type { Word } from '../../types'
import { getScoreTier, getResultCopy } from '../../utils/score'

interface ResultPageProps {
  correctCount: number
  totalAnswered: number
  wrongWords: Word[]
  onPlayAgain: () => void
  onReview: () => void
}

export function ResultPage({
  correctCount,
  totalAnswered,
  wrongWords,
  onPlayAgain,
  onReview,
}: ResultPageProps) {
  const percent = totalAnswered === 0
    ? 0
    : Math.round((correctCount / totalAnswered) * 100)

  const tier = getScoreTier(correctCount, totalAnswered)
  const copy = getResultCopy(tier)

  return (
    <div style={{ padding: '2rem', textAlign: 'center', width: '100%', maxWidth: '480px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
        {tier === 'high' ? '🎃' : tier === 'mid' ? '🕸️' : '👻'}
      </div>
      <h2 style={{ color: '#ff6b00', margin: '0 0 0.5rem' }}>{copy.title}</h2>
      <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>{copy.body}</p>

      {/* Score */}
      <div
        style={{
          background: '#1a0a2e',
          borderRadius: '1rem',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff6b00' }}>
          {percent}%
        </div>
        <div style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          {correctCount} / {totalAnswered} 题答对
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button type="button" onClick={onPlayAgain} style={primaryBtnStyle}>
          🔄 再练一次
        </button>
        {wrongWords.length > 0 && (
          <button type="button" onClick={onReview} style={secondaryBtnStyle}>
            📚 复习错词 ({wrongWords.length})
          </button>
        )}
      </div>
    </div>
  )
}

const primaryBtnStyle: React.CSSProperties = {
  padding: '0.875rem 1.5rem',
  background: '#ff6b00',
  color: '#fff',
  border: 'none',
  borderRadius: '0.75rem',
  fontSize: '1rem',
  cursor: 'pointer',
}

const secondaryBtnStyle: React.CSSProperties = {
  padding: '0.875rem 1.5rem',
  background: 'transparent',
  color: '#e8e0f0',
  border: '1px solid #e8e0f0',
  borderRadius: '0.75rem',
  fontSize: '1rem',
  cursor: 'pointer',
}
