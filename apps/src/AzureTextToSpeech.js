import $ from 'jquery';
import i18n from '@cdo/locale';
import {hashString, findProfanity} from '@cdo/apps/utils';
import Sounds from '@cdo/apps/Sounds';

/**
 * A packaged response for a requested sound. Used for caching and for playing sound bytes.
 * @param {ArrayBuffer} bytes Sound bytes from Azure Speech Service. For clarity, this should be null if the response contains profaneWords.
 * @param {Object} playbackOptions Configuration options for a playing sound.
 * @param {Array<string>} profaneWords Any profanity in the response. Used to determine whether the response should be cached and played.
 * @param {Error} error Any error that occurs while requesting the sound or checking for profanity.
 */
export class SoundResponse {
  constructor(bytes, playbackOptions, profaneWords = [], error = null) {
    this.bytes = bytes;
    this.playbackOptions = playbackOptions;
    this.profaneWords = profaneWords;
    this.error = error;
  }

  success = () => {
    return this.bytes && this.profaneWords.length === 0 && !this.error;
  };

  profanityMessage = () => {
    if (!this.profaneWords || this.profaneWords.length === 0) {
      return null;
    }

    return i18n.textToSpeechProfanity({
      profanityCount: this.profaneWords.length,
      profaneWords: this.profaneWords.join(', ')
    });
  };

  errorMessage = () => {
    if (!this.error) {
      return null;
    }

    switch (this.error.status) {
      case 429:
        return i18n.azureTtsTooManyRequests();
      default:
        return i18n.azureTtsDefaultError();
    }
  };
}

let singleton;

