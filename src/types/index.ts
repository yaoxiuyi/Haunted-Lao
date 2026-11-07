/**
 * Haunted Lao — Shared TypeScript types
 * Defined in T-02. All types must match design doc v0.2 + v0.3 patch.
 */

// ---------------------------------------------------------------------------
// Word / Vocabulary
// ---------------------------------------------------------------------------

/**
 * Three-state verification status for a vocabulary entry.
 *
 * - 'verified'   : Both Chinese meaning AND audio pronunciation have been
 *                  manually verified. Only 'verified' words may appear in
 *                  the browse view or quiz.
 * - 'audio-only' : Chinese meaning verified; audio file generated but
 *                  pronunciation not yet confirmed by a human listener.
 *                  NOTE: audio generation success ≠ pronunciation verified.
 * - 'pending'    : Either meaning or audio (or both) not yet confirmed.
 *
 * Words with status 'audio-only' or 'pending' must NOT appear in the
 * production word list or be selectable for a quiz round.
 */
export type WordStatus = 'verified' | 'audio-only' | 'pending'

/**
 * A single vocabulary entry.
 * `audioFile` stores a path relative to the public root (e.g. "audio/hello.mp3").
 * It must be resolved through `resolveAudioUrl()` before use, to handle
 * Vite BASE_URL and GitHub Pages sub-path deployments correctly.
 */
export interface Word {
  /** Unique stable identifier (used as filename stem for audio). */
  id: string
  /** Lao script (Unicode range U+0E80–U+0EFF). */
  lao: string
  /** Chinese translation, manually verified. */
  chinese: string
  /** Relative path to the .mp3 file, e.g. "audio/hello.mp3". No leading slash. */
  audioFile: string
  /** Verification state — only 'verified' entries are shown to users. */
  status: WordStatus
}

// ---------------------------------------------------------------------------
// Quiz
// ---------------------------------------------------------------------------

/**
 * One question in a quiz round.
 * `options` contains exactly 4 distinct Chinese strings (the correct answer
 * plus 3 distractors), in randomised order.
 * All four values are guaranteed to be unique (see buildOptions in quiz.ts).
 */
export interface QuizQuestion {
  word: Word
  /** Exactly 4 Chinese option strings, shuffled. All values are distinct. */
  options: [string, string, string, string]
  /** Index into `options` that corresponds to the correct answer (0–3). */
  correctIndex: 0 | 1 | 2 | 3
}

/**
 * The user's submitted answer for one question.
 * A record is written ONLY when the user actively selects an option
 * (i.e. calls submitAnswer). Questions where the user never submits
 * (e.g. audio failure → user exits) produce no record.
 */
export interface AnswerRecord {
  /** Matches QuizQuestion.word.id */
  questionId: string
  /** The index the user selected (0–3). Never null — unsubmitted = no record. */
  selectedIndex: 0 | 1 | 2 | 3
  isCorrect: boolean
}

// ---------------------------------------------------------------------------
// Application phase
// ---------------------------------------------------------------------------

/**
 * Top-level application phase (owned by App.tsx).
 * - 'home'   : Landing page
 * - 'browse' : Flashcard browse view
 * - 'quiz'   : Active quiz round
 * - 'result' : Post-quiz result summary
 * - 'review' : Wrong-word review cards
 */
export type AppPhase = 'home' | 'browse' | 'quiz' | 'result' | 'review'

// ---------------------------------------------------------------------------
// Audio playback runtime state
// ---------------------------------------------------------------------------

/**
 * Runtime playback state for a single audio instance (managed by useAudio).
 * This is independent of WordStatus — it reflects what is happening RIGHT NOW
 * in the browser, not whether the audio has been editorially verified.
 *
 * - 'idle'          : No playback attempted yet (or stopped cleanly).
 * - 'loading'       : play() called; waiting for browser to load/decode.
 * - 'playing'       : Audio is actively playing.
 * - 'paused'        : Paused by the user or programmatically (not currently used in v1).
 * - 'error-blocked' : Browser blocked autoplay (NotAllowedError).
 *                     UI should show a manual "tap to play" affordance.
 * - 'error-load'    : Audio resource failed to load or decode (network/format error).
 *                     UI should show a retry button and a "return to home" option.
 */
export type AudioPlayState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'error-blocked'
  | 'error-load'

// ---------------------------------------------------------------------------
// Quiz initialisation results
// ---------------------------------------------------------------------------

/**
 * Returned by useQuiz.initQuiz().
 * On failure the caller must display an inline error; it must NOT navigate
 * away or fall back to a shorter quiz round.
 */
export type QuizInitResult =
  | { ok: true }
  | { ok: false; reason: 'insufficient-words'; available: number }
  | { ok: false; reason: 'insufficient-distractors'; available: number }

// ---------------------------------------------------------------------------
// Option-building results (used internally by quiz.ts)
// ---------------------------------------------------------------------------

/**
 * Returned by buildOptions() in quiz.ts.
 * `available` is the number of distinct distractor candidates after de-duplication.
 */
export type BuildOptionsResult =
  | { ok: true; options: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3 }
  | { ok: false; reason: 'insufficient-distractors'; available: number }
