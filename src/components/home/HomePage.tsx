/**
 * HomePage — Landing page.
 * Two CTAs: browse flashcards or start quiz directly.
 * Shows an inline error if initQuiz() returns insufficient words.
 */

import type { QuizInitResult } from '../../types'

interface HomePageProps {
  onBrowse: () => void
  onStartQuiz: () => QuizInitResult
}

export function HomePage({ onBrowse, onStartQuiz }: HomePageProps) {
  const handleStartQuiz = () => {
    const result = onStartQuiz()
    if (!result.ok) {
      // Error is displayed via initError state in App.tsx
    }
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '480px', width: '100%' }}>
      <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>👻</div>
      <h1 style={{ fontSize: '2rem', color: '#ff6b00', margin: '0 0 0.5rem' }}>
        Haunted Lao
      </h1>
      <p style={{ color: '#aaa', marginBottom: '2rem' }}>
        万圣节老挝语词卡
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button
          type="button"
          onClick={onBrowse}
          style={secondaryBtnStyle}
        >
          📖 浏览词卡
        </button>
        <button
          type="button"
          onClick={handleStartQuiz}
          style={primaryBtnStyle}
        >
          🎃 直接开始练习
        </button>
      </div>
    </div>
  )
}

// Inline styles — will be replaced with CSS classes in T-11
const primaryBtnStyle: React.CSSProperties = {
  padding: '0.875rem 1.5rem',
  fontSize: '1.1rem',
  background: '#ff6b00',
  color: '#fff',
  border: 'none',
  borderRadius: '0.75rem',
  cursor: 'pointer',
}

const secondaryBtnStyle: React.CSSProperties = {
  padding: '0.875rem 1.5rem',
  fontSize: '1.1rem',
  background: 'transparent',
  color: '#e8e0f0',
  border: '1px solid #e8e0f0',
  borderRadius: '0.75rem',
  cursor: 'pointer',
}
