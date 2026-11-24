import { describe, expect, it } from 'vitest'
import { shortcutFor, type KeyPress } from './shortcuts'

const press = (key: string, extra: Partial<KeyPress> = {}): KeyPress => ({
  key,
  repeat: false,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  target: null,
  ...extra,
})

describe('shortcutFor', () => {
  it('maps the step keys', () => {
    expect(shortcutFor(press('ArrowRight'))).toBe('next')
    expect(shortcutFor(press('ArrowLeft'))).toBe('prev')
    expect(shortcutFor(press('Home'))).toBe('first')
    expect(shortcutFor(press('End'))).toBe('last')
    expect(shortcutFor(press(' '))).toBe('togglePlay')
    expect(shortcutFor(press('r'))).toBe('resetCamera')
    expect(shortcutFor(press('R'))).toBe('resetCamera')
  })

  it('ignores other keys', () => {
    expect(shortcutFor(press('a'))).toBeNull()
    expect(shortcutFor(press('Enter'))).toBeNull()
  })

  it('leaves browser shortcuts alone', () => {
    expect(shortcutFor(press('r', { ctrlKey: true }))).toBeNull()
    expect(shortcutFor(press('ArrowLeft', { altKey: true }))).toBeNull()
    expect(shortcutFor(press('r', { metaKey: true }))).toBeNull()
  })

  it('repeats arrows while held, but not play or reset', () => {
    expect(shortcutFor(press('ArrowRight', { repeat: true }))).toBe('next')
    expect(shortcutFor(press(' ', { repeat: true }))).toBeNull()
    expect(shortcutFor(press('r', { repeat: true }))).toBeNull()
  })
})
