const supportedVoiceLanguages = ['en', 'it'];
let recommendedVoices = [];
supportedVoiceLanguages.forEach(supportedVoiceLanguage => {
  recommendedVoices[
    supportedVoiceLanguage
  ] = require(`./textToSpeech/${supportedVoiceLanguage}.json`);
});

export function setOnVoicesChangedCallback(voicesChangedCallback) {
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = voicesChangedCallback;
  }
}

export function hasVoices() {
  return speechSynthesis.getVoices().length !== 0;
}

export function sayText(text, locale, onComplete) {
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) {
    return false;
  }

  const filteredVoices = filterAvailableVoices(
    recommendedVoices[locale]
  );
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

  utterance.onend = onComplete;

  speechSynthesis.cancel();

  speechSynthesis.speak(utterance);

  console.log('Saying:', text);

  return true;
}

export function stopTalking() {
  speechSynthesis.cancel();
}

// From https://github.com/HadrienGardeur/web-speech-recommended-voices.
function filterAvailableVoices(jsonData) {
  if (!jsonData) return [];

  const availableVoices = [];
  const voices = speechSynthesis.getVoices();

  jsonData.voices.forEach(function(voice) {
    if (voices.some(apiVoice => apiVoice.name === voice.name)) {
      availableVoices.push(voice);
    } else {
      if (voice.altNames) {
        voice.altNames.forEach(function(altName) {
          if (voices.some(apiVoice => apiVoice.name === altName)) {
            voice.name = altName;
            availableVoices.push(voice);
          }
        });
      }
    }
  });

  return availableVoices;
}
