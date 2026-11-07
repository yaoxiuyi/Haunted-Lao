/**
 * Haunted Lao — useAudio hook
 *
 * Manages a single HTMLAudioElement instance.
 *
 * Design contract (design doc v0.2 + v0.3 patch):
 *
 * - Default behaviour: does NOT auto-play on mount or src change.
 * - QuizPage is the ONLY caller of play() for auto-play (via useEffect on
 *   currentIndex). BrowsePage and ReviewPage only call play() on user click.
 * - Calling play() when a previous play() Promise is still pending is safe:
 *   the cancelled ref ensures the stale Promise result is ignored.
 * - stop() must be called before switching src (handled by QuizPage's
 *   useEffect cleanup) and on component unmount.
 *
 * Error discrimination:
 *   error-blocked : browser rejected autoplay (DOMException name NotAllowedError)
 *   error-load    : audio resource failed to load or decode (all other errors)
 *
 * The cancelled ref guards against:
 *   - Stale play() Promise resolving/rejecting after src change or unmount
 *   - Old 'error' event handlers firing on the previous Audio instance
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import type { AudioPlayState } from '../types'
import { resolveAudioUrl } from '../utils/audio'

export interface UseAudioReturn {
  audioState: AudioPlayState
  /** Trigger playback. In QuizPage this is called from a useEffect for auto-play. */
  play: () => void
  /** Stop playback and reset state to 'idle'. */
  stop: () => void
}

export function useAudio(audioFile: string | null): UseAudioReturn {
  const [audioState, setAudioState] = useState<AudioPlayState>('idle')

  // Mutable ref holding the current Audio instance.
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // When true, any in-flight Promise callbacks or event handlers must be ignored.
  const cancelledRef = useRef(false)

  // ── Cleanup helper ────────────────────────────────────────────────────

  const destroyAudio = useCallback(() => {
    cancelledRef.current = true
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.src = ''           // release network resource
      audio.onended = null
      audio.onerror = null
      audioRef.current = null
    }
  }, [])

  // ── play ──────────────────────────────────────────────────────────────

  const play = useCallback(() => {
    if (!audioFile) {
      setAudioState('error-load')
      return
    }

    // Destroy any previous instance and create a fresh one.
    destroyAudio()
    cancelledRef.current = false

    const audio = new Audio(resolveAudioUrl(audioFile))
    audioRef.current = audio

    // Handle resource-load errors (network / format errors).
    audio.onerror = () => {
      if (cancelledRef.current) return
      setAudioState('error-load')
    }

    audio.onended = () => {
      if (cancelledRef.current) return
      setAudioState('idle')
    }

    setAudioState('loading')

    const promise = audio.play()
    if (promise !== undefined) {
      promise.then(() => {
        if (cancelledRef.current) return
        setAudioState('playing')
      }).catch((err: unknown) => {
        if (cancelledRef.current) return
        // NotAllowedError = browser blocked autoplay
        const isBlocked =
          err instanceof DOMException && err.name === 'NotAllowedError'
        setAudioState(isBlocked ? 'error-blocked' : 'error-load')
      })
    }
  }, [audioFile, destroyAudio])

  // ── stop ──────────────────────────────────────────────────────────────

  const stop = useCallback(() => {
    destroyAudio()
    setAudioState('idle')
  }, [destroyAudio])

  // ── Cleanup on unmount ────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      destroyAudio()
    }
  }, [destroyAudio])

  return { audioState, play, stop }
}
