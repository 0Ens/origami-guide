/** Small inline icons for the step controls; they take the text colour. */
const Icon = ({ path }: { path: string }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
    <path d={path} fill="currentColor" />
  </svg>
)

export const PrevIcon = () => <Icon path="M6 5h2v14H6zM20 5v14L9 12z" />
export const NextIcon = () => <Icon path="M16 5h2v14h-2zM4 5v14l11-7z" />
export const PlayIcon = () => <Icon path="M7 4v16l13-8z" />
export const PauseIcon = () => <Icon path="M6 4h4v16H6zM14 4h4v16h-4z" />
export const ResetIcon = () => (
  <Icon path="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" />
)
