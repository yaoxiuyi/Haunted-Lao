/**
 * AudioWarning — Shown when audio playback fails.
 * T-05b: structure placeholder. Full logic in T-08.
 *
 * 'blocked'    → browser blocked autoplay (NotAllowedError)
 * 'error'      → audio resource failed to load
 * 'unavailable'→ word has no verified audio (status !== 'verified')
 */

interface AudioWarningProps {
  reason: 'blocked' | 'error' | 'unavailable'
  onRetry?: () => void
  onHome?: () => void
}

export function AudioWarning({ reason, onRetry, onHome }: AudioWarningProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        background: '#2a0a0a',
        border: '1px solid #e53935',
        borderRadius: '0.5rem',
        padding: '1rem',
        margin: '0.75rem 0',
        fontSize: '0.9rem',
        color: '#ffcdd2',
        textAlign: 'center',
      }}
    >
      {reason === 'blocked' && (
        <>
          <p style={{ margin: '0 0 0.5rem' }}>浏览器需要您先点击页面后才能播放。</p>
          {onRetry && (
            <button type="button" onClick={onRetry} style={retryBtnStyle}>
              点击播放 ▶
            </button>
          )}
        </>
      )}
      {reason === 'error' && (
        <>
          <p style={{ margin: '0 0 0.5rem' }}>音频加载失败。</p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {onRetry && (
              <button type="button" onClick={onRetry} style={retryBtnStyle}>
                重试
              </button>
            )}
            {onHome && (
              <button type="button" onClick={onHome} style={homeBtnStyle}>
                返回首页
              </button>
            )}
          </div>
        </>
      )}
      {reason === 'unavailable' && (
        <p style={{ margin: 0 }}>本题暂无音频，请根据老挝语文字作答。</p>
      )}
    </div>
  )
}

const retryBtnStyle: React.CSSProperties = {
  padding: '0.4rem 0.8rem',
  background: '#e53935',
  color: '#fff',
  border: 'none',
  borderRadius: '0.4rem',
  cursor: 'pointer',
  fontSize: '0.85rem',
}

const homeBtnStyle: React.CSSProperties = {
  padding: '0.4rem 0.8rem',
  background: 'transparent',
  color: '#ffcdd2',
  border: '1px solid #ffcdd2',
  borderRadius: '0.4rem',
  cursor: 'pointer',
  fontSize: '0.85rem',
}
