import type { ReactNode } from 'react'

interface StatusMessageProps {
  children: ReactNode
  action?: { label: string; onClick: () => void }
}

/** Centered message for loading, empty and error states. */
export function StatusMessage({ children, action }: StatusMessageProps) {
  return (
    <div className="status-message" role="status">
      <p>{children}</p>
      {action && (
        <button type="button" className="button" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}
