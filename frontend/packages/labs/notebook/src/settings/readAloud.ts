/**
 * Read-aloud utilities wrapping the Web Speech API.
 *
 * `window.speechSynthesis` is present in all modern browsers and in Capacitor
 * WebView.  Both functions are no-ops when the API is absent so the lab
 * degrades gracefully on older or restricted runtimes.
 *
 * Usage: call `speak(text)` from an output-region click handler when the
 * read-aloud accessibility toggle is enabled.  Call `stopSpeaking()` when the
 * toggle is disabled or the component unmounts.
 */

/**
 * Speaks the given text using the browser's default synthesis voice.
 * No-op when `window.speechSynthesis` is unavailable.
 * @param text The string to synthesise aloud.
 */
export function speak(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  // Cancel any in-progress utterance before starting a new one so rapid
  // successive calls do not queue a backlog.
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}

/**
 * Stops any ongoing speech synthesis immediately.
 * No-op when `window.speechSynthesis` is unavailable.
 */
export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  window.speechSynthesis.cancel();
}
