/**
 * T-07 Component tests — ReviewPage
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewPage } from '../ReviewPage'
import type { Word } from '../../../types'

function makeWord(id: string, lao: string, chinese: string): Word {
  return { id, lao, chinese, audioFile: `audio/${id}.mp3`, status: 'verified' }
}

const WRONG_3: Word[] = [
  makeWord('w1', 'ລາວ໑', '错词1'),
  makeWord('w2', 'ລາວ໒', '错词2'),
  makeWord('w3', 'ລາວ໓', '错词3'),
]

describe('ReviewPage — display', () => {
  it('shows the first wrong word on initial render', () => {
    render(<ReviewPage wrongWords={WRONG_3} onBack={vi.fn()} />)
    expect(screen.getByText('ລາວ໑')).toBeInTheDocument()
    expect(screen.getByText('错词1')).toBeInTheDocument()
  })

  it('shows page indicator for wrong words', () => {
    render(<ReviewPage wrongWords={WRONG_3} onBack={vi.fn()} />)
    // Header shows "错词回顾 1 / 3", nav shows "1 / 3"
    expect(screen.getAllByText(/1 \/ 3/).length).toBeGreaterThan(0)
  })

  it('navigates to next wrong word', async () => {
    const user = userEvent.setup()
    render(<ReviewPage wrongWords={WRONG_3} onBack={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: '下一张' }))
    expect(screen.getByText('ລາວ໒')).toBeInTheDocument()
    expect(screen.getByText('错词2')).toBeInTheDocument()
  })

  it('"上一张" is disabled on first card', () => {
    render(<ReviewPage wrongWords={WRONG_3} onBack={vi.fn()} />)
    expect(screen.getByRole('button', { name: '上一张' })).toBeDisabled()
  })

  it('"下一张" is disabled on last card', async () => {
    const user = userEvent.setup()
    render(<ReviewPage wrongWords={WRONG_3} onBack={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: '下一张' }))
    await user.click(screen.getByRole('button', { name: '下一张' }))
    expect(screen.getByRole('button', { name: '下一张' })).toBeDisabled()
  })
})

describe('ReviewPage — back action', () => {
  it('calls onBack when "返回结果" is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<ReviewPage wrongWords={WRONG_3} onBack={onBack} />)
    await user.click(screen.getByRole('button', { name: /返回结果/ }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})

describe('ReviewPage — empty wrong words (guard)', () => {
  it('shows fallback message when wrongWords is empty', () => {
    render(<ReviewPage wrongWords={[]} onBack={vi.fn()} />)
    expect(screen.getByText(/没有需要复习的词语/)).toBeInTheDocument()
  })
})
