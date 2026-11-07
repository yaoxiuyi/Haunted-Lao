/**
 * T-04 Unit tests — audio.ts
 *
 * Tests the joinAudioUrl helper (pure function, no import.meta.env dependency).
 * resolveAudioUrl is a thin wrapper around joinAudioUrl and is verified via
 * the build pipeline + manual browser testing.
 */

import { describe, it, expect } from 'vitest'
import { joinAudioUrl } from '../audio'

describe('joinAudioUrl', () => {
  it('joins root base URL with plain path', () => {
    expect(joinAudioUrl('/', 'audio/hello.mp3')).toBe('/audio/hello.mp3')
  })

  it('joins sub-path base URL with plain path', () => {
    expect(joinAudioUrl('/haunted-lao/', 'audio/hello.mp3')).toBe(
      '/haunted-lao/audio/hello.mp3',
    )
  })

  it('strips accidental leading slash from audioFile to avoid double-slash', () => {
    expect(joinAudioUrl('/', '/audio/hello.mp3')).toBe('/audio/hello.mp3')
  })

  it('strips leading slash when using sub-path base URL', () => {
    expect(joinAudioUrl('/haunted-lao/', '/audio/hello.mp3')).toBe(
      '/haunted-lao/audio/hello.mp3',
    )
  })

  it('works with nested audio paths', () => {
    expect(joinAudioUrl('/app/', 'audio/folder/word.mp3')).toBe(
      '/app/audio/folder/word.mp3',
    )
  })

  it('result never contains //', () => {
    const cases = [
      joinAudioUrl('/', '/audio/a.mp3'),
      joinAudioUrl('/sub/', '/audio/a.mp3'),
      joinAudioUrl('/sub/', 'audio/a.mp3'),
    ]
    for (const url of cases) {
      expect(url).not.toContain('//')
    }
  })
})
