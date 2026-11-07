/**
 * Haunted Lao — Quiz utility functions
 *
 * buildOptions  : Build 4 shuffled answer choices for one question.
 * buildQuizQueue: Select 10 random questions from verified words.
 *
 * Both functions are pure (no side effects) and fully unit-tested in T-04.
 */

import type { Word, QuizQuestion, BuildOptionsResult, QuizInitResult } from '../types'

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Fisher-Yates in-place shuffle. Returns the same array (mutated).
 * Extracted so tests can verify distribution if needed.
 */
export function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = tmp
  }
  return arr
}

// ---------------------------------------------------------------------------
// buildOptions
// ---------------------------------------------------------------------------

/**
 * Build the 4 answer options for a single quiz question.
 *
 * De-duplication guarantee:
 *   1. Exclude from the distractor pool any word whose `chinese` equals
 *      the correct answer's `chinese`.
 *   2. Deduplicate the pool itself so that two words sharing a `chinese`
 *      value only contribute ONE candidate string.
 *
 * If fewer than 3 distinct distractor strings remain after both filters,
 * returns { ok: false }.
 *
 * @param correctWord  The word whose meaning is the correct answer.
 * @param pool         All 'verified' words EXCLUDING correctWord itself.
 */
export function buildOptions(
  correctWord: Word,
  pool: Word[],
): BuildOptionsResult {
  const correct = correctWord.chinese

  // Step 1 & 2: build deduplicated distractor candidate list
  const seen = new Set<string>([correct]) // seed with correct answer to exclude it
  const candidates: string[] = []
  for (const w of pool) {
    if (!seen.has(w.chinese)) {
      seen.add(w.chinese)
      candidates.push(w.chinese)
    }
  }

  if (candidates.length < 3) {
    return { ok: false, reason: 'insufficient-distractors', available: candidates.length }
  }

  // Step 3: pick 3 random distractors
  shuffleInPlace(candidates)
  const distractors = candidates.slice(0, 3)

  // Step 4: insert correct answer at a random position
  const allOptions = [correct, ...distractors]
  shuffleInPlace(allOptions)

  const correctIndex = allOptions.indexOf(correct)

  // Type narrowing: we know length === 4 and correctIndex is 0–3
  return {
    ok: true,
    options: allOptions as [string, string, string, string],
    correctIndex: correctIndex as 0 | 1 | 2 | 3,
  }
}

// ---------------------------------------------------------------------------
// buildQuizQueue
// ---------------------------------------------------------------------------

/**
 * Select `count` (default 10) random verified words and build a quiz queue.
 *
 * Fails with:
 *   - 'insufficient-words'       if fewer than `count` verified words exist.
 *   - 'insufficient-distractors' if any question cannot form 4 unique options.
 *
 * @param allWords  Full word list (may include non-verified entries).
 * @param count     Number of questions per round (default: 10).
 */
export function buildQuizQueue(
  allWords: Word[],
  count = 10,
): QuizInitResult & { queue?: QuizQuestion[] } {
  const verified = allWords.filter(w => w.status === 'verified')

  if (verified.length < count) {
    return { ok: false, reason: 'insufficient-words', available: verified.length }
  }

  // Randomly select `count` words without replacement
  const shuffled = shuffleInPlace([...verified])
  const selected = shuffled.slice(0, count)

  const queue: QuizQuestion[] = []

  for (const word of selected) {
    // Pool = all verified words excluding the current question's word
    const pool = verified.filter(w => w.id !== word.id)
    const result = buildOptions(word, pool)

    if (!result.ok) {
      return { ok: false, reason: 'insufficient-distractors', available: result.available }
    }

    queue.push({
      word,
      options: result.options,
      correctIndex: result.correctIndex,
    })
  }

  return { ok: true, queue }
}
