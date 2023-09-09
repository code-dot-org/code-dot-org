import {fetchSignedCookies} from '@cdo/apps/utils';
import WebAudio from './soundSub';
import {baseAssetUrl} from '../constants';
var soundList = [];

var restrictedSoundUrlPath;

var audioSoundBuffers = [];
var tagGroups = {};

var audioIdUpto = 0;

var audioSystem = null;

/**
 *
 * @param {*} desiredSounds A list of sounds to load into the audio system.
 *  Each sound has a format:
 *  {
 *    path: string // relative file path to load,
 *    restricted: boolean // if this sound is restricted (and should be
 *        loaded from the restricted bucket)
 *  }
 * @param {*} options Optional audio system configuration.
 *   {
 *     delayTimeSeconds: number, // Delay time used in the delay effect
 *     releaseTimeSeconds: number // Release time for fading out fixed-duration sounds
 *     updateLoadProgress: progress: number => void // Callback to report loading progress
 *     reportSoundLibraryLoadTime: loadTimeMs: number => void // Optional callback to report sound library load time
 *   }
 */
export function InitSound(desiredSounds, options) {
  // regular web version.
  restrictedSoundUrlPath = '/restricted/musiclab/';
  audioSystem = new WebAudio(options);

  LoadSounds(
    desiredSounds,
    options.updateLoadProgress,
    options.reportSoundLibraryLoadTime
  );
}

export function LoadSoundFromBuffer(id, buffer) {
  audioSystem.LoadSoundFromBuffer(
    buffer,
    function (id, buffer) {
      audioSoundBuffers[id] = buffer;
    }.bind(this, id)
  );
}

export function GetCurrentAudioTime() {
  return audioSystem?.getCurrentTime();
}

async function LoadSounds(
  desiredSounds,
  updateLoadProgress,
  reportSoundLibraryLoadTime
) {
  const soundLoadStartTime = Date.now();
  soundList = desiredSounds;

  // If there are any restricted sounds in the manifest, we need to load
  // signed cookies.
  let canLoadRestrictedContent = false;
  if (soundList.findIndex(sound => sound.restricted) >= 0) {
    try {
      const response = await fetchSignedCookies();
      if (response.ok) {
        canLoadRestrictedContent = true;
      }
    } catch (error) {
      console.error('Error loading signed cookies: ' + error);
    }
  }

  let soundsToLoad = 0;
  for (let i = 0; i < soundList.length; i++) {
    const sound = soundList[i];
    const basePath = sound.restricted ? restrictedSoundUrlPath : baseAssetUrl;
    if (sound.restricted && !canLoadRestrictedContent) {
      // Skip loading restricted songs if we can't load restricted content.
      continue;
    }

    soundsToLoad++;
    audioSystem.LoadSound(
      basePath + sound.path + '.mp3',
      function (id, buffer) {
        audioSoundBuffers[id] = buffer;
      }.bind(this, i),
      () => {
        soundsToLoad--;
        if (soundsToLoad === 0) {
          const loadTimeMs = Date.now() - soundLoadStartTime;
          reportSoundLibraryLoadTime(loadTimeMs);
        }
        updateLoadProgress(
          (soundList.length - soundsToLoad) / soundList.length
        );
      }
    );
  }
}

export function StartPlayback() {
  audioSystem.StartPlayback();
}

// play a sound.
// an optional groupTag puts the sound in a group with a limited set of instances.
export function PlaySound(
  name,
  groupTag,
  when = 0,
  onStop = () => {},
  loop = false,
  effects,
  duration
) {
  for (var i = 0; i < soundList.length; i++) {
    if (soundList[i].path === name) {
      // Always provide a groupTag.  If one wasn't provided, just use the sound name as the group name.
      return PlaySoundByIndex(
        i,
        groupTag || name,
        when,
        loop,
        effects,
        onStop,
        duration
      );
    }
  }
}

function PlaySoundByIndex(
  audioBufferIndex,
  groupTag,
  when,
  loop,
  effects,
  onStop,
  duration
) {
  if (!audioSoundBuffers[audioBufferIndex]) {
    return;
  }

  // Set up a tag group if we don't have one already.
  if (!tagGroups[groupTag]) {
    tagGroups[groupTag] = {
      sources: [],
    };
  }

  var tagGroup = tagGroups[groupTag];

  var source = audioSystem.PlaySoundByBuffer(
    audioSoundBuffers[audioBufferIndex],
    audioIdUpto,
    when,
    loop,
    effects,
    function (id) {
      // callback received when sound ends
      //console.log("sound ended", id);

      // we've recorded this source (in case we needed to stop it prematurely),
      // so now we can release the handle.
      RemoveStoppedBuffer(groupTag, id);
      if (onStop) {
        onStop();
      }
    },
    duration
  );

  tagGroup.sources.push({source: source, id: audioIdUpto});
  return audioIdUpto++;
}

function RemoveStoppedBuffer(groupTag, soundSourceId) {
  var sources = tagGroups[groupTag].sources;

  for (var s = sources.length - 1; s >= 0; s--) {
    var source = sources[s];

    if (source.id === soundSourceId) {
      sources.splice(s, 1);
    }
  }
}

// Stop all sounds with a given groupTag.
export function StopSound(groupTag) {
  if (!tagGroups[groupTag]) {
    return;
  }

  var sources = tagGroups[groupTag].sources;

  for (var b = 0; b < sources.length; b++) {
    var source = sources[b].source;
    audioSystem.StopSoundBySource(source);
  }
}

export function StopSoundByUniqueId(groupTag, uniqueId) {
  var sources = tagGroups[groupTag].sources;
  const source = sources.find(source => source.id === uniqueId)?.source;
  if (source) {
    audioSystem.StopSoundBySource(source);
  }
}
