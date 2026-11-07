/**
 * AudioStatusBadge — Shown when a word's audio is not yet verified/available.
 * T-05b: placeholder styling. Full audio state handling in T-08.
 */

export function AudioStatusBadge() {
  return (
    <span
      style={{
        fontSize: '0.75rem',
        color: '#888',
        marginLeft: '0.5rem',
      }}
    >
      暂无音频
    </span>
  )
}
