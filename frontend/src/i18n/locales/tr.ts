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
