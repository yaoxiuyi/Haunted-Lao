/**
 * Haunted Lao — useQuiz hook
 *
 * The single source of truth for all quiz state.
 * App.tsx instantiates this once and passes its return value down to pages.
 *
 * Design contract (design doc v0.2 + v0.3 patch §4.2):
 *
 * - initQuiz()     : Filter verified words, attempt to build a 10-question queue.
 *                    Returns QuizInitResult. On failure, state is NOT changed.
 * - submitAnswer() : Record the user's choice for the current question.
 *                    Only callable when the current question has not been answered.
 * - nextQuestion() : Advance the index. Sets isFinished when all answers are in.
 * - resetQuiz()    : Clear all state (called before "play again").
 *
 * wrongWords is DERIVED from answers — not stored separately.
 * An AnswerRecord is only written when the user actively submits; questions
 * skipped due to audio failure produce no record and do not count as wrong.
 *
 * Result page is shown only when answers.length === queue.length (all 10 submitted).
 */

import { useState, useCallback, useMemo } from 'react'
import type { Word, QuizQuestion, AnswerRecord, QuizInitResult } from '../types'
import { buildQuizQueue } from '../utils/quiz'

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface UseQuizReturn {
  // ── State (read-only) ──────────────────────────────────────────────────
  queue: QuizQuestion[]
  currentIndex: number
  currentQuestion: QuizQuestion | null
  answers: AnswerRecord[]
  /** Derived: words where the user submitted a wrong answer this round. */
  wrongWords: Word[]
  isFinished: boolean
  totalAnswered: number
  correctCount: number

  // ── Actions ────────────────────────────────────────────────────────────
  /**
   * Build a new quiz queue from `allWords`.
   * Returns the result; on failure the existing state is unchanged.
   */
  initQuiz: (allWords: Word[]) => QuizInitResult
  /**
   * Record the user's answer for the current question.
   * No-op if the question has already been answered.
   */
  submitAnswer: (selectedIndex: 0 | 1 | 2 | 3) => void
  /**
   * Advance to the next question, or mark the quiz finished if this was
   * the last question and it has been answered.
   * No-op if the current question has not yet been answered.
   */
  nextQuestion: () => void
  /** Reset all state. Called before starting a new round. */
  resetQuiz: () => void
}

// ---------------------------------------------------------------------------
// Hook implementation
// ---------------------------------------------------------------------------

export function useQuiz(): UseQuizReturn {
  const [queue, setQueue] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [isFinished, setIsFinished] = useState(false)

  // ── Derived values ────────────────────────────────────────────────────

  const currentQuestion = queue[currentIndex] ?? null

  const wrongWords = useMemo<Word[]>(() => {
    return answers
      .filter(a => !a.isCorrect)
      .map(a => {
        const q = queue.find(q => q.word.id === a.questionId)
        return q?.word
      })
      .filter((w): w is Word => w !== undefined)
  }, [answers, queue])

  const totalAnswered = answers.length
  const correctCount = useMemo(
    () => answers.filter(a => a.isCorrect).length,
    [answers],
  )

  // ── Actions ──────────────────────────────────────────────────────────

  const initQuiz = useCallback((allWords: Word[]): QuizInitResult => {
    const result = buildQuizQueue(allWords)
    if (!result.ok) {
      // Do NOT mutate state on failure
      return result
    }
    // Reset all state atomically before setting the new queue
    setAnswers([])
    setCurrentIndex(0)
    setIsFinished(false)
    setQueue(result.queue!)
    return { ok: true }
  }, [])

  const submitAnswer = useCallback(
    (selectedIndex: 0 | 1 | 2 | 3) => {
      if (!currentQuestion) return
      // Guard: don't allow re-submission for the same question
      const alreadyAnswered = answers.some(
        a => a.questionId === currentQuestion.word.id,
      )
      if (alreadyAnswered) return

      const isCorrect = selectedIndex === currentQuestion.correctIndex
      const record: AnswerRecord = {
        questionId: currentQuestion.word.id,
        selectedIndex,
        isCorrect,
      }
      setAnswers(prev => [...prev, record])
    },
    [currentQuestion, answers],
  )

  const nextQuestion = useCallback(() => {
    if (!currentQuestion) return
    // Guard: only advance if this question has been answered
    const answered = answers.some(a => a.questionId === currentQuestion.word.id)
    if (!answered) return

    const nextIndex = currentIndex + 1
    if (nextIndex >= queue.length) {
      // All questions answered — but only mark finished if answers count matches
      // (belt-and-suspenders: submitAnswer guard already ensures this)
      setIsFinished(true)
    } else {
      setCurrentIndex(nextIndex)
    }
  }, [currentQuestion, answers, currentIndex, queue.length])

  const resetQuiz = useCallback(() => {
    setQueue([])
    setCurrentIndex(0)
    setAnswers([])
    setIsFinished(false)
  }, [])

  return {
    queue,
    currentIndex,
    currentQuestion,
    answers,
    wrongWords,
    isFinished,
    totalAnswered,
    correctCount,
    initQuiz,
    submitAnswer,
    nextQuestion,
    resetQuiz,
  }
}
