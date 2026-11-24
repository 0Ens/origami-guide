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
    allSteps: 'All steps',
    viewerLoading: 'Loading the 3D view…',
    viewerLabel: '3D paper model of {{title}}, step {{current}} of {{total}}',
    viewerLabelFinished: '3D paper model of {{title}}, finished',
    noViewer: 'The 3D view is not available for this model yet. You can still follow the written steps.',
  },
  steps: {
    controls: 'Step controls',
    current: 'Step {{current}} of {{total}}',
    finished: 'Finished!',
    finishedText: 'Your model is complete. Turn it around and admire your work.',
    prev: 'Previous step',
    next: 'Next step',
    play: 'Play',
    pause: 'Pause',
    resetCamera: 'Reset view',
    goTo: 'Go to step {{step}}',
    keys: {
      step: 'step',
      play: 'play / pause',
      resetCamera: 'reset view',
    },
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
