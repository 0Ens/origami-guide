export const en = {
  app: {
    name: 'Origami Guide',
    tagline: 'Fold paper, quiet the mind.',
  },
  language: {
    label: 'Language',
  },
  home: {
    title: 'Choose a model',
    intro: 'Rotate the paper, follow each fold, and take your time.',
    loading: 'Loading models…',
    error: 'Could not load models. Is the API running?',
    empty: 'No models yet.',
    retry: 'Try again',
  },
  model: {
    steps_one: '{{count}} step',
    steps_other: '{{count}} steps',
    back: 'All models',
    notFound: 'This model does not exist.',
    error: 'Could not load this model. Is the API running?',
  },
  difficulty: {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
  },
  paper: {
    title: 'Recommended paper',
    size: '{{size}} × {{size}} cm',
    type: {
      KAMI: 'Kami (origami paper)',
      PRINTER: 'Printer paper',
      FOIL: 'Foil paper',
      WASHI: 'Washi',
    },
  },
}

/** The shape every translation must follow, derived from the English texts. */
type DeepStringify<T> = { [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]> }
export type Translation = DeepStringify<typeof en>
