import { useEffect, useRef } from 'react'

export type Shortcut = 'next' | 'prev' | 'first' | 'last' | 'togglePlay' | 'resetCamera'

/** The parts of a KeyboardEvent the mapping looks at; easy to fake in tests. */
export interface KeyPress {
  key: string
  repeat: boolean
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
  target: EventTarget | null
}

const KEYS: Record<string, Shortcut> = {
  ArrowRight: 'next',
  ArrowLeft: 'prev',
  Home: 'first',
  End: 'last',
  ' ': 'togglePlay',
  r: 'resetCamera',
  R: 'resetCamera',
}

/** Holding an arrow should keep stepping; holding Space should not flicker play/pause. */
const REPEATABLE = new Set<Shortcut>(['next', 'prev'])

/**
 * Which shortcut a key press means, or null. Presses while typing in a
 * field and browser shortcuts (Ctrl+R, Alt+←) are left alone.
 */
export function shortcutFor(press: KeyPress): Shortcut | null {
  if (press.ctrlKey || press.metaKey || press.altKey || isTyping(press.target)) return null
  const shortcut = KEYS[press.key] ?? null
  if (shortcut && press.repeat && !REPEATABLE.has(shortcut)) return null
  return shortcut
}

function isTyping(target: EventTarget | null): boolean {
  if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/**
 * Listens on the whole window, so shortcuts work wherever focus is.
 * Handled keys don't do their default: Space would also scroll the page or
 * press the focused button, and the arrows would scroll.
 */
export function useShortcuts(onShortcut: (shortcut: Shortcut) => void, enabled = true) {
  const handler = useRef(onShortcut)
  useEffect(() => {
    handler.current = onShortcut
  })

  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcutFor(event)
      if (!shortcut) return
      event.preventDefault()
      handler.current(shortcut)
    }
    // A focused button is pressed on Space's keyup, so that has to be stopped too.
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === ' ' && shortcutFor(event)) event.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [enabled])
}
