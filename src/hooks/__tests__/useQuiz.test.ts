/**
 * T-05a Integration tests — useQuiz hook
 *
 * Uses locally-constructed 'verified' word fixtures (NOT testFixtureWords).
 * All state assertions use renderHook + act from @testing-library/react.
 */

import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuiz } from '../useQuiz'
import type { Word } from '../../types'

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeWord(id: string, chinese: string): Word {
  return {
    id,
    lao: `lao-${id}`,
    chinese,
    audioFile: `audio/${id}.mp3`,
    status: 'verified',
  }
}

/** 15 verified words with distinct chinese values. */
const WORDS_15: Word[] = Array.from({ length: 15 }, (_, i) =>
  makeWord(`w${String(i + 1).padStart(2, '0')}`, `词${String(i + 1).padStart(2, '0')}`),
)

/** 9 verified words — insufficient for a 10-question round. */
const WORDS_9 = WORDS_15.slice(0, 9)

/** Pending / audio-only words that must be ignored. */
const WORDS_WITH_NON_VERIFIED: Word[] = [
  ...WORDS_9,
  { ...makeWord('p1', '待定1'), status: 'pending' },
  { ...makeWord('p2', '待定2'), status: 'audio-only' },
]

// ---------------------------------------------------------------------------
// Helper: advance a hook through an entire quiz round
// ---------------------------------------------------------------------------

function submitAll(
  result: ReturnType<typeof renderHook<ReturnType<typeof useQuiz>, unknown>>['result'],
  choices: Array<0 | 1 | 2 | 3>,
) {
  for (const choice of choices) {
    act(() => { result.current.submitAnswer(choice) })
    act(() => { result.current.nextQuestion() })
  }
}

// ---------------------------------------------------------------------------
// initQuiz
// ---------------------------------------------------------------------------

