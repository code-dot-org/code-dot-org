import en from './textToSpeech/en.json';
import it from './textToSpeech/it.json';

interface VoiceEntry {
  name: string;
  altNames?: string[];
  label?: string;
  language?: string;
  [key: string]: unknown;
}

interface TtsLocaleData {
  language: string;
  voices: VoiceEntry[];
}

/** Per-locale recommended voice data keyed by BCP-47 primary subtag. */
const recommendedVoices: Record<string, TtsLocaleData> = {en, it};

/** Returns true if the browser has loaded at least one speech synthesis voice. */
export function hasTextToSpeechVoices(): boolean {
  return speechSynthesis.getVoices().length !== 0;
}

/**
 * Speaks `text` using the best available voice for `locale`.
 *
 * @param text - The string to synthesise.
 * @param locale - BCP-47 primary subtag (e.g. `'en'`, `'it'`).
 * @param onComplete - Optional callback invoked when the utterance finishes.
 * @returns `true` if playback started; `false` if no suitable voice was found.
 */
export function startTextToSpeech(
  text: string,
  locale: string,
  onComplete?: () => void,
): boolean {
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) {
    return false;
  }

  const filteredVoices = filterAvailableVoices(recommendedVoices[locale]);
  if (filteredVoices.length === 0) {
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(text);

  for (const voice of voices) {
    if (voice.name === filteredVoices[0].name) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
      break;
    }
  }

  if (onComplete) {
    utterance.onend = onComplete;
  }

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);

  return true;
}

/** Cancels any in-progress speech synthesis utterance. */
export function stopTextToSpeech(): void {
  speechSynthesis.cancel();
}

/**
 * Filters `jsonData.voices` down to those whose `name` (or an `altName`) is
 * present in the browser's available voices list.
 *
 * Algorithm from https://github.com/HadrienGardeur/web-speech-recommended-voices.
 *
 * @param jsonData - Locale voice data from the bundled JSON files.
 * @returns Available voice entries with their `name` set to the matched alias.
 */
function filterAvailableVoices(
  jsonData: TtsLocaleData | undefined,
): VoiceEntry[] {
  if (!jsonData) {
    return [];
  }

  const availableVoices: VoiceEntry[] = [];
  const voices = speechSynthesis.getVoices();

  jsonData.voices.forEach(function (voice) {
    if (voices.some(apiVoice => apiVoice.name === voice.name)) {
      availableVoices.push(voice);
    } else if (voice.altNames) {
      voice.altNames.forEach(function (altName) {
        if (voices.some(apiVoice => apiVoice.name === altName)) {
          voice.name = altName;
          availableVoices.push(voice);
        }
      });
    }
  });

  return availableVoices;
}
