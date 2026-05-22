/**
 * useTts — thin wrapper around @capacitor-community/text-to-speech.
 *
 * On non-native platforms (web dev) the speak call is silently swallowed
 * so that the prototype remains usable in a browser.
 *
 * FR-017: TTS is used only for the language-picker pronunciation cue.
 */

import {Capacitor} from '@capacitor/core';

/**
 * Speaks the given text in the specified locale using on-device TTS.
 * No-op on web / non-native platforms.
 *
 * @param text   - Text to speak.
 * @param locale - BCP-47 locale string (e.g. "en-US", "hi-IN").
 */
export async function speak(text: string, locale: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  const {TextToSpeech} = await import('@capacitor-community/text-to-speech');
  await TextToSpeech.speak({
    text,
    lang: locale,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  });
}
