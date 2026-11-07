/**
 * OptionList — 4 answer choices for the current quiz question.
 * T-07: complete implementation with keyboard support and locked feedback.
 *
 * Accessibility approach:
 * - Each option is a <button> (native keyboard focus, Enter/Space activation).
 * - aria-pressed indicates the user's selection.
 * - aria-disabled on locked buttons (post-answer or audio-gated).
 * - The container uses role="group" with a label.
 * - Correct answer is always highlighted after submission regardless of
 *   which option the user selected.
 */

interface OptionListProps {
  options: [string, string, string, string]
  /** The index the user has selected, or null if unanswered. */
  selectedIndex: number | null
  correctIndex: 0 | 1 | 2 | 3
  /** True once the user has submitted an answer — locks all options. */
  isAnswered: boolean
  /**
   * True when options must be blocked before answering (e.g. audio failure).
   * T-08 sets this when audioState is 'error-blocked' or 'error-load'.
   */
  disabled?: boolean
  onSelect: (index: 0 | 1 | 2 | 3) => void
}

export function OptionList({
  options,
  selectedIndex,
  correctIndex,
  isAnswered,
  disabled = false,
  onSelect,
}: OptionListProps) {
  return (
    <div
      role="group"
      aria-label="请选择正确答案"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '100%',
        maxWidth: '360px',
      }}
    >
      {options.map((option, idx) => {
        const isSelected = selectedIndex === idx
        const isCorrect = idx === correctIndex
        const isClickable = !disabled && !isAnswered

        // ── Colour coding ──────────────────────────────────────────────
        let bg = '#1a0a2e'
        let border = '1px solid #444'
        let color = '#e8e0f0'
        let outline = 'none'

        if (isAnswered) {
          if (isCorrect) {
            // Always highlight the correct answer
            bg = '#1b3a1b'
            border = '1px solid #4caf50'
            color = '#a5d6a7'
          } else if (isSelected) {
            // The wrong option the user chose
            bg = '#3a0a0a'
            border = '1px solid #e53935'
            color = '#ef9a9a'
          } else {
            // Unchosen, incorrect options fade out
            color = '#555'
            border = '1px solid #333'
          }
        }

        return (
          <button
            key={idx}
            type="button"
            aria-pressed={isSelected}
            aria-disabled={!isClickable}
            disabled={!isClickable}
            onClick={() => isClickable && onSelect(idx as 0 | 1 | 2 | 3)}
            onKeyDown={e => {
              // onKeyDown is redundant for <button> (Enter/Space already fires onClick),
              // but kept for explicitness and to prevent accidental form submission.
              if ((e.key === 'Enter' || e.key === ' ') && isClickable) {
                e.preventDefault()
                onSelect(idx as 0 | 1 | 2 | 3)
              }
            }}
            style={{
              padding: '0.875rem 1rem',
              textAlign: 'left',
              background: bg,
              border,
              borderRadius: '0.75rem',
              color,
              cursor: isClickable ? 'pointer' : 'default',
              fontSize: '1rem',
              outline,
              transition: 'background 0.15s, border-color 0.15s, color 0.15s',
              width: '100%',
            }}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
