'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Something went wrong</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{error.message}</p>
      <button onClick={reset} style={{ 
        padding: '10px 24px', 
        background: 'var(--accent-blue)', 
        color: 'white', 
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer'
      }}>Try again</button>
    </div>
  )
}
