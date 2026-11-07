# Requirements Document

## Introduction

Haunted Lao is a Halloween-themed Lao language flashcard web app aimed at Chinese native speakers with zero prior Lao background. The app runs as a pure-static React + TypeScript + Vite application deployable to GitHub Pages or Netlify. It provides three core learning activities: browsing flashcards, taking a 4-choice listening quiz, and reviewing wrong answers. All audio is pre-generated via Azure Cognitive Services TTS (lo-LA voice) at build time and bundled as static `.mp3` files — there are no runtime TTS calls, no backend, and no user accounts. The visual theme is Halloween: deep purple/black background, pumpkin orange accents, ghost-white text, and SVG decorations with motion respecting `prefers-reduced-motion`.

## Glossary

- **App**: The Haunted Lao single-page React application.
- **Word**: A vocabulary entry with fields `id`, `lao`, `chinese`, `audioFile`, and `status`.
- **Verified_Word**: A Word whose `status` is `'verified'` — both meaning and pronunciation have been confirmed by a human reviewer.
- **Quiz_Round**: A single play session consisting of exactly 10 questions drawn from the Verified_Word pool.
- **Quiz_Queue**: The ordered list of 10 QuizQuestions selected for the active Quiz_Round.
- **QuizQuestion**: One question in a Quiz_Queue containing the Word, exactly 4 shuffled Chinese option strings, and the index of the correct answer.
- **AnswerRecord**: The record of one user submission: `questionId`, `selectedIndex`, `isCorrect`.
- **Wrong_Word**: A Verified_Word for which the user submitted an incorrect AnswerRecord in the current Quiz_Round.
- **Score_Tier**: One of three result bands — `low` (0–40%), `mid` (41–79%), `high` (80–100%) — based on correct answers divided by total answers.
- **Audio_State**: The runtime playback state of a single audio instance: `idle`, `loading`, `playing`, `paused`, `error-blocked`, or `error-load`.
- **Audio_Gate**: The rule that quiz answer options are disabled until audio plays or the user explicitly taps the play button.
- **Browse_View**: The flashcard browse page (BrowsePage) showing one Verified_Word card at a time.
- **Phase**: The top-level application routing state: `home`, `browse`, `quiz`, `result`, or `review`.
- **TTS_Script**: The offline build-time script (`scripts/generate-audio.ts`) that calls Azure Cognitive Services to produce `.mp3` files.
- **Base_URL**: The Vite deployment base path used to resolve audio file URLs (supports GitHub Pages sub-paths).
- **Score_Display**: The percentage and fraction shown on the result page (`correctCount / totalAnswered`).

## Requirements

### Requirement 1: Vocabulary Data Model and Verification Workflow

**User Story:** As a content maintainer, I want a typed vocabulary data model with a three-state verification workflow, so that only fully human-verified words ever appear in the production UI.

#### Acceptance Criteria

1. THE App SHALL define a `Word` type with fields: `id: string`, `lao: string`, `chinese: string`, `audioFile: string`, and `status: 'verified' | 'audio-only' | 'pending'`.
2. THE App SHALL maintain a production `words` array containing only entries with `status === 'verified'`.
3. WHEN a new vocabulary entry is added to the data source, THE App SHALL assign that entry `status: 'pending'`.
4. IF a `Word` entry has its Chinese meaning confirmed and its audio pronunciation not yet confirmed, THEN THE App SHALL allow that entry's `status` to be set to `'audio-only'`.
5. IF a `Word` entry has both its Chinese meaning and its audio pronunciation confirmed, THEN THE App SHALL allow that entry's `status` to be set to `'verified'`.
6. THE App SHALL contain at least 20 `Word` entries with `status === 'verified'`, covering all five categories: greetings, numbers, colours, common objects, and common actions, with at least 2 entries per category.
7. IF a `Word` entry's `status` is `'pending'` or `'audio-only'`, THEN THE App SHALL exclude that entry from all production UI surfaces (Browse_View, Quiz_Queue, Wrong_Word review).
8. THE App SHALL store `audioFile` as a relative path without a leading slash (e.g. `audio/hello.mp3`) and resolve it through `resolveAudioUrl()`, which SHALL return a fully qualified URL by prepending the application's configured base path to the relative `audioFile` value, before any audio playback or display.

