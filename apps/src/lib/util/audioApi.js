/* globals appOptions */
/** @file Droplet-friendly command defintions for audio commands. */
import * as assetPrefix from '@cdo/apps/assetManagement/assetPrefix';
import {apiValidateType, OPTIONAL, outputWarning} from './javascriptMode';
import i18n from '@cdo/locale';
import Sounds from '@cdo/apps/Sounds';
import AzureTextToSpeech from '@cdo/apps/AzureTextToSpeech';

/**
 * Inject an executeCmd method so this mini-library can be used in both
 * App Lab and Game Lab
 */
let executeCmd;
export function injectExecuteCmd(fn) {
  executeCmd = fn;
}

// Max text length for the playSpeech block.
export const MAX_SPEECH_TEXT_LENGTH = 750;

/**
 * Export a set of native code functions that student code can execute via the
 * interpreter.
 * Must be mixed in to the app's command list (see applab/commands.js)
 */
export const commands = {
  /**
   * Start playing a sound.
   * @param {string} opts.url The sound to play.
   * @param {boolean} [opts.loop] Whether to repeat the sound forever
   * TODO: Implement additional arguments as part of Sound Library Work
   *       Spec: https://docs.google.com/document/d/11mpYgmomALyAr53BQl2Ufx0ZYXoMAswqlQBA0aRuNag/edit#heading=h.6uzt0nqaaco
   * _@param {boolean} [opts.allowMultiple] If false (default) this call will
   *        stop other instances of the same sound from playing.  If true,
   *        multiple instances of the sound may be played simultaneously.
   * _@param {function} [opts.callback] Called back when the sound starts playing
   *        with an argument of true. If the sound fails to play, called back
   *        with an argument of false.
   * _@param {function} [opts.onEnded] Called back when the sound stops playing
   */
  playSound(opts) {
    apiValidateType(opts, 'playSound', 'url', opts.url, 'string');
    apiValidateType(opts, 'playSound', 'loop', opts.loop, 'boolean', OPTIONAL);
    apiValidateType(
      opts,
      'playSound',
      'callback',
      opts.callback,
      'function',
      OPTIONAL
    );
    apiValidateType(
      opts,
      'playSound',
      'onEnded',
      opts.onEnded,
      'function',
      OPTIONAL
    );

    const url = assetPrefix.fixPath(opts.url);
    if (Sounds.getSingleton().isPlaying(url)) {
      if (opts.callback) {
        opts.callback(false);
      }
    }

    // TODO: Re-enable forceHTML5 after Varnish 4.1 upgrade.
    //       See Pivotal #108279582
    //
    //       HTML5 audio is not working for user-uploaded MP3s due to a bug in
    //       Varnish 4.0 with certain forms of the Range request header.
    //
    //       By commenting this line out, we re-enable Web Audio API in App
    //       Lab, which has the following effects:
    //       GOOD: Web Audio should not use the Range header so it won't hit
    //             the bug.
    //       BAD: This disables cross-domain audio loading (hotlinking from an
    //            App Lab app to an audio asset on another site) so it might
    //            break some existing apps.  This should be less problematic
    //            since we now allow students to upload and serve audio assets
    //            from our domain via the Assets API now.
    //
    let forceHTML5 = false;
    if (window.location.protocol === 'file:') {
      // There is no way to make ajax requests from html on the filesystem.  So
      // the only way to play sounds is using HTML5. This scenario happens when
      // students export their apps and run them offline. At this point, their
      // uploaded sound files are exported as well, which means varnish is not
      // an issue.
      forceHTML5 = true;
    }
    Sounds.getSingleton().playURL(url, {
      volume: 1.0,
      loop: !!opts.loop,
      forceHTML5: forceHTML5,
      allowHTML5Mobile: true,
      callback: opts.callback,
      onEnded: opts.onEnded
    });
  },

  /**
   * Stop playing a sound, or all sounds.
   * @param {string} [opts.url] The sound to stop.  Stops all sounds if omitted.
   */
  stopSound(opts) {
    apiValidateType(opts, 'stopSound', 'url', opts.url, 'string', OPTIONAL);

    if (opts.url) {
      const url = assetPrefix.fixPath(opts.url);
      if (Sounds.getSingleton().isPlaying(url)) {
        Sounds.getSingleton().stopLoopingAudio(url);
      }
    } else {
      Sounds.getSingleton().stopAllAudio();
    }
  },
  /**
   * Start playing given text as speech.
   * @param {string} opts.text The text to play as speech.
   * @param {string} opts.gender The gender of the voice to play.
   * @param {string} opts.language The language of the text to play.
   */
  async playSpeech(opts) {
    const validText = apiValidateType(
      opts,
      'playSpeech',
      'text',
      opts.text,
      'string'
    );
    const validGender = apiValidateType(
      opts,
      'playSpeech',
      'gender',
      opts.gender,
      'string'
    );
    if (!validText || opts.text.length === 0 || !validGender) {
      return;
    }
    apiValidateType(
      opts,
      'playSpeech',
      'language',
      opts.language,
      'string',
      OPTIONAL
    );

    // appOptions.authenticityToken is only expected/used when using this block on a script_level.
    // This is because script_levels remove Rails' authenticity token from the DOM for caching purposes:
    // https://github.com/code-dot-org/code-dot-org/pull/5753
    const {azureSpeechServiceVoices: voices, authenticityToken} = appOptions;
    let {text, gender, language} = opts;

    // Fall back to defaults if requested language/gender combination is not available.
    if (!(voices[language] && voices[language][gender])) {
      language = 'English';
      gender = 'female';
    }

    const MAX_TEXT_LENGTH = 750;
    if (text.length > MAX_TEXT_LENGTH) {
      text = text.slice(0, MAX_TEXT_LENGTH);
      outputWarning(i18n.textToSpeechTruncation());
    }

    const azureTTS = AzureTextToSpeech.getSingleton();
    const promise = azureTTS.createSoundPromise({
      text,
      gender,
      locale: voices[language].locale,
      authenticityToken,
      onFailure: message => outputWarning(message + '\n')
    });
    azureTTS.enqueueAndPlay(promise);
  }
};

/**
 * Pass-through functions that call the configured `executeCmd` method with
 * arguments converted to an options object.
 */
export const executors = {
  playSound: (url, loop = false, callback) =>
    executeCmd(null, 'playSound', {url, loop, callback}),
  stopSound: url => executeCmd(null, 'stopSound', {url}),
  playSpeech: (text, gender, language = 'English') =>
    executeCmd(null, 'playSpeech', {text, gender, language})
};
// Note to self - can we use _.zipObject to map argumentNames to arguments here?
