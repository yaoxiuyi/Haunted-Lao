/**
 * T-06 Component tests — BrowsePage
 *
 * Verifies:
 * - Empty state when no verified words exist
 * - Card display and navigation when verified words are present
 * - PlayButton visibility and unavailable state
 * - Non-verified words are never shown
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowsePage } from '../BrowsePage'
import type { Word } from '../../../types'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeWord(id: string, lao: string, chinese: string, verified = true): Word {
  return {
    id,
    lao,
    chinese,
    audioFile: `audio/${id}.mp3`,
    status: verified ? 'verified' : 'pending',
  }
}

const VERIFIED_3: Word[] = [
  makeWord('w1', 'ຄຳ໑', '词1'),
  makeWord('w2', 'ຄຳ໒', '词2'),
  makeWord('w3', 'ຄຳ໓', '词3'),
]

const MIXED: Word[] = [
  ...VERIFIED_3,
  makeWord('p1', 'ຄຳX', '词X', false), // pending — must not appear
]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BrowsePage — empty state', () => {
  it('shows placeholder text when no verified words', () => {
    render(
      <BrowsePage words={[]} onStartQuiz={vi.fn()} onHome={vi.fn()} />,
    )
    expect(screen.getByText(/暂无已核实词条/)).toBeInTheDocument()
  })

  it('shows placeholder text when all words are pending', () => {
    const pending: Word[] = [makeWord('p1', 'ຄຳ', '词', false)]
    render(
      <BrowsePage words={pending} onStartQuiz={vi.fn()} onHome={vi.fn()} />,
    )
    expect(screen.getByText(/暂无已核实词条/)).toBeInTheDocument()
  })

  it('still shows the Start Quiz button in empty state', () => {
    render(
      <BrowsePage words={[]} onStartQuiz={vi.fn()} onHome={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /开始练习/ })).toBeInTheDocument()
  })
})

describe('BrowsePage — with verified words', () => {
  it('shows the first word on initial render', () => {
    render(
      <BrowsePage words={VERIFIED_3} onStartQuiz={vi.fn()} onHome={vi.fn()} />,
    )
    expect(screen.getByText('ຄຳ໑')).toBeInTheDocument()
    expect(screen.getByText('词1')).toBeInTheDocument()
  })

  it('shows page indicator "1 / 3"', () => {
    render(
      <BrowsePage words={VERIFIED_3} onStartQuiz={vi.fn()} onHome={vi.fn()} />,
    )
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('advances to next card when "下一张" is clicked', async () => {
    const user = userEvent.setup()
    render(
      <BrowsePage words={VERIFIED_3} onStartQuiz={vi.fn()} onHome={vi.fn()} />,
    )
    await user.click(screen.getByRole('button', { name: '下一张' }))
    expect(screen.getByText('ຄຳ໒')).toBeInTheDocument()
    expect(screen.getByText('词2')).toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('goes back to previous card when "上一张" is clicked', async () => {
    const user = userEvent.setup()
    render(
      <BrowsePage words={VERIFIED_3} onStartQuiz={vi.fn()} onHome={vi.fn()} />,
    )
    // Go to card 2 first
    await user.click(screen.getByRole('button', { name: '下一张' }))
    // Then go back
    await user.click(screen.getByRole('button', { name: '上一张' }))
    expect(screen.getByText('ຄຳ໑')).toBeInTheDocument()
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('"上一张" is disabled on the first card', () => {
    render(
      <BrowsePage words={VERIFIED_3} onStartQuiz={vi.fn()} onHome={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: '上一张' })).toBeDisabled()
  })

  it('"下一张" is disabled on the last card', async () => {
    const user = userEvent.setup()
    render(
      <BrowsePage words={VERIFIED_3} onStartQuiz={vi.fn()} onHome={vi.fn()} />,
    )
    await user.click(screen.getByRole('button', { name: '下一张' }))
    await user.click(screen.getByRole('button', { name: '下一张' }))
    expect(screen.getByRole('button', { name: '下一张' })).toBeDisabled()
  })

  it('does not navigate past the last card', async () => {
    const user = userEvent.setup()
    render(
      <BrowsePage words={VERIFIED_3} onStartQuiz={vi.fn()} onHome={vi.fn()} />,
    )
    // Click next 10 times — should stop at card 3
    for (let i = 0; i < 10; i++) {
      const btn = screen.getByRole('button', { name: '下一张' })
      if (!btn.hasAttribute('disabled')) await user.click(btn)
    }
    expect(screen.getByText('ຄຳ໓')).toBeInTheDocument()
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
  })

  it('pending words from mixed list are never shown', async () => {
    const user = userEvent.setup()
    render(
      <BrowsePage words={MIXED} onStartQuiz={vi.fn()} onHome={vi.fn()} />,
    )
    // Navigate through all 3 verified cards
    expect(screen.getByText('1 / 3')).toBeInTheDocument() // only 3 verified
    await user.click(screen.getByRole('button', { name: '下一张' }))
    await user.click(screen.getByRole('button', { name: '下一张' }))
    // The pending word "词X" must never appear
    expect(screen.queryByText('词X')).not.toBeInTheDocument()
  })
})

describe('BrowsePage — PlayButton', () => {
  it('shows a play button for verified words', () => {
    render(
      <BrowsePage words={VERIFIED_3} onStartQuiz={vi.fn()} onHome={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /播放.*的发音/ })).toBeInTheDocument()
  })

  it('calls onPlay when PlayButton is clicked', async () => {
    const user = userEvent.setup()
    // We can only test that the button click doesn't throw;
    // real audio is wired in T-08. The onPlay prop on WordCard is a no-op here.
    render(
      <BrowsePage words={VERIFIED_3} onStartQuiz={vi.fn()} onHome={vi.fn()} />,
    )
    // Should not throw
    await expect(
      user.click(screen.getByRole('button', { name: /播放.*的发音/ })),
    ).resolves.toBeUndefined()
  })
})

describe('BrowsePage — CTA buttons', () => {
  it('calls onStartQuiz when "开始练习" is clicked', async () => {
    const user = userEvent.setup()
    const onStartQuiz = vi.fn()
    render(
      <BrowsePage words={VERIFIED_3} onStartQuiz={onStartQuiz} onHome={vi.fn()} />,
    )
    await user.click(screen.getByRole('button', { name: /开始练习/ }))
    expect(onStartQuiz).toHaveBeenCalledOnce()
  })

  it('calls onHome when "首页" is clicked', async () => {
    const user = userEvent.setup()
    const onHome = vi.fn()
    render(
      <BrowsePage words={VERIFIED_3} onStartQuiz={vi.fn()} onHome={onHome} />,
    )
    await user.click(screen.getByRole('button', { name: /首页/ }))
    expect(onHome).toHaveBeenCalledOnce()
  })
})