---

### Requirement 2: Audio Generation and Delivery

**User Story:** As a developer, I want audio files generated offline via Azure TTS and bundled statically, so that no API keys are ever shipped to the browser and no runtime TTS calls are made.

#### Acceptance Criteria

1. THE TTS_Script SHALL generate one `.mp3` file per Word using the Azure Cognitive Services Speech SDK with the `lo-LA-KeomanyNeural` voice.
2. THE TTS_Script SHALL write generated files to `public/audio/` so that Vite includes them in the static build output.
3. THE TTS_Script SHALL read API credentials exclusively from environment variables; IF a required environment variable is absent at script startup, THEN THE TTS_Script SHALL exit with a non-zero exit code and emit an error message indicating which variable is missing, without generating any audio files.
4. THE App SHALL make no runtime calls to any TTS API; all audio is resolved from pre-bundled static files via Base_URL concatenation.
5. WHEN resolving an audio URL, THE App SHALL prepend `import.meta.env.BASE_URL` to the relative `audioFile` path, correctly handling both root deployments (`/`) and sub-path deployments (e.g. `/haunted-lao/`).
6. THE TTS_Script SHALL be registered as a named command in `package.json` under the `scripts` field so that it can be invoked via the package manager on any developer machine without global tooling.

---

### Requirement 3: Flashcard Browse View

**User Story:** As a beginner, I want to browse Lao flashcards one at a time so that I can familiarise myself with words before taking a quiz.

#### Acceptance Criteria

1. WHEN the user navigates to the Browse_View, THE App SHALL display only Verified_Words.
2. THE Browse_View SHALL present Verified_Words in the fixed order defined in the word data source (no randomisation on browse).
3. IF Verified_Words are available, THEN THE Browse_View SHALL display one card at a time showing: the Lao script, the Chinese meaning, and a play-audio button.
4. THE Browse_View SHALL provide a "previous" navigation control that is disabled when the current card is the first card.
5. THE Browse_View SHALL provide a "next" navigation control that is disabled when the current card is the last card.
6. THE Browse_View SHALL display a position indicator showing the current card index and total count (e.g. "2 / 20").
7. IF no Verified_Words exist, THEN THE Browse_View SHALL display an empty-state message and SHALL NOT render navigation controls.
8. WHEN the user navigates to the Browse_View, THE Browse_View SHALL display the first Verified_Word as the initial card.
9. THE Browse_View SHALL provide a "Start Quiz" button that, when activated, navigates the user to the Quiz_View and initiates a Quiz_Round using all Verified_Words.
10. THE Browse_View SHALL provide a "Home" navigation control that returns the user to the Home_View without discarding any in-progress Quiz_Round state.
11. WHEN the user activates the play-audio button on a card, THE App SHALL play the audio for that Word.
12. IF the audio file for the current Word is unavailable, THEN THE App SHALL display an error indication on the play-audio button and SHALL NOT attempt to play audio.
13. THE play-audio button SHALL have an `aria-label` attribute describing its action (e.g. "播放发音").

---

### Requirement 4: Home Page Navigation

**User Story:** As a learner, I want a home page with clear entry points so that I can choose to browse first or jump straight into a quiz.

#### Acceptance Criteria

1. WHEN the App is loaded in the browser, THE App SHALL display the Home_View as the initial Phase.
2. THE Home_Page SHALL provide a "Browse Flashcards" button that transitions the Phase to `browse`.
3. THE Home_Page SHALL provide a "Start Quiz" button that initiates a Quiz_Round; IF initialisation succeeds, THEN THE App SHALL transition the Phase to `quiz`.
4. WHEN quiz initialisation fails due to an insufficient number of Verified_Words, THE App SHALL display an inline error message on the home page and SHALL NOT transition to the quiz Phase.
5. THE inline error message SHALL state the number of currently available Verified_Words and the minimum required count (10).

---

### Requirement 5: Quiz Round Initialisation

**User Story:** As a learner, I want the quiz to draw a fresh random set of words each round so that each session feels different.

#### Acceptance Criteria

