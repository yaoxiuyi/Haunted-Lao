/**
 * T-04 Unit tests — quiz.ts
 *
 * Uses locally-constructed 'verified' word fixtures.
 * Does NOT import testFixtureWords (those are status 'pending').
 * Does NOT touch src/data/words.ts production export.
 */

import { describe, it, expect } from 'vitest'
import { buildOptions, buildQuizQueue, shuffleInPlace } from '../quiz'
import type { Word } from '../../types'

// ---------------------------------------------------------------------------
// Test fixture factory
// ---------------------------------------------------------------------------

/** Make a minimal verified Word for testing. */
function makeWord(id: string, chinese: string): Word {
  return {
    id,
    lao: `lao-${id}`,
    chinese,
    audioFile: `audio/${id}.mp3`,
    status: 'verified',
  }
}

/**
 * A pool of 15 verified words with distinct chinese values.
 * Re-created per test (immutable source).
 */
const POOL_15: Word[] = [
  makeWord('w01', '词01'), makeWord('w02', '词02'), makeWord('w03', '词03'),
  makeWord('w04', '词04'), makeWord('w05', '词05'), makeWord('w06', '词06'),
  makeWord('w07', '词07'), makeWord('w08', '词08'), makeWord('w09', '词09'),
  makeWord('w10', '词10'), makeWord('w11', '词11'), makeWord('w12', '词12'),
  makeWord('w13', '词13'), makeWord('w14', '词14'), makeWord('w15', '词15'),
]

// ---------------------------------------------------------------------------
// shuffleInPlace
// ---------------------------------------------------------------------------

describe('shuffleInPlace', () => {
  it('returns the same array reference', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = shuffleInPlace(arr)
    expect(result).toBe(arr)
  })

  it('preserves all elements', () => {
    const arr = [1, 2, 3, 4, 5]
    shuffleInPlace(arr)
    expect(arr.sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('handles empty array without error', () => {
    expect(() => shuffleInPlace([])).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// buildOptions
// ---------------------------------------------------------------------------

describe('buildOptions', () => {
  it('returns ok:true with exactly 4 options when pool has enough words', () => {
    const correct = POOL_15[0]!
    const pool = POOL_15.slice(1) // 14 candidates
    const result = buildOptions(correct, pool)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.options).toHaveLength(4)
  })

  it('includes the correct answer in options', () => {
    const correct = POOL_15[0]!
    const pool = POOL_15.slice(1)
    const result = buildOptions(correct, pool)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.options[result.correctIndex]).toBe(correct.chinese)
  })

  it('all 4 options are distinct strings', () => {
    const correct = POOL_15[0]!
    const pool = POOL_15.slice(1)
    const result = buildOptions(correct, pool)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const unique = new Set(result.options)
    expect(unique.size).toBe(4)
  })

  it('correctIndex is always in range 0–3', () => {
    const correct = POOL_15[0]!
    const pool = POOL_15.slice(1)
    // Run multiple times to catch randomness issues
    for (let i = 0; i < 20; i++) {
      const result = buildOptions(correct, pool)
      expect(result.ok).toBe(true)
      if (!result.ok) return
      expect(result.correctIndex).toBeGreaterThanOrEqual(0)
      expect(result.correctIndex).toBeLessThanOrEqual(3)
    }
  })

  it('pool with duplicate chinese values: duplicates contribute only one candidate', () => {
    const correct = makeWord('c', '正确')
    // Pool has two words sharing the same chinese value
    const poolWithDuplicates: Word[] = [
      makeWord('d1', '干扰1'),
      makeWord('d2', '干扰1'), // duplicate of d1
      makeWord('d3', '干扰2'),
      makeWord('d4', '干扰3'),
    ]
    const result = buildOptions(correct, poolWithDuplicates)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    // All 4 options must still be distinct
    const unique = new Set(result.options)
    expect(unique.size).toBe(4)
  })

  it('excludes pool words whose chinese equals the correct answer', () => {
    const correct = makeWord('c', '相同释义')
    // One pool word shares the same chinese as the correct answer
    const pool: Word[] = [
      makeWord('d1', '相同释义'), // same as correct — must be excluded
      makeWord('d2', '干扰A'),
      makeWord('d3', '干扰B'),
      makeWord('d4', '干扰C'),
    ]
    const result = buildOptions(correct, pool)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    // Correct answer should appear exactly once
    const occurrences = result.options.filter(o => o === '相同释义').length
    expect(occurrences).toBe(1)
  })

  it('returns ok:false with reason insufficient-distractors when pool has only 2 distinct candidates', () => {
    const correct = makeWord('c', '正确')
    const pool: Word[] = [
      makeWord('d1', '干扰1'),
      makeWord('d2', '干扰1'), // duplicate — reduces to 1 unique
      makeWord('d3', '干扰2'),
      // only 2 distinct distractor strings remain
    ]
    const result = buildOptions(correct, pool)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe('insufficient-distractors')
    expect(result.available).toBe(2)
  })

  it('returns ok:false when pool is completely empty', () => {
    const correct = POOL_15[0]!
    const result = buildOptions(correct, [])
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe('insufficient-distractors')
    expect(result.available).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// buildQuizQueue
// ---------------------------------------------------------------------------

describe('buildQuizQueue', () => {
  it('returns ok:true and a queue of 10 questions from 15 verified words', () => {
    const result = buildQuizQueue(POOL_15, 10)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.queue).toHaveLength(10)
  })

  it('queue questions have no duplicate word ids', () => {
    const result = buildQuizQueue(POOL_15, 10)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const ids = result.queue!.map(q => q.word.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(10)
  })

  it('each question has 4 distinct options', () => {
    const result = buildQuizQueue(POOL_15, 10)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    for (const q of result.queue!) {
      expect(q.options).toHaveLength(4)
      const unique = new Set(q.options)
      expect(unique.size).toBe(4)
    }
  })

  it('each question correctIndex points to the word\'s chinese value', () => {
    const result = buildQuizQueue(POOL_15, 10)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    for (const q of result.queue!) {
      expect(q.options[q.correctIndex]).toBe(q.word.chinese)
    }
  })

  it('returns ok:false with reason insufficient-words when fewer than 10 verified words', () => {
    const tooFew = POOL_15.slice(0, 9) // only 9 words
    const result = buildQuizQueue(tooFew, 10)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe('insufficient-words')
    expect(result.available).toBe(9)
  })

  it('non-verified words are ignored (pending / audio-only)', () => {
    // 9 verified + 5 pending = still insufficient
    const mixed: Word[] = [
      ...POOL_15.slice(0, 9),
      { ...makeWord('p1', '待定1'), status: 'pending' },
      { ...makeWord('p2', '待定2'), status: 'pending' },
      { ...makeWord('p3', '待定3'), status: 'audio-only' },
      { ...makeWord('p4', '待定4'), status: 'audio-only' },
      { ...makeWord('p5', '待定5'), status: 'pending' },
    ]
    const result = buildQuizQueue(mixed, 10)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe('insufficient-words')
    expect(result.available).toBe(9)
  })

  it('returns ok:false with reason insufficient-words when pool is empty', () => {
    const result = buildQuizQueue([], 10)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe('insufficient-words')
    expect(result.available).toBe(0)
  })

  it('works when count equals exactly the number of verified words', () => {
    const exactly10 = POOL_15.slice(0, 10)
    const result = buildQuizQueue(exactly10, 10)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.queue).toHaveLength(10)
  })
})
