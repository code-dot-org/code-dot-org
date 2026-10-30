import {markdownToTxt} from 'markdown-to-txt';

import {localization} from '@code-dot-org/core/plugins/localization';

/**
 * Manages native Browser Text to Speech functionality.
 */

let ttsAvailable: boolean = false;
let initialized = false;

function onTtsAvailable(callback: (isAvailable: boolean) => void) {
  if (ttsAvailable) {
    callback(true);
  } else if (typeof window !== 'undefined' && window.speechSynthesis) {
    // On some old browsers (e.g. Safari <16), the voiceschanged event is not implemented.
    window.speechSynthesis.addEventListener?.('voiceschanged', () => {
      callback(speechSynthesis.getVoices().length > 0);
    });
  }
  // Without a speech engine (SSR, tests, browsers lacking speechSynthesis),
  // TTS never becomes available and the callback is never invoked.
}

function initialize() {
  // Run once, and only in a browser with a speech engine (guards SSR/tests).
  if (initialized || typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }
  initialized = true;

  ttsAvailable = window.speechSynthesis.getVoices().length > 0;

  // Add a listener to update the ttsAvailable flag when voices are loaded.
  onTtsAvailable(isAvailable => (ttsAvailable = isAvailable));

  // Stop any speech when the page is changed or refreshed.
  addEventListener('beforeunload', () => speechSynthesis.cancel());
}

function isTtsAvailable() {
  return ttsAvailable;
}

function speak(text: string) {
  if (!ttsAvailable) {
    console.log('TextToSpeech: not ready or no voices available to play.');
    return;
  }
  const plainText = markdownToTxt(text);
  const utterance = new SpeechSynthesisUtterance(plainText);
  utterance.lang = localization.locale;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
  return utterance;
}

export {initialize, onTtsAvailable, isTtsAvailable, speak};
