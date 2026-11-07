/**
 * Haunted Lao — Vocabulary data
 *
 * ⚠️  IMPORTANT — READ BEFORE EDITING
 *
 * This file contains TWO separate exports:
 *
 *  1. `words` — the PRODUCTION word list.
 *     Only entries with status === 'verified' will appear in the app.
 *     Currently empty: real entries will be added in T-10 after human
 *     verification of both meaning and pronunciation.
 *
 *  2. `testFixtureWords` — TEST DATA ONLY.
 *     Used exclusively in unit/integration tests (T-04, T-05a).
 *     All entries have status === 'pending' by design.
 *     Must NOT be imported by any production component.
 *     Must NOT have any entry promoted to status 'verified'.
 *
 * Verification workflow (T-10):
 *   pending → (meaning confirmed) → audio-only
 *   audio-only → (pronunciation listened & confirmed) → verified
 *   Only 'verified' entries are added to `words`.
 */

import type { Word } from '../types'

// ---------------------------------------------------------------------------
// Production word list (empty until T-10 — human verification required)
// ---------------------------------------------------------------------------

/**
 * The authoritative production vocabulary list.
 * Only 'verified' entries should ever be added here.
 * Imported by components (BrowsePage, useQuiz, etc.).
 */
export const words: Word[] = [
  // Real entries to be added in T-10 after verification.
  // Example shape (DO NOT uncomment without verification):
  //
  // {
  //   id: 'hello',
  //   lao: 'ສະບາຍດີ',
  //   chinese: '你好',
  //   audioFile: 'audio/hello.mp3',
  //   status: 'verified',
  // },
]

// ---------------------------------------------------------------------------
// Test fixture data — FOR TESTS ONLY, NEVER import in production code
// ---------------------------------------------------------------------------

/**
 * ⚠️  TEST DATA — do not import this in any component or hook.
 *
 * Provides ≥ 15 entries with status 'pending' for logic validation in
 * T-04 (quiz utilities) and T-05a (useQuiz hook).
 *
 * - `chinese` values use short placeholder strings ("词A", "词B", …).
 * - `lao` values use placeholder Unicode sequences (no real Lao text).
 * - `audioFile` paths point to non-existent files; audio errors are
 *   expected and acceptable during test runs.
 * - Status is intentionally 'pending'; promoting any entry to 'verified'
 *   here would violate the test-data isolation rule.
 */
export const testFixtureWords: Word[] = [
  {
    id: 'test-01',
    lao: 'ທົດສອບ໑',
    chinese: '词A',
    audioFile: 'audio/test-01.mp3',
    status: 'pending',
  },
  {
    id: 'test-02',
    lao: 'ທົດສອບ໒',
    chinese: '词B',
    audioFile: 'audio/test-02.mp3',
    status: 'pending',
  },
  {
    id: 'test-03',
    lao: 'ທົດສອບ໓',
    chinese: '词C',
    audioFile: 'audio/test-03.mp3',
    status: 'pending',
  },
  {
    id: 'test-04',
    lao: 'ທົດສອບ໔',
    chinese: '词D',
    audioFile: 'audio/test-04.mp3',
    status: 'pending',
  },
  {
    id: 'test-05',
    lao: 'ທົດສອບ໕',
    chinese: '词E',
    audioFile: 'audio/test-05.mp3',
    status: 'pending',
  },
  {
    id: 'test-06',
    lao: 'ທົດສອບ໖',
    chinese: '词F',
    audioFile: 'audio/test-06.mp3',
    status: 'pending',
  },
  {
    id: 'test-07',
    lao: 'ທົດສອບ໗',
    chinese: '词G',
    audioFile: 'audio/test-07.mp3',
    status: 'pending',
  },
  {
    id: 'test-08',
    lao: 'ທົດສອບ໘',
    chinese: '词H',
    audioFile: 'audio/test-08.mp3',
    status: 'pending',
  },
  {
    id: 'test-09',
    lao: 'ທົດສອບ໙',
    chinese: '词I',
    audioFile: 'audio/test-09.mp3',
    status: 'pending',
  },
  {
    id: 'test-10',
    lao: 'ທົດສອບ໑໐',
    chinese: '词J',
    audioFile: 'audio/test-10.mp3',
    status: 'pending',
  },
  {
    id: 'test-11',
    lao: 'ທົດສອບ໑໑',
    chinese: '词K',
    audioFile: 'audio/test-11.mp3',
    status: 'pending',
  },
  {
    id: 'test-12',
    lao: 'ທົດສອບ໑໒',
    chinese: '词L',
    audioFile: 'audio/test-12.mp3',
    status: 'pending',
  },
  {
    id: 'test-13',
    lao: 'ທົດສອບ໑໓',
    chinese: '词M',
    audioFile: 'audio/test-13.mp3',
    status: 'pending',
  },
  {
    id: 'test-14',
    lao: 'ທົດສອບ໑໔',
    chinese: '词N',
    audioFile: 'audio/test-14.mp3',
    status: 'pending',
  },
  {
    id: 'test-15',
    lao: 'ທົດສອບ໑໕',
    chinese: '词O',
    audioFile: 'audio/test-15.mp3',
    status: 'pending',
  },
  // Extra entries to support distractor-deduplication edge-case tests (T-04).
  // Two entries sharing the same chinese value to test pool deduplication:
  {
    id: 'test-16',
    lao: 'ທົດສອບ໑໖',
    chinese: '词A',         // intentional duplicate of test-01 for dedup tests
    audioFile: 'audio/test-16.mp3',
    status: 'pending',
  },
  {
    id: 'test-17',
    lao: 'ທົດສອບ໑໗',
    chinese: '词P',
    audioFile: 'audio/test-17.mp3',
    status: 'pending',
  },
  {
    id: 'test-18',
    lao: 'ທົດສອບ໑໘',
    chinese: '词Q',
    audioFile: 'audio/test-18.mp3',
    status: 'pending',
  },
]
