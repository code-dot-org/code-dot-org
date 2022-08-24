import WebAudio from './soundSub';

var soundList = ['baddie-seen', 'drumloop', 'tune'];

var baseSoundUrl;

var audioSoundBuffers = new Array();
var tagGroups = {};

var audioIdUpto = 0;

var audioSystem;

export function InitSound() {
  // regular web version.
  baseSoundUrl = 'https://www.amithebaddie.com/game/sounds/';
  audioSystem = new WebAudio();

  LoadSounds();
}

export function GetCurrentAudioTime() {
  return audioSystem.getCurrentTime();
}

function LoadSounds() {
  //console.log("Loading sounds from " + baseSoundUrl);

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
export function PlaySound(name, groupTag, when = 0, loop = false) {
  for (var i = 0; i < soundList.length; i++) {
    if (soundList[i] == name) {
      // Always provide a groupTag.  If one wasn't provided, just use the sound name as the group name.
      PlaySoundByIndex(i, groupTag || name, when, loop);
      break;
    }
  }
}

function PlaySoundByIndex(audioBufferIndex, groupTag, when, loop) {
  if (!audioSoundBuffers[audioBufferIndex]) return;

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
    }
  );

  tagGroup.sources.push({source: source, id: audioIdUpto});
  audioIdUpto++;
}

function RemoveStoppedBuffer(groupTag, soundSourceId) {
  var sources = tagGroups[groupTag].sources;

  for (var s = sources.length - 1; s >= 0; s--) {
    var source = sources[s];

    if (source.id == soundSourceId) {
      sources.splice(s, 1);
    }
  }
}

// Stop all sounds with a given groupTag.
function StopSound(groupTag) {
  if (!tagGroups[groupTag]) {
    return;
  }

  var sources = tagGroups[groupTag].sources;

  for (var b = 0; b < sources.length; b++) {
    var source = sources[b].source;
    audioSystem.StopSoundBySource(source);
  }
}