/**
 * Converts text to sound bytes using Azure Speech Service. Before requesting sound bytes from Azure, we check for profanity
 * in the text through our servers. If profanity is found, the sound will not be played.
 * Uses an in-memory cache to reduce network calls (for both checking profanity and requesting sound bytes from Azure).
 */
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
    this.queue_ = [];
    this.cachedSounds_ = {};
    this.playbackOptions_ = {
      volume: 1.0,
      loop: false,
      forceHTML5: false,
      allowHTML5Mobile: true,
      onEnded: this.onSoundComplete_
    };
  }

  /**
   *
   * @param {function} soundPromise A thunk that returns promise, which resolves to a SoundResponse.
   */
  enqueueAndPlay = soundPromise => {
    this.enqueue_(soundPromise);
    this.asyncPlayFromQueue_(this.playBytes_);
  };

  /**
   * A thunk that returns a promise representing a TTS sound that can be enqueued and played. Utilizes a sound cache --
   * will check for a cache hit to avoid duplicate network requests, and caches network responses for re-use.
   * @param {Object} opts
   * @param {string} opts.text
   * @param {string} opts.gender
   * @param {string} opts.languageCode
   * @param {string} opts.url URL to request sound from.
   * @param {string} opts.ssml SSML in request body.
   * @param {string} opts.token Authentication token from Azure.
   * @param {function(string)} opts.onFailure Called with an error message if the sound will not be played.
   * @returns {function} A thunk that returns promise, which resolves to a SoundResponse. Example usage:
   * const soundPromise = createSoundPromise(options);
   * const soundResponse = await soundPromise();
   */
  createSoundPromise = opts => () => {
    const {text, gender, languageCode, onFailure} = opts;
    const cachedSound = this.getCachedSound_(languageCode, gender, text);
    const wrappedSetCachedSound = soundResponse => {
      this.setCachedSound_(languageCode, gender, text, soundResponse);
    };
    const wrappedCreateSoundResponse = this.createSoundResponse_;

    // If we have the sound already, resolve immediately.
    if (cachedSound) {
      const {bytes, profaneWords} = cachedSound;

      return new Promise(resolve => {
        if (profaneWords && profaneWords.length > 0) {
          const soundResponse = wrappedCreateSoundResponse({profaneWords});
          onFailure(soundResponse.profanityMessage());
          resolve(soundResponse);
        } else {
          resolve(wrappedCreateSoundResponse({bytes}));
        }
      });
    }

    // Otherwise, check the text for profanity and request the TTS sound.
    return new Promise(async resolve => {
      try {
        const profaneWords = await findProfanity(text, languageCode);
        if (profaneWords && profaneWords.length > 0) {
          const soundResponse = wrappedCreateSoundResponse({profaneWords});
          onFailure(soundResponse.profanityMessage());
          wrappedSetCachedSound(soundResponse);
          resolve(soundResponse);
          return;
        }

        const bytes = await this.convertTextToSpeech(
          text,
          gender,
          languageCode
        );
        const soundResponse = wrappedCreateSoundResponse({bytes});
        wrappedSetCachedSound(soundResponse);
        resolve(soundResponse);
      } catch (error) {
        const soundResponse = wrappedCreateSoundResponse({error});
        onFailure(soundResponse.errorMessage());
        resolve(soundResponse);
      }
    });
  };

  /**
   *
   * @param {string} text
   * @param {string} gender
   * @param {string} locale
   * @returns {Promise<ArrayBuffer>} A promise that resolves to an ArrayBuffer.
   */
  convertTextToSpeech = (text, gender, locale) => {
    return $.ajax({
      url: '/dashboardapi/v1/text_to_speech/azure',
      method: 'POST',
      dataType: 'binary',
      responseType: 'arraybuffer',
      data: {text, gender, locale}
    });
  };

  /**
   * Plays the next sound in the queue. Automatically ends playback if the SoundResponse was unsuccessful.
   * @param {function(ArrayBuffer, Object)} play Function that plays sound bytes.
   * @private
   */
  asyncPlayFromQueue_ = async play => {
    if (this.playing) {
      return;
    }

    const nextSoundPromise = this.dequeue_();
    if (!nextSoundPromise) {
      return;
    }

    this.playing = true;
    let response = await nextSoundPromise();
    if (response.success()) {
      play(response.bytes.slice(0), response.playbackOptions);
    } else {
      response.playbackOptions.onEnded();
    }
  };

  /**
   * A wrapper for the Sounds.getSingleton().playBytes function to aid in testability.
   * @param {ArrayBuffer} bytes
   * @param {Object} playbackOptions
   * @private
   */
  playBytes_ = (bytes, playbackOptions) => {
    Sounds.getSingleton().playBytes(bytes, playbackOptions);
  };

  /**
   * Called when a TTS sound is done playing. Set as part of this.playbackOptions_.
   * @private
   */
  onSoundComplete_ = () => {
    this.playing = false;
    this.asyncPlayFromQueue_(this.playBytes_);
  };

  /**
   * Generates the cache key, which is an MD5 hash of the composite key (languageCode-gender-text).
   * We hash the composite key to avoid extra-long cache keys (as the text is part of the key).
   * @param {string} languageCode
   * @param {string} gender
   * @param {string} text
   * @returns {string} MD5 hash string
   * @private
   */
  cacheKey_ = (languageCode, gender, text) => {
    return hashString([languageCode, gender, text].join('-'));
  };

  /**
   * Returns the cached SoundResponse if it exists.
   * @param {string} languageCode
   * @param {string} gender
   * @param {string} text
   * @returns {SoundResponse|undefined}
   * @private
   */
  getCachedSound_ = (languageCode, gender, text) => {
    const key = this.cacheKey_(languageCode, gender, text);
    return this.cachedSounds_[key];
  };

  /**
   * Adds the given SoundResponse to the cache.
   * @param {string} languageCode
   * @param {string} gender
   * @param {string} text
   * @param {SoundResponse} SoundResponse
   * @private
   */
  setCachedSound_ = (languageCode, gender, text, soundResponse) => {
    const key = this.cacheKey_(languageCode, gender, text);
    this.cachedSounds_[key] = soundResponse;
  };

  /**
   * Add to the end of the queue.
   * @param {function} promise A thunk that returns promise, which resolves to a SoundResponse.
   * @private
   */
  enqueue_ = promise => {
    this.queue_.push(promise);
  };

  /**
   * Get the next item in the queue.
   * @returns {function} A thunk that returns promise, which resolves to a SoundResponse.
   * @private
   */
  dequeue_ = () => {
    return this.queue_.shift();
  };

  /**
   * Wrapper for creating a new SoundResponse.
   * @param {Object} opts
   * @param {ArrayBuffer} opts.bytes Bytes representing the sound to be played.
   * @param {Array<string>} opts.profaneWords Profanity present in requested TTS text.
   * @param {string} opts.error Any error during the TTS request.
   * @returns {SoundResponse}
   * @private
   */
  createSoundResponse_ = opts => {
    return new SoundResponse(
      opts.bytes,
      this.playbackOptions_,
      opts.profaneWords,
      opts.error
    );
  };
}