1. WHEN a Quiz_Round is initiated, THE App SHALL filter all Words to Verified_Words only and randomly select exactly 10 without replacement.
2. WHEN a Quiz_Round is initiated, THE App SHALL construct a QuizQuestion for each selected word containing exactly 4 shuffled Chinese option strings drawn from the Chinese values of other Verified_Words as distractors, plus the correct answer, and the correct answer index.
3. THE App SHALL guarantee that all 4 option strings within a single QuizQuestion are distinct (no duplicate Chinese values).
4. THE App SHALL guarantee that the correct answer is placed at one of the 4 positions (index 0–3) and that its position is not fixed to the same index across all questions in a round.
5. IF the Verified_Word pool contains fewer than 10 entries, THEN THE App SHALL report an error with reason `'insufficient-words'` and the count of available entries, and SHALL NOT change quiz state.
6. IF fewer than 3 distinct distractor Chinese strings can be assembled for any question, THEN THE App SHALL report an error with reason `'insufficient-distractors'` and SHALL NOT change quiz state.
7. WHEN a new Quiz_Round is initiated, THE App SHALL reset `currentIndex`, `answers`, and `isFinished` to their initial values before applying the new Quiz_Queue.

---

### Requirement 6: Quiz Question Interaction

**User Story:** As a learner, I want to hear the Lao word and select the correct Chinese meaning so that I can test my listening comprehension.

#### Acceptance Criteria

1. WHEN the user enters a new question (including the first question of a round), THE App SHALL automatically attempt to play the audio for that question's Word.
2. WHEN the user taps the play button during a question, THE App SHALL replay the audio for the current Word from the beginning.
3. WHEN the user navigates to the next question, THE App SHALL immediately stop any currently playing audio before beginning audio for the new question.
4. WHILE a question is unanswered, THE App SHALL display exactly 4 Chinese option buttons in the shuffled order defined by the QuizQuestion.
5. WHEN the user selects an answer option, THE App SHALL immediately highlight the correct option with a distinct background or border colour and visually distinguish the user's selected option as correct (same highlight) or incorrect (different highlight, e.g. red border).
6. WHEN the user selects an answer option, THE App SHALL lock the answer (no further option selection is permitted for that question).
7. WHEN the user selects an answer option, THE App SHALL record an AnswerRecord for that question.
8. WHEN the user selects an answer option and Audio_State is not `'error-load'`, THE App SHALL display a "Next" button (or "View Results" for the final question).
9. THE App SHALL NOT auto-advance to the next question; the user MUST click the "Next" button to proceed.
10. WHEN the answer feedback is visible, THE App SHALL keep all feedback displayed until the user clicks "Next".
11. THE option buttons SHALL each carry an `aria-label` that includes the option text so each choice is individually named for screen readers.

---

### Requirement 7: Audio Error Handling in Quiz

**User Story:** As a learner, I want clear feedback when audio fails so that I am not penalised for technical issues and can still attempt the question.

#### Acceptance Criteria

1. WHEN the browser blocks autoplay for a question, THE App SHALL set Audio_State to `'error-blocked'` and display a visible interactive "Tap to Play" button.
2. WHEN Audio_State is `'error-blocked'`, THE App SHALL NOT count the blocked audio as a wrong answer.
3. IF Audio_State transitions away from `'error-blocked'` after the user initiates a playback attempt, THEN THE App SHALL NOT prevent the user from selecting an answer option.
4. WHEN an audio file fails to load or decode (network or format error), THE App SHALL set Audio_State to `'error-load'` and display a visible error warning with a retry button.
5. WHEN Audio_State is `'error-load'`, THE App SHALL NOT count the load failure as a wrong answer.
6. WHILE Audio_State is `'error-load'`, THE App SHALL provide a visible "return to home" option so the user can exit the round without being forced to continue.
7. WHEN an in-flight `audio.play()` Promise resolves or rejects after the audio source has been changed or the component has unmounted, THE App SHALL ignore that stale result.

---

### Requirement 8: Result Page

**User Story:** As a learner, I want a result summary after finishing a round so that I know how I performed and can decide what to do next.

#### Acceptance Criteria

