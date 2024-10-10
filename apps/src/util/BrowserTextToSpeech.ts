import markdownToTxt from 'markdown-to-txt';

import currentLocale from './currentLocale';

/**
 * Manages native Browser Text to Speech functionality.
 */

let ttsAvailable = false;

speechSynthesis.addEventListener('voiceschanged', () => {
  ttsAvailable = speechSynthesis.getVoices().length > 0;
});

function onTtsAvailable(callback: (isAvailable: boolean) => void) {
  if (ttsAvailable) {
    callback(true);
  } else {
    speechSynthesis.addEventListener('voiceschanged', () => {
      callback(speechSynthesis.getVoices().length > 0);
    });
  }
}

function isTtsAvailable() {
  return ttsAvailable;
}

// TODO: Pick the best voice for the current locale.
function speak(text: string) {
  if (!ttsAvailable) {
    console.log('TextToSpeech: not ready or no voices available to play.');
    return;
  }
  const plainText = markdownToTxt(text);
  const utterance = new SpeechSynthesisUtterance(plainText);
  utterance.lang = currentLocale();
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

export {onTtsAvailable, isTtsAvailable, speak};
