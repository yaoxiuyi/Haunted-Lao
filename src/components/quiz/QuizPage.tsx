/**
 * QuizPage — Active quiz round.
 * T-08: useAudio wired in. Audio auto-plays on each new question.
 *
 * Design rules (design doc v0.3):
 * - useAudio is instantiated here (not in App) so its lifecycle is tied
 *   to the quiz phase being visible.
 * - Auto-play is triggered by a useEffect watching currentIndex.
 *   The cleanup function calls stop() to prevent overlap between questions.
 * - Options are disabled when audioState is 'error-blocked' or 'error-load'.
 *   Users must either retry audio or exit — they cannot submit without audio
 *   playing (design rule: no answer submitted = no AnswerRecord = no wrong-word).
 * - Lao text is always shown so users have a visual reference even on audio error.
 */

import { useEffect } from 'react'
import type { QuizQuestion, AnswerRecord } from '../../types'
import { useAudio } from '../../hooks/useAudio'
import { QuizCard } from './QuizCard'
import { OptionList } from './OptionList'

interface QuizPageProps {
  currentQuestion: QuizQuestion
  currentIndex: number
  totalCount: number
  currentAnswer: AnswerRecord | null
  onSelectOption: (index: 0 | 1 | 2 | 3) => void
  onNext: () => void
  onHome: () => void
}

export function QuizPage({
  currentQuestion,
  currentIndex,
  totalCount,
  currentAnswer,
  onSelectOption,
  onNext,
  onHome,
}: QuizPageProps) {
  const { audioState, play, stop } = useAudio(currentQuestion.word.audioFile)

  // Auto-play when entering a new question. Cleanup stops audio on question change
  // and on unmount, preventing overlap between questions.
  useEffect(() => {
    play()
    return () => {
      stop()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  const isAnswered = currentAnswer !== null
  const isLastQuestion = currentIndex === totalCount - 1

  // Audio-gate: options are disabled when audio has failed.
  // User must retry or exit — cannot submit without audio context.
  const audioFailed = audioState === 'error-blocked' || audioState === 'error-load'
  const optionsDisabled = audioFailed && !isAnswered

  return (
    <div
      style={{
        padding: '1.5rem',
        width: '100%',
        maxWidth: '480px',
        textAlign: 'center',
      }}
    >
      {/* Progress indicator */}
      <div style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>
        第 {currentIndex + 1} / {totalCount} 题
      </div>

      {/* Audio card (play button + error warnings) */}
      <QuizCard
        lao={currentQuestion.word.lao}
        audioState={audioState}
        onPlay={play}
        onHome={onHome}
      />

      {/* Answer options */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          margin: '1.5rem 0',
        }}
      >
        <OptionList
          options={currentQuestion.options}
          selectedIndex={currentAnswer?.selectedIndex ?? null}
          correctIndex={currentQuestion.correctIndex}
          isAnswered={isAnswered}
          disabled={optionsDisabled}
          onSelect={onSelectOption}
        />
      </div>

      {/* Next button — only visible after answering; hidden when audio failed */}
      {isAnswered && !audioFailed && (
        <button
          type="button"
          onClick={onNext}
          style={{
            padding: '0.875rem 2rem',
            background: '#ff6b00',
            color: '#fff',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          {isLastQuestion ? '查看结果 →' : '下一题 →'}
        </button>
      )}
    </div>
  )
}
