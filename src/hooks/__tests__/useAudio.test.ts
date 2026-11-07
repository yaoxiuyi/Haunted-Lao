/**
 * T-08 Unit/integration tests — useAudio hook
 *
 * jsdom does not implement HTMLAudioElement.play() fully, so we mock it
 * per-test to control whether play() resolves, rejects with NotAllowedError,
 * or rejects with a generic error.
 *
 * Tests verify:
 * - Correct audioState transitions on play success / failure
 * - cancelled ref prevents stale Promise from updating state after stop()
 * - Unmount cleanup (no setState after unmount warning)
 * - error-blocked vs error-load discrimination
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAudio } from '../useAudio'

// ---------------------------------------------------------------------------
// HTMLAudioElement mock factory
// ---------------------------------------------------------------------------

type MockAudioInstance = {
  src: string
  play: ReturnType<typeof vi.fn>
  pause: ReturnType<typeof vi.fn>
  onended: (() => void) | null
  onerror: (() => void) | null
}

/** Create a new mock Audio instance. The play() implementation is set per-test. */
function makeMockAudio(): MockAudioInstance {
  return {
    src: '',
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
    onended: null,
    onerror: null,
  }
}

let mockAudioInstance: MockAudioInstance

beforeEach(() => {
  mockAudioInstance = makeMockAudio()
  // Override the global Audio constructor for every test
  vi.stubGlobal('Audio', vi.fn(() => mockAudioInstance))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_FILE = 'audio/test.mp3'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useAudio — initial state', () => {
  it('starts in idle state', () => {
    const { result } = renderHook(() => useAudio(TEST_FILE))
    expect(result.current.audioState).toBe('idle')
  })
})

describe('useAudio — play() success', () => {
  it('transitions through loading → playing when play() resolves', async () => {
    mockAudioInstance.play.mockResolvedValue(undefined)
    const { result } = renderHook(() => useAudio(TEST_FILE))

    await act(async () => {
      result.current.play()
      // Let the microtask queue flush so the Promise .then() callback runs
      await Promise.resolve()
    })

    expect(result.current.audioState).toBe('playing')
  })

  it('returns to idle when audio ends (onended fires)', async () => {
    mockAudioInstance.play.mockResolvedValue(undefined)
    const { result } = renderHook(() => useAudio(TEST_FILE))

    await act(async () => {
      result.current.play()
      await Promise.resolve()
    })
    expect(result.current.audioState).toBe('playing')

    act(() => {
      // Simulate the audio element firing its onended event
      mockAudioInstance.onended?.()
    })
    expect(result.current.audioState).toBe('idle')
  })
})

describe('useAudio — play() error-blocked (NotAllowedError)', () => {
  it('sets audioState to error-blocked when browser blocks autoplay', async () => {
    const blockedError = new DOMException('play() was prevented', 'NotAllowedError')
    mockAudioInstance.play.mockRejectedValue(blockedError)

    const { result } = renderHook(() => useAudio(TEST_FILE))

    await act(async () => {
      result.current.play()
      await Promise.resolve()
    })

    expect(result.current.audioState).toBe('error-blocked')
  })
})

describe('useAudio — play() error-load (resource error)', () => {
  it('sets audioState to error-load when a non-NotAllowedError occurs', async () => {
    const loadError = new DOMException('media error', 'AbortError')
    mockAudioInstance.play.mockRejectedValue(loadError)

    const { result } = renderHook(() => useAudio(TEST_FILE))

    await act(async () => {
      result.current.play()
      await Promise.resolve()
    })

    expect(result.current.audioState).toBe('error-load')
  })

  it('sets audioState to error-load when audio onerror fires', async () => {
    // play() resolves (audio starts loading), but the element fires onerror
    mockAudioInstance.play.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAudio(TEST_FILE))

    await act(async () => {
      result.current.play()
      await Promise.resolve()
    })
    expect(result.current.audioState).toBe('playing')

    act(() => {
      mockAudioInstance.onerror?.()
    })
    expect(result.current.audioState).toBe('error-load')
  })

  it('sets error-load when audioFile is null', async () => {
    const { result } = renderHook(() => useAudio(null))

    act(() => {
      result.current.play()
    })

    expect(result.current.audioState).toBe('error-load')
  })
})

describe('useAudio — stop()', () => {
  it('resets audioState to idle and calls pause()', async () => {
    mockAudioInstance.play.mockResolvedValue(undefined)
    const { result } = renderHook(() => useAudio(TEST_FILE))

    await act(async () => {
      result.current.play()
      await Promise.resolve()
    })
    expect(result.current.audioState).toBe('playing')

    act(() => { result.current.stop() })

    expect(result.current.audioState).toBe('idle')
    expect(mockAudioInstance.pause).toHaveBeenCalled()
  })
})

describe('useAudio — cancelled ref: stale Promise after stop()', () => {
  it('does NOT update audioState when play() Promise resolves after stop()', async () => {
    // Create a manually-resolved Promise so we can control timing
    let resolvePlay!: () => void
    const delayedPromise = new Promise<void>(res => { resolvePlay = res })
    mockAudioInstance.play.mockReturnValue(delayedPromise)

    const { result } = renderHook(() => useAudio(TEST_FILE))

    // Start playing (Promise is pending)
    act(() => { result.current.play() })
    expect(result.current.audioState).toBe('loading')

    // Stop before Promise resolves — sets cancelled = true
    act(() => { result.current.stop() })
    expect(result.current.audioState).toBe('idle')

    // Now resolve the stale Promise — should be a no-op
    await act(async () => {
      resolvePlay()
      await Promise.resolve()
    })

    // State must remain 'idle' — the cancelled guard prevented the update
    expect(result.current.audioState).toBe('idle')
  })

  it('does NOT update audioState when play() Promise rejects after stop()', async () => {
    let rejectPlay!: (err: unknown) => void
    const delayedPromise = new Promise<void>((_, rej) => { rejectPlay = rej })
    mockAudioInstance.play.mockReturnValue(delayedPromise)

    const { result } = renderHook(() => useAudio(TEST_FILE))

    act(() => { result.current.play() })
    act(() => { result.current.stop() })
    expect(result.current.audioState).toBe('idle')

    await act(async () => {
      rejectPlay(new DOMException('blocked', 'NotAllowedError'))
      await Promise.resolve()
    })

    expect(result.current.audioState).toBe('idle')
  })

  it('does NOT update audioState when onerror fires after stop()', async () => {
    mockAudioInstance.play.mockResolvedValue(undefined)
    const { result } = renderHook(() => useAudio(TEST_FILE))

    await act(async () => {
      result.current.play()
      await Promise.resolve()
    })

    act(() => { result.current.stop() })

    act(() => {
      // Simulate the old Audio instance firing onerror after cleanup
      mockAudioInstance.onerror?.()
    })

    expect(result.current.audioState).toBe('idle')
  })
})

describe('useAudio — unmount cleanup', () => {
  it('does not update state after unmount (no stale closure warning)', async () => {
    let resolvePlay!: () => void
    const delayedPromise = new Promise<void>(res => { resolvePlay = res })
    mockAudioInstance.play.mockReturnValue(delayedPromise)

    const { result, unmount } = renderHook(() => useAudio(TEST_FILE))
    act(() => { result.current.play() })

    // Unmount while Promise is still pending
    unmount()

    // Resolve after unmount — should not throw or warn
    await act(async () => {
      resolvePlay()
      await Promise.resolve()
    })

    // We can only verify no thrown error; state check after unmount is not meaningful
    expect(mockAudioInstance.pause).toHaveBeenCalled()
  })
})
