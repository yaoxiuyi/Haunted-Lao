/**
 * T-07 Component tests — OptionList
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OptionList } from '../OptionList'

const OPTIONS: [string, string, string, string] = ['选项A', '选项B', '选项C', '选项D']

describe('OptionList — unanswered state', () => {
  it('renders all 4 options', () => {
    render(
      <OptionList
        options={OPTIONS}
        selectedIndex={null}
        correctIndex={1}
        isAnswered={false}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByText('选项A')).toBeInTheDocument()
    expect(screen.getByText('选项B')).toBeInTheDocument()
    expect(screen.getByText('选项C')).toBeInTheDocument()
    expect(screen.getByText('选项D')).toBeInTheDocument()
  })

  it('all options are enabled when not answered', () => {
    render(
      <OptionList
        options={OPTIONS}
        selectedIndex={null}
        correctIndex={1}
        isAnswered={false}
        onSelect={vi.fn()}
      />,
    )
    for (const btn of screen.getAllByRole('button')) {
      expect(btn).not.toBeDisabled()
    }
  })

  it('calls onSelect with correct index when option is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <OptionList
        options={OPTIONS}
        selectedIndex={null}
        correctIndex={1}
        isAnswered={false}
        onSelect={onSelect}
      />,
    )
    await user.click(screen.getByText('选项C'))
    expect(onSelect).toHaveBeenCalledWith(2)
  })

  it('calls onSelect via keyboard Enter', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <OptionList
        options={OPTIONS}
        selectedIndex={null}
        correctIndex={1}
        isAnswered={false}
        onSelect={onSelect}
      />,
    )
    screen.getByText('选项A').focus()
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith(0)
  })
})

describe('OptionList — answered state', () => {
  it('all options are disabled after answering', () => {
    render(
      <OptionList
        options={OPTIONS}
        selectedIndex={2}
        correctIndex={1}
        isAnswered={true}
        onSelect={vi.fn()}
      />,
    )
    for (const btn of screen.getAllByRole('button')) {
      expect(btn).toBeDisabled()
    }
  })

  it('does not call onSelect when a locked option is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <OptionList
        options={OPTIONS}
        selectedIndex={2}
        correctIndex={1}
        isAnswered={true}
        onSelect={onSelect}
      />,
    )
    // clicking a disabled button should not fire the handler
    await user.click(screen.getByText('选项A'))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('aria-pressed is true for the selected option', () => {
    render(
      <OptionList
        options={OPTIONS}
        selectedIndex={0}
        correctIndex={1}
        isAnswered={true}
        onSelect={vi.fn()}
      />,
    )
    const selected = screen.getByText('选项A').closest('button')!
    expect(selected).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('OptionList — disabled prop (audio gate)', () => {
  it('all options are disabled when disabled=true', () => {
    render(
      <OptionList
        options={OPTIONS}
        selectedIndex={null}
        correctIndex={1}
        isAnswered={false}
        disabled={true}
        onSelect={vi.fn()}
      />,
    )
    for (const btn of screen.getAllByRole('button')) {
      expect(btn).toBeDisabled()
    }
  })
})
