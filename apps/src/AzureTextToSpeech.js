import Sounds from '@cdo/apps/Sounds';
// TODO: move this function to shared util file
import {findProfanity} from '@cdo/apps/code-studio/components/libraries/util';

// XMLHttpRequest readyState 4 means the request is done.
// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
const READY_STATE_DONE = 4;

class SpeechResponse {
  constructor(bytes, profaneWords = [], error = null) {
    this.bytes = bytes;
    this.profaneWords = profaneWords;
    this.error = error;
  }
}

let singleton;

export default class AzureTextToSpeech {
  static getSingleton() {
    if (!singleton) {
      singleton = new AzureTextToSpeech();
    }
    return singleton;
  }

  constructor() {
    this.playing = false;
    this.queue = [];
    this.cachedSounds = {};
    this.defaultLanguage = 'English';
    this.defaultGender = 'female';
    this.soundSettings = {
      volume: 1.0,
      loop: false,
      forceHTML5: false,
      allowHTML5Mobile: true
    };
  }

  cacheKey = (language, gender, text) => {
    // TODO: implement this
    return [language, gender, text].join('-');
  };

  getCachedSound = (language, gender, text) => {
    const key = this.cacheKey(language, gender, text);
    return this.cachedSounds[key];
  };

  setCachedSound = (language, gender, text, speechResponse) => {
    const key = this.cacheKey(language, gender, text);
    this.cachedSounds[key] = speechResponse;
  };

  enqueue = (promise, playbackOptions) => {
    this.queue.push({promise, playbackOptions});
  };

  dequeue = () => {
    return this.queue.shift();
  };

  playFromQueue = async () => {
    if (this.playing) {
      return;
    }

    const nextSound = this.dequeue();
    if (!nextSound) {
      return;
    }

    this.playing = true;
    let response = await nextSound.promise;
    if (response.profaneWords.length > 0 || response.error) {
      nextSound.playbackOptions.onEnded();
    } else {
      Sounds.getSingleton().playBytes(
        response.bytes.slice(0),
        nextSound.playbackOptions
      );
    }
  };

  createSoundPromise = opts => {
    const {
      text,
      voices,
      language,
      gender,
      region,
      token,
      onProfanityFound
    } = opts;
    const wrappedSetCachedSound = speechResponse => {
      this.setCachedSound(language, gender, text, speechResponse);
    };

    return new Promise(async (resolve, reject) => {
      const profaneWords = await findProfanity(
        text,
        voices[language].languageCode,
        true /* shouldCache */
      );

      if (profaneWords && profaneWords.length > 0) {
        onProfanityFound(profaneWords);
        const speechResponse = new SpeechResponse(null, profaneWords);
        wrappedSetCachedSound(speechResponse);
        resolve(speechResponse);
      }

      let request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (request.readyState !== READY_STATE_DONE) {
          return;
        }

        if (request.status >= 200 && request.status < 300) {
          const speechResponse = new SpeechResponse(request.response);
          wrappedSetCachedSound(speechResponse);
          resolve(speechResponse);
        } else {
          resolve(new SpeechResponse(null, [], request.statusText));
        }
      };

      const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
      request.open('POST', url, true);
      request.responseType = 'arraybuffer';
      request.setRequestHeader('Authorization', `Bearer ${token}`);
      request.setRequestHeader('Content-Type', 'application/ssml+xml');
      request.setRequestHeader(
        'X-Microsoft-OutputFormat',
        'audio-16khz-32kbitrate-mono-mp3'
      );
      const voice = voices[language][gender];
      const requestSSML = `<speak version="1.0" xmlns="https://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${voice}">${text}</voice></speak>`;
      request.send(requestSSML);
    });
  };

  createCachedSoundPromise = (sound, opts) => {
    const {bytes, profaneWords} = sound;
    const {onProfanityFound} = opts;

    return new Promise((resolve, reject) => {
      if (profaneWords && profaneWords.length > 0) {
        onProfanityFound(profaneWords);
        resolve(new SpeechResponse(null, profaneWords));
      }

      resolve(new SpeechResponse(bytes));
    });
  };

  onSpeechComplete = () => {
    this.playing = false;
    this.playFromQueue();
  };

  play = opts => {
    let {language, gender} = opts;
    const {text, voices} = opts;

    // Fall back to defaults if requested language/gender combination is not available.
    if (!(voices[language] && voices[language][gender])) {
      language = this.defaultLanguage;
      gender = this.defaultGender;
    }

    const cachedSound = this.getCachedSound(language, gender, text);
    const soundPromise = cachedSound
      ? this.createCachedSoundPromise(cachedSound, opts)
      : this.createSoundPromise(opts);
    this.enqueue(soundPromise, {
      ...this.soundSettings,
      onEnded: this.onSpeechComplete
    });
    this.playFromQueue();
  };
}
