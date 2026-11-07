/**
 * T-04 Unit tests — score.ts
 */

import { describe, it, expect } from 'vitest'
import { getScoreTier, getResultCopy } from '../score'

describe('getScoreTier', () => {
  it('returns low for 0/10', () => {
    expect(getScoreTier(0, 10)).toBe('low')
  })

  it('returns low for exactly 40% (4/10)', () => {
    expect(getScoreTier(4, 10)).toBe('low')
  })

  it('returns mid for 41% boundary (5/10 = 50%)', () => {
    expect(getScoreTier(5, 10)).toBe('mid')
  })

  it('returns mid for 7/10 = 70%', () => {
    expect(getScoreTier(7, 10)).toBe('mid')
  })

  it('returns mid for exactly 79% — rounds down to mid (7/9 ≈ 77.7%)', () => {
    // 79% exact: need correct/total = 0.79
    // Use 79/100 to get exactly 79%
    expect(getScoreTier(79, 100)).toBe('mid')
  })

  it('returns high for 80% (8/10)', () => {
    expect(getScoreTier(8, 10)).toBe('high')
  })

  it('returns high for 10/10', () => {
    expect(getScoreTier(10, 10)).toBe('high')
  })

  it('returns low (not NaN error) when total is 0', () => {
    expect(getScoreTier(0, 0)).toBe('low')
  })

  it('returns high for 100% with non-standard total', () => {
    expect(getScoreTier(7, 7)).toBe('high')
  })
})

describe('getResultCopy', () => {
  it('returns a title and body string for each tier', () => {
    for (const tier of ['low', 'mid', 'high'] as const) {
      const copy = getResultCopy(tier)
      expect(typeof copy.title).toBe('string')
      expect(copy.title.length).toBeGreaterThan(0)
      expect(typeof copy.body).toBe('string')
      expect(copy.body.length).toBeGreaterThan(0)
    }
  })

  it('returns different copy for each tier', () => {
    const low = getResultCopy('low')
    const mid = getResultCopy('mid')
    const high = getResultCopy('high')
    expect(low.title).not.toBe(mid.title)
    expect(mid.title).not.toBe(high.title)
    expect(low.title).not.toBe(high.title)
  })
})
