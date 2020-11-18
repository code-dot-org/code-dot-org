import Sounds from '@cdo/apps/Sounds';
import {hashString, findProfanity} from '@cdo/apps/utils';

// XMLHttpRequest readyState 4 means the request is done.
// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState
const READY_STATE_DONE = 4;

class SoundResponse {
  constructor(bytes, playbackOptions, profaneWords = [], error = null) {
    this.bytes = bytes;
    this.playbackOptions = playbackOptions;
    this.profaneWords = profaneWords;
    this.error = error;
  }

  success = () => {
    return this.bytes && this.profaneWords.length === 0 && !this.error;
  };
}

let singleton;

export default class AzureTextToSpeech {
  /**
   * Instantiate or get class singleton. Using this is recommended to take advantage of caching.
   */
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
    this.playbackOptions = {
      volume: 1.0,
      loop: false,
      forceHTML5: false,
      allowHTML5Mobile: true,
      onEnded: this.onSoundComplete
    };
  }

  /**
   *
   * @param {Promise<SoundResponse>} soundPromise A promise that returns a SoundResponse when resolved.
   */
  enqueueAndPlay = soundPromise => {
    this.enqueue(soundPromise);
    this.playFromQueue();
  };

  /**
   * Returns a promise representing a TTS sound that can be enqueued and played. Utilizes a sound cache --
   * will check for a cache hit to avoid duplicate network requests, and caches network responses for re-use.
   * @param {Object} opts
   * @param {string} opts.text
   * @param {string} opts.gender
   * @param {string} opts.languageCode
   * @param {string} opts.url
   * @param {string} opts.ssml
   * @param {string} opts.token Authentication token from Azure.
   * @param {function(Array<string>)} opts.onProfanityFound Called if the given text contains profanity.
   * @returns {Promise<SoundResponse>} A promise that returns a SoundResponse when resolved.
   */
  createSoundPromise = opts => {
    const {
      text,
      gender,
      languageCode,
      url,
      ssml,
      token,
      onProfanityFound
    } = opts;
    const cachedSound = this.getCachedSound(languageCode, gender, text);
    const wrappedSetCachedSound = soundResponse => {
      this.setCachedSound(languageCode, gender, text, soundResponse);
    };
    const wrappedCreateSoundResponse = this.createSoundResponse;

    // If we have the sound already, resolve immediately.
    if (cachedSound) {
      const {bytes, profaneWords} = cachedSound;

      return new Promise(resolve => {
        if (profaneWords && profaneWords.length > 0) {
          onProfanityFound(profaneWords);
          resolve(wrappedCreateSoundResponse({profaneWords}));
        } else {
          resolve(wrappedCreateSoundResponse({bytes}));
        }
      });
    }

    // Otherwise, check the text for profanity and request the TTS sound.
    return new Promise(async resolve => {
      const profaneWords = await findProfanity(
        text,
        languageCode,
        true /* shouldCache */
      );

      if (profaneWords && profaneWords.length > 0) {
        onProfanityFound(profaneWords);
        const soundResponse = wrappedCreateSoundResponse({profaneWords});
        wrappedSetCachedSound(soundResponse);
        resolve(soundResponse);
        return;
      }

      let request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (request.readyState !== READY_STATE_DONE) {
          return;
        }

        if (request.status >= 200 && request.status < 300) {
          const soundResponse = wrappedCreateSoundResponse({
            bytes: request.response
          });
          wrappedSetCachedSound(soundResponse);
          resolve(soundResponse);
        } else {
          resolve(wrappedCreateSoundResponse({error: request.statusText}));
        }
      };

      request.open('POST', url, true);
      request.responseType = 'arraybuffer';
      request.setRequestHeader('Authorization', `Bearer ${token}`);
      request.setRequestHeader('Content-Type', 'application/ssml+xml');
      request.setRequestHeader(
        'X-Microsoft-OutputFormat',
        'audio-16khz-32kbitrate-mono-mp3'
      );
      request.send(ssml);
    });
  };

  /**
   * Plays the next sound in the queue. Automatically ends playback if the SoundResponse was unsuccessful.
   */
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
    if (response.success()) {
      Sounds.getSingleton().playBytes(
        response.bytes.slice(0),
        response.playbackOptions
      );
    } else {
      response.playbackOptions.onEnded();
    }
  };

  /**
   * Called when a TTS sound is done playing. Set as part of this.playbackOptions.
   */
  onSoundComplete = () => {
    this.playing = false;
    this.playFromQueue();
  };

  /**
   * Generates the cache key, which is an MD5 hash of the composite key (languageCode-gender-text).
   * We hash the composite key to avoid extra-long cache keys (as the text is part of the key).
   * @param {string} languageCode
   * @param {string} gender
   * @param {string} text
   * @returns {string} MD5 hash string
   */
  cacheKey = (languageCode, gender, text) => {
    return hashString([languageCode, gender, text].join('-'));
  };

  /**
   * Returns the cached SoundResponse if it exists.
   * @param {string} languageCode
   * @param {string} gender
   * @param {string} text
   * @returns {SoundResponse|undefined}
   */
  getCachedSound = (languageCode, gender, text) => {
    const key = this.cacheKey(languageCode, gender, text);
    return this.cachedSounds[key];
  };

  /**
   * Adds the given SoundResponse to the cache.
   * @param {string} languageCode
   * @param {string} gender
   * @param {string} text
   * @param {SoundResponse} SoundResponse
   */
  setCachedSound = (languageCode, gender, text, soundResponse) => {
    const key = this.cacheKey(languageCode, gender, text);
    this.cachedSounds[key] = soundResponse;
  };

  /**
   * Add a promise to the end of the queue.
   * @param {Promise<SoundResponse>} promise A promise that returns a SoundResponse when resolved.
   */
  enqueue = promise => {
    this.queue.push(promise);
  };

  /**
   * Get the next promise in the queue.
   * @returns {Promise<SoundResponse>} A promise that returns a SoundResponse when resolved.
   */
  dequeue = () => {
    return this.queue.shift();
  };

  /**
   * Wrapper for creating a new SoundResponse.
   * @param {Object} opts
   * @param {ArrayBuffer} opts.bytes Bytes representing the sound to be played.
   * @param {Array<string>} opts.profaneWords Profanity present in requested TTS text.
   * @param {string} opts.error Any error during the TTS request.
   * @returns {SoundResponse}
   */
  createSoundResponse = opts => {
    return new SoundResponse(
      opts.bytes,
      this.playbackOptions,
      opts.profaneWords,
      opts.error
    );
  };
}
