/**
 * WordCard — Displays a single vocabulary flashcard.
 * T-06: complete implementation. Audio playback wired in T-08.
 *
 * - Shows Lao script (large), Chinese meaning, and a play button
 * - When status !== 'verified', PlayButton is shown as unavailable
 *   and AudioStatusBadge is displayed alongside it
 */

import type { Word } from '../../types'
import { PlayButton } from '../common/PlayButton'
import { AudioStatusBadge } from '../common/AudioStatusBadge'

interface WordCardProps {
  word: Word
  /** Called when the user clicks the play button. T-08 wires real audio here. */
  onPlay: () => void
}

export function WordCard({ word, onPlay }: WordCardProps) {
  // In browse and review, audio is only available for verified words.
  // (In quiz, QuizPage controls the audio state separately via useAudio.)
  const audioUnavailable = word.status !== 'verified'

  return (
    <div
      style={{
        background: '#1a0a2e',
        borderRadius: '1rem',
        padding: '2rem',
        textAlign: 'center',
        width: '100%',
        maxWidth: '360px',
        boxSizing: 'border-box',
      }}
    >
      {/* Lao script — large, uses system Lao font fallback */}
      <div
        lang="lo"
        style={{
          fontSize: '2.5rem',
          marginBottom: '0.75rem',
          lineHeight: 1.5,
          letterSpacing: '0.02em',
        }}
      >
        {word.lao}
      </div>

      {/* Chinese meaning */}
      <div
        style={{
          fontSize: '1.25rem',
          color: '#e8e0f0',
          marginBottom: '1.5rem',
        }}
      >
        {word.chinese}
      </div>

      {/* Audio control row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <PlayButton
          onPlay={onPlay}
          unavailable={audioUnavailable}
          label={`播放"${word.lao}"的发音`}
        />
        {audioUnavailable && <AudioStatusBadge />}
      </div>
    </div>
  )
}
