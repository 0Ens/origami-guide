import type { Translation } from './en'

// Typed as Translation: a missing or misspelled key is a compile error.
export const tr: Translation = {
  app: {
    name: 'Origami Rehberi',
    tagline: 'Kağıdı katla, zihnini dinlendir.',
  },
  language: {
    label: 'Dil',
  },
  home: {
    title: 'Bir model seç',
    intro: 'Kağıdı çevir, her katlamayı takip et, acele etme.',
    loading: 'Modeller yükleniyor…',
    error: 'Modeller yüklenemedi. API çalışıyor mu?',
    empty: 'Henüz model yok.',
    retry: 'Tekrar dene',
  },
  model: {
    steps_one: '{{count}} adım',
    steps_other: '{{count}} adım',
    back: 'Tüm modeller',
    notFound: 'Böyle bir model yok.',
    error: 'Model yüklenemedi. API çalışıyor mu?',
    allSteps: 'Tüm adımlar',
    viewerLoading: '3D görünüm yükleniyor…',
    viewerLabel: '{{title}} modelinin 3D kağıt görünümü, adım {{current}} / {{total}}',
    viewerLabelFinished: '{{title}} modelinin 3D kağıt görünümü, tamamlandı',
    noViewer: 'Bu model için 3D görünüm henüz hazır değil. Yazılı adımları takip edebilirsin.',
  },
  steps: {
    controls: 'Adım kontrolleri',
    current: 'Adım {{current}} / {{total}}',
    finished: 'Bitti!',
    finishedText: 'Modelin tamamlandı. Çevirip eserine bir bak.',
    prev: 'Önceki adım',
    next: 'Sonraki adım',
    play: 'Oynat',
    pause: 'Duraklat',
    resetCamera: 'Görünümü sıfırla',
    goTo: '{{step}}. adıma git',
    keys: {
      step: 'adım',
      play: 'oynat / duraklat',
      resetCamera: 'görünümü sıfırla',
    },
  },
  difficulty: {
    BEGINNER: 'Başlangıç',
    INTERMEDIATE: 'Orta',
    ADVANCED: 'İleri',
  },
  paper: {
    title: 'Önerilen kağıt',
    size: '{{size}} × {{size}} cm',
    type: {
      KAMI: 'Kami (origami kağıdı)',
      PRINTER: 'Fotokopi kağıdı',
      FOIL: 'Folyo kağıt',
      WASHI: 'Washi',
    },
  },
}
