import markdownToTxt from 'markdown-to-txt';

import currentLocale from './currentLocale';

/**
 * Manages native Browser Text to Speech functionality.
 */

let ttsAvailable = speechSynthesis.getVoices().length > 0;

// Add a listener to update the ttsAvailable flag when voices are loaded.
onTtsAvailable(isAvailable => (ttsAvailable = isAvailable));

// Stop any speech when the page is changed or refreshed.
addEventListener('beforeunload', () => speechSynthesis.cancel());

function onTtsAvailable(callback: (isAvailable: boolean) => void) {
  if (ttsAvailable) {
    callback(true);
  } else {
    // On some old browsers (e.g. Safari <16), the voiceschanged event is not implemented.
    speechSynthesis.addEventListener?.('voiceschanged', () => {
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

function cancelSpeech() {
  speechSynthesis.cancel();
}

export {onTtsAvailable, isTtsAvailable, speak, cancelSpeech};