1. WHEN all 10 questions in a Quiz_Round have been answered, THE App SHALL automatically transition the Phase to `result`.
2. THE Result_Page SHALL display the number of correct answers and total questions answered (e.g. "8 / 10 题答对").
3. THE Result_Page SHALL display the percentage accuracy rounded to the nearest whole number.
4. THE Result_Page SHALL determine the Score_Tier: `low` for 0–40%, `mid` for 41–79%, `high` for 80–100%.
5. THE Result_Page SHALL display a per-tier Halloween-themed message: `low` tier shows "鬼魂附身… 继续练习吧！" as the title and "不要气馁，幽灵也是练出来的。" as the body; `mid` tier shows "尚可，但南瓜不满意…" as the title and "再努力一点，你就能点亮南瓜灯！" as the body; `high` tier shows "完美通灵！🎃" as the title and "词汇掌握满分，今晚你是最强的巫师！" as the body.
6. THE Result_Page SHALL display a Halloween emoji corresponding to the Score_Tier (👻 for `low`, 🕸️ for `mid`, 🎃 for `high`).
7. THE Result_Page SHALL display a "Play Again" button that resets all quiz state (AnswerRecords, Wrong_Words, Quiz_Queue, and current question index) and initiates a new Quiz_Round.
8. WHEN the current round produced at least one Wrong_Word, THE Result_Page SHALL display a "Review Wrong Words" button showing the count of Wrong_Words.
9. WHEN the current round produced no Wrong_Words, THE Result_Page SHALL NOT display a "Review Wrong Words" button.

---

### Requirement 9: Wrong-Word Review

**User Story:** As a learner, I want to review the words I got wrong so that I can focus my study on my weak spots.

#### Acceptance Criteria

1. WHEN the user taps "Review Wrong Words", THE App SHALL transition to the `review` Phase and display the Wrong_Words as navigable flashcards in the order they were recorded during the Quiz_Round.
2. THE Review_Page SHALL display one Wrong_Word card at a time showing: the Lao script, the Chinese meaning, and a play-audio button.
3. THE Review_Page SHALL provide "previous" and "next" navigation controls for the Wrong_Words list.
4. THE Review_Page SHALL display a position indicator showing the current card index and total Wrong_Word count.
5. THE Review_Page SHALL provide a "Back to Results" button that transitions the Phase back to `result`.
6. WHEN the user taps "Back to Results" from the Review_Page, THE App SHALL NOT reset quiz answers, quiz state, or the Wrong_Words list.
7. WHEN the user taps the play-audio button on a Wrong_Word card, THE App SHALL play the audio for that Word.
8. THE Review_Page SHALL provide "previous" and "next" navigation controls where "previous" is disabled when the current card is the first Wrong_Word and "next" is disabled when the current card is the last Wrong_Word.

---

### Requirement 10: App Navigation and Phase Management

**User Story:** As a learner, I want predictable page transitions so that I never lose my quiz progress unexpectedly.

#### Acceptance Criteria

1. THE App SHALL manage navigation via a single `phase` state variable with values: `home`, `browse`, `quiz`, `result`, `review`.
2. THE App SHALL NOT use URL routing or the browser History API; all navigation is in-memory state.
3. WHEN the user taps the "Home" navigation button in the App header while in the quiz Phase, THE App SHALL reset quiz state (AnswerRecords, Wrong_Words, Quiz_Queue, and current question index) and transition to the home Phase.
4. WHEN the user taps "Play Again" on the Result_Page, THE App SHALL reset quiz state (AnswerRecords, Wrong_Words, Quiz_Queue, and current question index) and re-draw a new Quiz_Queue before transitioning to the `quiz` Phase, drawing from all Verified_Words (not biased toward Wrong_Words from the previous round).
5. WHEN the Phase transitions to `result` after a Quiz_Round completes, THE App SHALL preserve all AnswerRecords and Wrong_Words until the user explicitly taps "Play Again", taps the "Home" navigation button, or navigates home via the Review_Page.
6. WHEN the user navigates from the `review` Phase to the `home` Phase, THE App SHALL reset quiz state (AnswerRecords, Wrong_Words, Quiz_Queue, and current question index).

---

### Requirement 11: Halloween Visual Theme

**User Story:** As a learner, I want a Halloween atmosphere so that the app feels festive and engaging.

#### Acceptance Criteria

