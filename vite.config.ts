import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// BASE_URL is set via environment variable VITE_BASE_URL at build time.
// Default is '/' for local development.
// For GitHub Pages deployment with a sub-path, set:
//   VITE_BASE_URL=/haunted-lao/
//
// Note: AZURE_TTS_KEY and AZURE_TTS_REGION are used only by
// scripts/generate-audio.ts at build-prep time. They must NOT be
// prefixed with VITE_ and will never be bundled into the frontend.

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL ?? '/',
  test: {
    // jsdom is required for React hook tests (useQuiz uses useState/useCallback).
    // Pure utility tests (quiz.ts, score.ts, audio.ts) also run fine in jsdom.
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
