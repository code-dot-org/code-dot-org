/* globals appOptions */
/** @file Droplet-friendly command defintions for audio commands. */
import * as assetPrefix from '@cdo/apps/assetManagement/assetPrefix';
import {apiValidateType, OPTIONAL} from './javascriptMode';
import Sounds from '../../Sounds';
import {textToSpeech} from './speech';

/**
 * Inject an executeCmd method so this mini-library can be used in both
 * App Lab and Game Lab
 */
let executeCmd;
export function injectExecuteCmd(fn) {
  executeCmd = fn;
}

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
    apiValidateType(opts, 'playSpeech', 'text', opts.text, 'string');
    apiValidateType(opts, 'playSpeech', 'gender', opts.gender, 'string');
    apiValidateType(
      opts,
      'playSpeech',
      'language',
      opts.language,
      'string',
      OPTIONAL
    );
    textToSpeech(
      opts.text,
      opts.gender,
      opts.language,
      appOptions.azureSpeechServiceToken,
      appOptions.azureSpeechServiceRegion,
      appOptions.azureSpeechServiceLanguages
    );
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
  playSpeech: (text, gender, language = 'en-US') =>
    executeCmd(null, 'playSpeech', {text, gender, language})
};
// Note to self - can we use _.zipObject to map argumentNames to arguments here?
