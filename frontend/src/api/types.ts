// Mirrors the backend response records in dev.origamiguide.api.catalog.

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type PaperType = 'KAMI' | 'PRINTER' | 'FOIL' | 'WASHI'

export interface Paper {
  sizeCm: number
  type: PaperType
  frontColor: string
  backColor: string
  note: string | null
}

export interface ModelSummary {
  slug: string
  title: string
  summary: string
  difficulty: Difficulty
  stepCount: number
  paper: Paper
}

export interface Step {
  number: number
  instruction: string
  /**
   * Fold definition as sent by the API. Kept `unknown` on purpose: it is
   * untrusted JSON until `parseFoldSpec` from the fold engine has checked it.
   */
  fold: unknown
}

export interface ModelDetail {
  slug: string
  title: string
  summary: string
  difficulty: Difficulty
  paper: Paper
  steps: Step[]
}

/** RFC 9457 problem details, as returned by the API on errors. */
export interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
}
