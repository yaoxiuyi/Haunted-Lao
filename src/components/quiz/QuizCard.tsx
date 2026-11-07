/**
 * QuizCard — Shows the play button and audio status for the current question.
 * T-05b: placeholder. Audio wired in T-08.
 */

import type { AudioPlayState } from '../../types'
import { PlayButton } from '../common/PlayButton'
import { AudioWarning } from './AudioWarning'

interface QuizCardProps {
  lao: string
  audioState: AudioPlayState
  onPlay: () => void
  onHome: () => void
}

export function QuizCard({ lao, audioState, onPlay, onHome }: QuizCardProps) {
  const showWarning = audioState === 'error-blocked' || audioState === 'error-load'

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      {/* Lao text — shown as fallback when audio unavailable */}
      <div style={{ fontSize: '2.25rem', marginBottom: '1.25rem', lineHeight: 1.4 }}>
        {lao}
      </div>

      <PlayButton
        onPlay={onPlay}
        label={`播放"${lao}"的发音`}
      />

      {showWarning && (
        <AudioWarning
          reason={audioState === 'error-blocked' ? 'blocked' : 'error'}
          onRetry={onPlay}
          onHome={onHome}
        />
      )}
    </div>
  )
}
