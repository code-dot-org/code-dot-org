import Sounds from '@cdo/apps/Sounds';
// TODO: move this function to shared util file
import {findProfanity} from '@cdo/apps/code-studio/components/libraries/util';

// XMLHttpRequest readyState 4 means the request is done.
// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
const READY_STATE_DONE = 4;

class SpeechResponse {
  constructor(bytes, playbackOptions, profaneWords = [], error = null) {
    this.bytes = bytes;
    this.playbackOptions = playbackOptions;
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
    this.playbackOptions = {
      volume: 1.0,
      loop: false,
      forceHTML5: false,
      allowHTML5Mobile: true,
      onEnded: this.onSpeechComplete
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

  enqueue = promise => {
    this.queue.push(promise);
  };

  dequeue = () => {
    return this.queue.shift();
  };

  playFromQueue = async () => {
    if (this.playing) {
      return;
    }

    const nextSoundPromise = this.dequeue();
    if (!nextSoundPromise) {
      return;
    }

    this.playing = true;
    let response = await nextSoundPromise;
    if (response.profaneWords.length > 0 || response.error) {
      response.playbackOptions.onEnded();
    } else {
      Sounds.getSingleton().playBytes(
        response.bytes.slice(0),
        response.playbackOptions
      );
    }
  };

  createSpeechResponse = opts => {
    return new SpeechResponse(
      opts.bytes,
      this.playbackOptions,
      opts.profaneWords,
      opts.error
    );
  };

  createSoundPromise = (sound, opts) => {
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
    const wrappedCreateSpeechResponse = opts => {
      return this.createSpeechResponse(opts);
    };

    if (sound) {
      const {bytes, profaneWords} = sound;

      return new Promise(resolve => {
        if (profaneWords && profaneWords.length > 0) {
          onProfanityFound(profaneWords);
          resolve(wrappedCreateSpeechResponse({profaneWords}));
        } else {
          resolve(wrappedCreateSpeechResponse({bytes}));
        }
      });
    }

    return new Promise(async resolve => {
      const profaneWords = await findProfanity(
        text,
        voices[language].languageCode,
        true /* shouldCache */
      );

      if (profaneWords && profaneWords.length > 0) {
        onProfanityFound(profaneWords);
        const speechResponse = wrappedCreateSpeechResponse({profaneWords});
        wrappedSetCachedSound(speechResponse);
        resolve(speechResponse);
        return;
      }

      let request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (request.readyState !== READY_STATE_DONE) {
          return;
        }

        if (request.status >= 200 && request.status < 300) {
          const speechResponse = wrappedCreateSpeechResponse({
            bytes: request.response
          });
          wrappedSetCachedSound(speechResponse);
          resolve(speechResponse);
        } else {
          resolve(wrappedCreateSpeechResponse({error: request.statusText}));
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
    this.enqueue(this.createSoundPromise(cachedSound, opts));
    this.playFromQueue();
  };
}
