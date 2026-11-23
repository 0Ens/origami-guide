import type { Paper } from '../api/types'

/** A small folded-corner square showing both sides of the recommended paper. */
export function PaperSwatch({ paper, size = 40 }: { paper: Paper; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M2 2h36v24L26 38H2z" fill={paper.frontColor} />
      <path d="M38 26 26 38V26z" fill={paper.backColor} stroke="rgb(0 0 0 / 12%)" strokeWidth="0.5" />
    </svg>
  )
}
