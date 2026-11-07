/**
 * PlayButton — Triggers audio playback for a word.
 * T-05b: placeholder UI only. Audio logic wired in T-08.
 */

interface PlayButtonProps {
  /** Called when the user clicks to play. */
  onPlay: () => void
  /** Whether audio is currently unavailable (not yet verified). */
  unavailable?: boolean
  /** aria-label describing which word this plays, e.g. "播放"ສະບາຍດີ"的发音" */
  label: string
}

export function PlayButton({ onPlay, unavailable = false, label }: PlayButtonProps) {
  return (
    <button
      type="button"
      onClick={unavailable ? undefined : onPlay}
      aria-label={label}
      aria-disabled={unavailable}
      style={{
        padding: '0.5rem 1rem',
        fontSize: '1.25rem',
        cursor: unavailable ? 'not-allowed' : 'pointer',
        opacity: unavailable ? 0.4 : 1,
        background: 'transparent',
        border: '1px solid #ff6b00',
        borderRadius: '0.5rem',
        color: '#ff6b00',
      }}
    >
      {unavailable ? '🔇' : '▶'}
    </button>
  )
}
