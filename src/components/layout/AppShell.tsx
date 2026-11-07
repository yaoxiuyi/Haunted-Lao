/**
 * AppShell — Global layout container.
 * T-05b: plain dark background placeholder.
 * Halloween theme (decorations, fonts, animations) will be added in T-11.
 */

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0d0014',
        color: '#e8e0f0',
        fontFamily: "'Noto Sans Lao', 'Phetsarath OT', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  )
}
