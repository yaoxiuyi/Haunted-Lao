/**
 * Haunted Lao — App root
 *
 * Owns:
 *   - phase: AppPhase  (which page is visible)
 *   - initError        (inline error message when quiz cannot start)
 *
 * Does NOT own quiz state — that lives entirely in useQuiz().
 * Does NOT own audio state — useAudio lives inside QuizPage.
 */

import { useState, useEffect } from 'react'
import type { AppPhase } from './types'
import { useQuiz } from './hooks/useQuiz'
import { words } from './data/words'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './components/home/HomePage'
import { BrowsePage } from './components/browse/BrowsePage'
import { QuizPage } from './components/quiz/QuizPage'
import { ResultPage } from './components/result/ResultPage'
import { ReviewPage } from './components/review/ReviewPage'

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('home')
  const [initError, setInitError] = useState<string | null>(null)

  const quiz = useQuiz()

  // Transition to result page when quiz finishes.
  // Using useEffect avoids the React batched-state race condition that would
  // occur if we read quiz.isFinished immediately after calling nextQuestion().
  useEffect(() => {
    if (quiz.isFinished && phase === 'quiz') {
      setPhase('result')
    }
  }, [quiz.isFinished, phase])

  // ── Quiz lifecycle helpers ───────────────────────────────────────────

  const startQuiz = () => {
    const result = quiz.initQuiz(words)
    if (!result.ok) {
      if (result.reason === 'insufficient-words') {
        setInitError(
          `当前仅有 ${result.available} 条词语通过核实，需要至少 10 条才能开始练习。`,
        )
      } else {
        setInitError('词条数据异常，无法构建题目选项。请联系开发者。')
      }
      return result
    }
    setInitError(null)
    setPhase('quiz')
    return result
  }

  const handlePlayAgain = () => {
    quiz.resetQuiz()
    const result = quiz.initQuiz(words)
    if (result.ok) {
      setPhase('quiz')
    } else {
      setPhase('home')
    }
  }

  // ── Phase-specific content ───────────────────────────────────────────

  const renderContent = () => {
    switch (phase) {
      case 'home':
        return (
          <>
            <HomePage
              onBrowse={() => { setInitError(null); setPhase('browse') }}
              onStartQuiz={startQuiz}
            />
            {initError && (
              <p
                role="alert"
                style={{
                  color: '#ef9a9a',
                  background: '#2a0a0a',
                  border: '1px solid #e53935',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  maxWidth: '360px',
                  fontSize: '0.9rem',
                  margin: '0 1rem',
                }}
              >
                {initError}
              </p>
            )}
          </>
        )

      case 'browse':
        return (
          <BrowsePage
            words={words}
            onStartQuiz={() => startQuiz()}
            onHome={() => setPhase('home')}
          />
        )

      case 'quiz': {
        if (!quiz.currentQuestion) {
          return <p style={{ color: '#aaa' }}>加载中…</p>
        }
        const currentAnswer =
          quiz.answers.find(a => a.questionId === quiz.currentQuestion!.word.id) ?? null

        return (
          <QuizPage
            currentQuestion={quiz.currentQuestion}
            currentIndex={quiz.currentIndex}
            totalCount={quiz.queue.length}
            currentAnswer={currentAnswer}
            onSelectOption={idx => quiz.submitAnswer(idx)}
            onNext={() => quiz.nextQuestion()}
            onHome={() => {
              quiz.resetQuiz()
              setPhase('home')
            }}
          />
        )
      }

      case 'result':
        return (
          <ResultPage
            correctCount={quiz.correctCount}
            totalAnswered={quiz.totalAnswered}
            wrongWords={quiz.wrongWords}
            onPlayAgain={handlePlayAgain}
            onReview={() => setPhase('review')}
          />
        )

      case 'review':
        return (
          <ReviewPage
            wrongWords={quiz.wrongWords}
            onBack={() => setPhase('result')}
          />
        )
    }
  }

  return <AppShell>{renderContent()}</AppShell>
}
