/**
 * ReviewCard — Flashcard for a word the user got wrong.
 * T-05b: structure only. Audio wired in T-08.
 */

import type { Word } from '../../types'
import { PlayButton } from '../common/PlayButton'

interface ReviewCardProps {
  word: Word
  onPlay: () => void
}

export function ReviewCard({ word, onPlay }: ReviewCardProps) {
  return (
    <div
      style={{
        background: '#1a0a2e',
        border: '1px solid #e53935',
        borderRadius: '1rem',
        padding: '2rem',
        textAlign: 'center',
        width: '100%',
        maxWidth: '360px',
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>
        {word.lao}
      </div>
      <div style={{ fontSize: '1.25rem', color: '#e8e0f0', marginBottom: '1.5rem' }}>
        {word.chinese}
      </div>
      <PlayButton
        onPlay={onPlay}
        unavailable={word.status !== 'verified'}
        label={`播放"${word.lao}"的发音`}
      />
    </div>
  )
}
