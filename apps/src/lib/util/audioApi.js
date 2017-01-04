/** @file Droplet-friendly command defintions for audio commands. */
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import * as assetPrefix from '@cdo/apps/assetManagement/assetPrefix';
import {
  apiValidateType,
  OPTIONAL
} from '@cdo/apps/javascriptMode';

/**
 * Inject an executeCmd method so this mini-library can be used in both
 * App Lab and Game Lab
 */
let executeCmd;
export function injectExecuteCmd(fn) {
  executeCmd = fn;
}

let audioCommands = {};

/**
 *
 * @param {Object} commands Object holding the set of commands for a droplet
 *        toolkit, which is mutated when passed into this function to add
 *        a set of audio commands.
 * @returns {Object} the mutated commands object
 */
export function addAudioCommands(commands) {
  for (const commandName in audioCommands) {
    if (!audioCommands.hasOwnProperty(commandName)) {
      continue;
    }

    if (commands.hasOwnProperty(commandName)) {
      throw new Error(`Attempted to add "${commandName}" to the command set but it already exists`);
    }

    commands[commandName] = audioCommands[commandName];
  }
  return commands;
}

export function playSound(url) {
  return executeCmd(null, 'playSound', {'url': url});
}

audioCommands.playSound = function (opts) {
  apiValidateType(opts, 'playSound', 'url', opts.url, 'string');

  if (studioApp.cdoSounds) {
    let url = assetPrefix.fixPath(opts.url);
    if (studioApp.cdoSounds.isPlayingURL(url)) {
      return;
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
    studioApp.cdoSounds.playURL(url, {
      volume: 1.0,
      forceHTML5: forceHTML5,
      allowHTML5Mobile: true
    });
  }
};

/**
 * Stop playing sounds.
 * @param {string} [url] - optional.  If omitted, stops all sounds.
 */
export function stopSound(url) {
  return executeCmd(null, 'stopSound', {'url': url});
}

/**
 * Stop playing a sound, or all sounds.
 * @param {string} [opts.url] The sound to stop.  Stops all sounds if omitted.
 */
audioCommands.stopSound = function (opts) {
  apiValidateType(opts, 'stopSound', 'url', opts.url, 'string', OPTIONAL);

  if (studioApp.cdoSounds) {
    if (opts.url) {
      const url = assetPrefix.fixPath(opts.url);
      if (studioApp.cdoSounds.isPlayingURL(url)) {
        studioApp.cdoSounds.stopLoopingAudio(url);
      }
    } else {
      studioApp.cdoSounds.stopAllAudio();
    }
  }
};