1. THE App SHALL use a background colour with HSL hue between 260° and 280°, saturation ≥ 20%, and lightness ≤ 15% as the primary page background.
2. THE App SHALL use a primary accent colour with HSL hue between 20° and 35° and saturation ≥ 70% for buttons and highlighted UI elements.
3. THE App SHALL use a text colour with lightness ≥ 90% as the primary text colour on dark backgrounds.
4. THE App SHALL include at least one Halloween SVG decoration (pumpkin, spider web, or ghost) visible on the home page.
5. THE App SHALL NOT play continuous background music.
6. WHEN the user's system has `prefers-reduced-motion: reduce` set, THE App SHALL set all CSS `animation-duration` and `transition-duration` values to ≤ 1ms.

---

### Requirement 12: Responsive Layout and Performance

**User Story:** As a mobile learner, I want the app to work well on my phone so that I can study anywhere.

#### Acceptance Criteria

1. THE App SHALL render without a horizontal scrollbar, with all interactive elements within the viewport, and with a minimum rendered font size of 14px on viewport widths of 375px and above in portrait orientation.
2. THE App SHALL render without a horizontal scrollbar, with all interactive elements within the viewport, and with a minimum rendered font size of 14px on standard desktop viewport widths (1024px and above).
3. THE App SHALL achieve a Lighthouse Time to Interactive (TTI) under 3000ms when measured under simulated 4G throttling (10 Mbps down / 10 ms RTT).
4. THE App SHALL produce a pure-static build output with no server-side rendering dependency, suitable for deployment to GitHub Pages or Netlify.

---

### Requirement 13: Accessibility

**User Story:** As a learner who uses assistive technology, I want the quiz and browse views to be keyboard and screen-reader operable so that the app is usable without a mouse.

#### Acceptance Criteria

1. THE App SHALL provide an `aria-label` on every play-audio button that identifies both the word being played and the action type (e.g. "播放 [word in Lao] 的发音").
2. THE App SHALL ensure all quiz answer option buttons are reachable and activatable via keyboard (Tab to focus, Enter or Space to activate).
3. WHEN an answer is selected, THE App SHALL announce the correct/incorrect feedback to screen readers via an `aria-live="polite"` region, a `role="status"` element, or a `role="alert"` element.
4. THE App SHALL ensure navigation controls (previous, next, back) are keyboard-operable via Tab and Enter/Space.
5. THE App SHALL ensure a colour contrast ratio of at least 4.5:1 between normal-size text and its background, and at least 3:1 between large-size text (≥ 18px regular or ≥ 14px bold) and its background, as defined by WCAG 2.1 AA.
6. WHEN `prefers-reduced-motion: reduce` is active, THE App SHALL set all CSS `animation-duration` and `transition-duration` values to ≤ 1ms.

---

### Requirement 14: Audio Playback State Management

**User Story:** As a developer, I want a well-defined audio state machine so that audio behaviour is consistent across Browse, Quiz, and Review contexts.

#### Acceptance Criteria

1. THE App SHALL model audio playback through the six Audio_State values: `idle`, `loading`, `playing`, `paused`, `error-blocked`, `error-load`.
2. WHEN `play()` is called, THE App SHALL immediately set Audio_State to `'loading'`; then pause any existing `HTMLAudioElement`, set its `src` to an empty string, call `load()` to release the network resource, and discard the reference before creating a fresh `HTMLAudioElement` instance.
3. WHEN the `audio.play()` Promise resolves successfully, THE App SHALL set Audio_State to `'playing'`.
4. WHEN the `audio.play()` Promise rejects with a `DOMException` of name `NotAllowedError`, THE App SHALL set Audio_State to `'error-blocked'`.
5. WHEN the `audio.play()` Promise rejects with any error other than `NotAllowedError`, THE App SHALL set Audio_State to `'error-load'`.
6. WHEN the audio `ended` event fires, THE App SHALL set Audio_State to `'idle'`.
7. WHEN `stop()` is called, THE App SHALL pause the audio, set its `src` to an empty string, call `load()` to release the network resource, discard the `HTMLAudioElement` reference, and set Audio_State to `'idle'`.
8. WHEN the component using the audio hook unmounts, THE App SHALL execute the same cleanup steps as `stop()` to prevent memory leaks.
9. THE App SHALL ensure that after any sequence of `play()`, `stop()`, and component unmount calls, no `HTMLAudioElement` instances remain referenced and no pending Promise callbacks can mutate React state after cleanup.
