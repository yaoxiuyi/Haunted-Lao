/**
 * generate-audio.ts — Offline TTS audio generation script
 *
 * This script is an INDEPENDENT TOOL. It:
 *   - Is NOT included in the Vite build
 *   - Is NOT deployed to the frontend
 *   - Reads Azure credentials from local .env (never committed)
 *   - Outputs .mp3 files to public/audio/<id>.mp3
 *   - Does NOT automatically update word status in words.ts
 *     (human verification of pronunciation is required first)
 *
 * Usage:
 *   npm run generate-audio
 *
 * Required environment variables (in local .env, never VITE_-prefixed):
 *   AZURE_TTS_KEY=<your-key>
 *   AZURE_TTS_REGION=<your-region>
 *
 * Implementation to be completed in T-15.
 */

// T-15: implementation placeholder
console.log('generate-audio.ts — implementation pending (T-15)')
