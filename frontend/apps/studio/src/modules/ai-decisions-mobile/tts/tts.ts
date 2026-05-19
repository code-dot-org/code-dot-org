/**
 * TTS wrapper for the mobile prototype.
 *
 * On Capacitor native: delegates to @capacitor-community/text-to-speech.
 * On web (dev browser): delegates to the Web Speech API (if available),
 * so the feature is exercisable without a device.
 *
 * Exports:
 *   speak(text, lang)    — speaks text, cancelling any in-flight utterance.
 *   stop()               — cancels any in-flight utterance.
 *   isSupported(lang)    — returns true if the platform has a voice for lang.
 */

import {Capacitor} from '@capacitor/core';

/** BCP-47 locale per Language code. */
const LOCALE: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
};

// ---------------------------------------------------------------------------
// Native (Capacitor) implementation
// ---------------------------------------------------------------------------

async function nativeSpeak(text: string, lang: string): Promise<void> {
  const {TextToSpeech} = await import('@capacitor-community/text-to-speech');
  await TextToSpeech.stop();
  await TextToSpeech.speak({
    text,
    lang: LOCALE[lang] ?? lang,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  });
}

async function nativeStop(): Promise<void> {
  const {TextToSpeech} = await import('@capacitor-community/text-to-speech');
  await TextToSpeech.stop();
}

async function nativeIsSupported(lang: string): Promise<boolean> {
  try {
    const {TextToSpeech} = await import('@capacitor-community/text-to-speech');
    const {languages} = await TextToSpeech.getSupportedLanguages();
    const target = (LOCALE[lang] ?? lang).toLowerCase();
    return languages.some(l => l.toLowerCase().startsWith(target.slice(0, 2)));
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Web Speech API fallback
// ---------------------------------------------------------------------------

function webSpeak(text: string, lang: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LOCALE[lang] ?? lang;
  window.speechSynthesis.speak(utterance);
}

function webStop(): void {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

function webIsSupported(lang: string): boolean {
  if (!('speechSynthesis' in window)) return false;
  const target = (LOCALE[lang] ?? lang).toLowerCase().slice(0, 2);
  return window.speechSynthesis
    .getVoices()
    .some(v => v.lang.toLowerCase().startsWith(target));
}

// ---------------------------------------------------------------------------
// Public API — switches on native vs. web
// ---------------------------------------------------------------------------

/**
 * Speaks text in the given language, cancelling any in-flight utterance.
 * Silent no-op if TTS is unavailable.
 */
export async function speak(text: string, lang: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await nativeSpeak(text, lang);
  } else {
    webSpeak(text, lang);
  }
}

/** Cancels any in-flight TTS utterance. */
export async function stop(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await nativeStop();
  } else {
    webStop();
  }
}

/**
 * Returns true if the platform has a TTS voice for the given language code.
 * Used to decide whether to show the UnsupportedVoiceHint.
 */
export async function isSupported(lang: string): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    return nativeIsSupported(lang);
  }
  return webIsSupported(lang);
}
