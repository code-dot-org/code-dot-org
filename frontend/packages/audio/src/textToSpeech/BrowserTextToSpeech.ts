import {markdownToTxt} from 'markdown-to-txt';

import localization from '@code-dot-org/localization';

/**
 * Manages native Browser Text to Speech functionality.
 */

let ttsAvailable: boolean = false;

function onTtsAvailable(callback: (isAvailable: boolean) => void) {
  if (ttsAvailable) {
    callback(true);
  } else {
    // On some old browsers (e.g. Safari <16), the voiceschanged event is not implemented.
    window.speechSynthesis.addEventListener?.('voiceschanged', () => {
      callback(speechSynthesis.getVoices().length > 0);
    });
  }
}

function initialize() {
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
