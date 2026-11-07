/**
 * T-07 Component tests — ResultPage
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultPage } from '../ResultPage'
import type { Word } from '../../../types'

function makeWord(id: string): Word {
  return { id, lao: `lao-${id}`, chinese: `词${id}`, audioFile: `audio/${id}.mp3`, status: 'verified' }
}

const NO_WRONG: Word[] = []
const TWO_WRONG: Word[] = [makeWord('w1'), makeWord('w2')]

describe('ResultPage — score display', () => {
  it('shows correct percentage', () => {
    render(
      <ResultPage
        correctCount={8}
        totalAnswered={10}
        wrongWords={NO_WRONG}
        onPlayAgain={vi.fn()}
        onReview={vi.fn()}
      />,
    )
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText(/8 \/ 10 题答对/)).toBeInTheDocument()
  })

  it('shows 0% when totalAnswered is 0 (no divide by zero)', () => {
    render(
      <ResultPage
        correctCount={0}
        totalAnswered={0}
        wrongWords={NO_WRONG}
        onPlayAgain={vi.fn()}
        onReview={vi.fn()}
      />,
    )
    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})

describe('ResultPage — tier copy', () => {
  it('shows low tier copy for 0/10', () => {
    render(
      <ResultPage
        correctCount={0}
        totalAnswered={10}
        wrongWords={NO_WRONG}
        onPlayAgain={vi.fn()}
        onReview={vi.fn()}
      />,
    )
    expect(screen.getByText(/鬼魂/)).toBeInTheDocument()
  })

  it('shows high tier copy for 10/10', () => {
    render(
      <ResultPage
        correctCount={10}
        totalAnswered={10}
        wrongWords={NO_WRONG}
        onPlayAgain={vi.fn()}
        onReview={vi.fn()}
      />,
    )
    expect(screen.getByText(/大法师/)).toBeInTheDocument()
  })
})

describe('ResultPage — actions', () => {
  it('calls onPlayAgain when "再练一次" is clicked', async () => {
    const user = userEvent.setup()
    const onPlayAgain = vi.fn()
    render(
      <ResultPage
        correctCount={5}
        totalAnswered={10}
        wrongWords={NO_WRONG}
        onPlayAgain={onPlayAgain}
        onReview={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: /再练一次/ }))
    expect(onPlayAgain).toHaveBeenCalledOnce()
  })

  it('does NOT show "复习错词" button when no wrong words', () => {
    render(
      <ResultPage
        correctCount={10}
        totalAnswered={10}
        wrongWords={NO_WRONG}
        onPlayAgain={vi.fn()}
        onReview={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: /复习错词/ })).not.toBeInTheDocument()
  })

  it('shows "复习错词" button when there are wrong words', () => {
    render(
      <ResultPage
        correctCount={8}
        totalAnswered={10}
        wrongWords={TWO_WRONG}
        onPlayAgain={vi.fn()}
        onReview={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /复习错词/ })).toBeInTheDocument()
  })

  it('calls onReview when "复习错词" is clicked', async () => {
    const user = userEvent.setup()
    const onReview = vi.fn()
    render(
      <ResultPage
        correctCount={8}
        totalAnswered={10}
        wrongWords={TWO_WRONG}
        onPlayAgain={vi.fn()}
        onReview={onReview}
      />,
    )
    await user.click(screen.getByRole('button', { name: /复习错词/ }))
    expect(onReview).toHaveBeenCalledOnce()
  })
})