describe('useQuiz — initQuiz', () => {
  it('returns ok:true and populates a queue of 10 with sufficient words', () => {
    const { result } = renderHook(() => useQuiz())
    let initResult: ReturnType<typeof result.current.initQuiz>

    act(() => { initResult = result.current.initQuiz(WORDS_15) })

    expect(initResult!.ok).toBe(true)
    expect(result.current.queue).toHaveLength(10)
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.isFinished).toBe(false)
    expect(result.current.answers).toHaveLength(0)
  })

  it('returns ok:false (insufficient-words) and does NOT change state when < 10 verified words', () => {
    const { result } = renderHook(() => useQuiz())
    // First set up a valid quiz so state is non-empty
    act(() => { result.current.initQuiz(WORDS_15) })
    const prevQueue = result.current.queue

    let initResult: ReturnType<typeof result.current.initQuiz>
    act(() => { initResult = result.current.initQuiz(WORDS_9) })

    expect(initResult!.ok).toBe(false)
    if (initResult!.ok) return
    expect(initResult!.reason).toBe('insufficient-words')
    expect(initResult!.available).toBe(9)
    // State must be unchanged
    expect(result.current.queue).toBe(prevQueue)
  })

  it('ignores pending and audio-only words when counting verified', () => {
    const { result } = renderHook(() => useQuiz())
    let initResult: ReturnType<typeof result.current.initQuiz>
    act(() => { initResult = result.current.initQuiz(WORDS_WITH_NON_VERIFIED) })

    expect(initResult!.ok).toBe(false)
    if (initResult!.ok) return
    expect(initResult!.reason).toBe('insufficient-words')
    expect(initResult!.available).toBe(9)
  })

  it('resets previous answers and index on successful re-init', () => {
    const { result } = renderHook(() => useQuiz())
    act(() => { result.current.initQuiz(WORDS_15) })
    // Answer first question
    act(() => { result.current.submitAnswer(result.current.currentQuestion!.correctIndex) })
    expect(result.current.answers).toHaveLength(1)

    // Re-init: answers and index should reset
    act(() => { result.current.initQuiz(WORDS_15) })
    expect(result.current.answers).toHaveLength(0)
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.isFinished).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// submitAnswer
// ---------------------------------------------------------------------------

describe('useQuiz — submitAnswer', () => {
  it('records a correct answer when the right index is selected', () => {
    const { result } = renderHook(() => useQuiz())
    act(() => { result.current.initQuiz(WORDS_15) })
    const correctIdx = result.current.currentQuestion!.correctIndex

    act(() => { result.current.submitAnswer(correctIdx) })

    expect(result.current.answers).toHaveLength(1)
    expect(result.current.answers[0]!.isCorrect).toBe(true)
    expect(result.current.answers[0]!.selectedIndex).toBe(correctIdx)
  })

  it('records an incorrect answer when a wrong index is selected', () => {
    const { result } = renderHook(() => useQuiz())
    act(() => { result.current.initQuiz(WORDS_15) })
    const correctIdx = result.current.currentQuestion!.correctIndex
    const wrongIdx = ((correctIdx + 1) % 4) as 0 | 1 | 2 | 3

    act(() => { result.current.submitAnswer(wrongIdx) })

    expect(result.current.answers[0]!.isCorrect).toBe(false)
    expect(result.current.answers[0]!.selectedIndex).toBe(wrongIdx)
  })

  it('is a no-op when called a second time for the same question', () => {
    const { result } = renderHook(() => useQuiz())
    act(() => { result.current.initQuiz(WORDS_15) })
    const correctIdx = result.current.currentQuestion!.correctIndex
    const wrongIdx = ((correctIdx + 1) % 4) as 0 | 1 | 2 | 3

    act(() => { result.current.submitAnswer(correctIdx) })
    act(() => { result.current.submitAnswer(wrongIdx) }) // second call — no-op

    expect(result.current.answers).toHaveLength(1)
    expect(result.current.answers[0]!.isCorrect).toBe(true) // first answer preserved
  })

  it('is a no-op when no quiz is active (empty queue)', () => {
    const { result } = renderHook(() => useQuiz())
    act(() => { result.current.submitAnswer(0) })
    expect(result.current.answers).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// nextQuestion
// ---------------------------------------------------------------------------

describe('useQuiz — nextQuestion', () => {
  it('does not advance if the current question has not been answered', () => {
    const { result } = renderHook(() => useQuiz())
    act(() => { result.current.initQuiz(WORDS_15) })

    act(() => { result.current.nextQuestion() }) // no submitAnswer first
    expect(result.current.currentIndex).toBe(0)
  })

  it('advances the index after a question is answered', () => {
    const { result } = renderHook(() => useQuiz())
    act(() => { result.current.initQuiz(WORDS_15) })
    act(() => { result.current.submitAnswer(result.current.currentQuestion!.correctIndex) })

    act(() => { result.current.nextQuestion() })
    expect(result.current.currentIndex).toBe(1)
  })

  it('sets isFinished after the last question is answered and nextQuestion is called', () => {
    const { result } = renderHook(() => useQuiz())
    act(() => { result.current.initQuiz(WORDS_15) })

    // Answer all 10 questions (always select index 0)
    for (let i = 0; i < 10; i++) {
      act(() => { result.current.submitAnswer(0) })
      act(() => { result.current.nextQuestion() })
    }

    expect(result.current.isFinished).toBe(true)
    expect(result.current.answers).toHaveLength(10)
  })

  it('does not increment index beyond queue length', () => {
    const { result } = renderHook(() => useQuiz())
    act(() => { result.current.initQuiz(WORDS_15) })
    submitAll(result, Array(10).fill(0) as Array<0 | 1 | 2 | 3>)

    expect(result.current.currentIndex).toBe(9) // stays at last index when finished
  })
})

// ---------------------------------------------------------------------------
// wrongWords (derived)
// ---------------------------------------------------------------------------

describe('useQuiz — wrongWords', () => {
  it('is empty when all answers are correct', () => {
    const { result } = renderHook(() => useQuiz())
    act(() => { result.current.initQuiz(WORDS_15) })

    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.submitAnswer(result.current.currentQuestion!.correctIndex)
      })
      act(() => { result.current.nextQuestion() })
    }

    expect(result.current.wrongWords).toHaveLength(0)
  })

  it('contains only words where the user submitted an incorrect answer', () => {
    const { result } = renderHook(() => useQuiz())
    act(() => { result.current.initQuiz(WORDS_15) })

    // Submit wrong answer for question 0
    const q0 = result.current.currentQuestion!
    const wrongIdx = ((q0.correctIndex + 1) % 4) as 0 | 1 | 2 | 3
    act(() => { result.current.submitAnswer(wrongIdx) })
    act(() => { result.current.nextQuestion() })

    // Submit correct for remaining 9
    for (let i = 1; i < 10; i++) {
      act(() => {
        result.current.submitAnswer(result.current.currentQuestion!.correctIndex)
      })
      act(() => { result.current.nextQuestion() })
    }

    expect(result.current.wrongWords).toHaveLength(1)
    expect(result.current.wrongWords[0]!.id).toBe(q0.word.id)
  })

  it('does NOT include questions that were never submitted (audio-skip scenario)', () => {
    const { result } = renderHook(() => useQuiz())
    act(() => { result.current.initQuiz(WORDS_15) })

    // Answer only 5 out of 10 questions — the other 5 are "skipped"
    for (let i = 0; i < 5; i++) {
      act(() => { result.current.submitAnswer(0) }) // some correct, some wrong
      act(() => { result.current.nextQuestion() })
    }

    // wrongWords must only reflect the 5 answered questions
    const wrongCount = result.current.wrongWords.length
    expect(wrongCount).toBeLessThanOrEqual(5)
    // None of the word IDs in wrongWords should be from unanswered questions
    const answeredIds = result.current.answers.map(a => a.questionId)
    for (const w of result.current.wrongWords) {
      expect(answeredIds).toContain(w.id)
    }
  })
})

// ---------------------------------------------------------------------------
// correctCount / totalAnswered
// ---------------------------------------------------------------------------

describe('useQuiz — correctCount and totalAnswered', () => {
  it('totalAnswered reflects only submitted answers', () => {
    const { result } = renderHook(() => useQuiz())
    act(() => { result.current.initQuiz(WORDS_15) })
    expect(result.current.totalAnswered).toBe(0)

    act(() => { result.current.submitAnswer(0) })
    expect(result.current.totalAnswered).toBe(1)
  })

  it('correctCount increments only for correct submissions', () => {
    const { result } = renderHook(() => useQuiz())
    act(() => { result.current.initQuiz(WORDS_15) })

    const correctIdx = result.current.currentQuestion!.correctIndex
    act(() => { result.current.submitAnswer(correctIdx) })
    act(() => { result.current.nextQuestion() })
    expect(result.current.correctCount).toBe(1)

    // Submit wrong for second question
    const wrongIdx = ((result.current.currentQuestion!.correctIndex + 1) % 4) as 0 | 1 | 2 | 3
    act(() => { result.current.submitAnswer(wrongIdx) })
    expect(result.current.correctCount).toBe(1) // still 1
  })
})

// ---------------------------------------------------------------------------
// resetQuiz
// ---------------------------------------------------------------------------

describe('useQuiz — resetQuiz', () => {
  it('clears all state to initial values', () => {
    const { result } = renderHook(() => useQuiz())
    act(() => { result.current.initQuiz(WORDS_15) })
    act(() => { result.current.submitAnswer(0) })

    act(() => { result.current.resetQuiz() })

    expect(result.current.queue).toHaveLength(0)
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.answers).toHaveLength(0)
    expect(result.current.isFinished).toBe(false)
    expect(result.current.wrongWords).toHaveLength(0)
    expect(result.current.currentQuestion).toBeNull()
  })
})
