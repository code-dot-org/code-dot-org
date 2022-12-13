import WebAudio from './soundSub';

var soundList = [];

var baseSoundUrl;

var audioSoundBuffers = [];
var tagGroups = {};

var audioIdUpto = 0;

var audioSystem = null;

export function InitSound(desiredSounds) {
  // regular web version.
  baseSoundUrl = 'https://cdo-dev-music-prototype.s3.amazonaws.com/';
  audioSystem = new WebAudio();

  LoadSounds(desiredSounds);
}

export function LoadSoundFromBuffer(id, buffer) {
  audioSystem.LoadSoundFromBuffer(
    buffer,
    function(id, buffer) {
      audioSoundBuffers[id] = buffer;
    }.bind(this, id)
  );
}

export function GetCurrentAudioTime() {
  return audioSystem?.getCurrentTime();
}

function LoadSounds(desiredSounds) {
  //console.log("Loading sounds from " + baseSoundUrl);

  soundList = desiredSounds;

  for (var i = 0; i < soundList.length; i++) {
    audioSystem.LoadSound(
      baseSoundUrl + soundList[i] + '.mp3',
      function(id, buffer) {
        audioSoundBuffers[id] = buffer;
        //console.log("saving audio", id);
      }.bind(this, i)
    );
  }
}

// play a sound.
// an optional groupTag puts the sound in a group with a limited set of instances.
export function PlaySound(
  name,
  groupTag,
  when = 0,
  onStop = () => {},
  loop = false
) {
  for (var i = 0; i < soundList.length; i++) {
    if (soundList[i] === name) {
      // Always provide a groupTag.  If one wasn't provided, just use the sound name as the group name.
      return PlaySoundByIndex(i, groupTag || name, when, loop, onStop);
    }
  }
}

function PlaySoundByIndex(audioBufferIndex, groupTag, when, loop, onStop) {
  if (!audioSoundBuffers[audioBufferIndex]) {
    return;
  }

  // Set up a tag group if we don't have one already.
  if (!tagGroups[groupTag]) {
    tagGroups[groupTag] = {
      sources: []
    };
  }

  var tagGroup = tagGroups[groupTag];

  var source = audioSystem.PlaySoundByBuffer(
    audioSoundBuffers[audioBufferIndex],
    audioIdUpto,
    when,
    loop,
    function(id) {
      // callback received when sound ends
      //console.log("sound ended", id);

      // we've recorded this source (in case we needed to stop it prematurely),
      // so now we can release the handle.
      RemoveStoppedBuffer(groupTag, id);
      if (onStop) {
        onStop();
      }
    }
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
