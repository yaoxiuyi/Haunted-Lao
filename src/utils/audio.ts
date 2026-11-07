/**
 * Haunted Lao — Audio URL resolution utility
 *
 * Resolves a relative audio file path (stored in Word.audioFile) to a full
 * URL that works in both local development and GitHub Pages sub-path deployments.
 *
 * Word.audioFile stores paths WITHOUT a leading slash, e.g. "audio/hello.mp3".
 * Vite's import.meta.env.BASE_URL always ends with a slash.
 *
 * Examples:
 *   BASE_URL = "/"           → "/audio/hello.mp3"
 *   BASE_URL = "/haunted-lao/" → "/haunted-lao/audio/hello.mp3"
 */

/**
 * Join a BASE_URL and an audioFile path, handling any accidental leading
 * slash on audioFile to avoid double-slash URLs.
 *
 * Exported separately so it can be unit-tested without depending on
 * import.meta.env directly.
 */
export function joinAudioUrl(baseUrl: string, audioFile: string): string {
  const cleanPath = audioFile.startsWith('/') ? audioFile.slice(1) : audioFile
  return `${baseUrl}${cleanPath}`
}

/**
 * Resolve a Word's audioFile path to a full URL using the current Vite
 * BASE_URL. Use this in components and hooks.
 */
export function resolveAudioUrl(audioFile: string): string {
  return joinAudioUrl(import.meta.env.BASE_URL, audioFile)
}
