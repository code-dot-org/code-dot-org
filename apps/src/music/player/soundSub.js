// audio
var audioContext = null;

// var soundSourceIdUpto = 0;

function createAudioContext(desiredSampleRate) {
  var AudioCtor = window.AudioContext || window.webkitAudioContext;

  desiredSampleRate =
    typeof desiredSampleRate === 'number' ? desiredSampleRate : 44100;
  var context = new AudioCtor();

  // Check if hack is necessary. Only occurs in iOS6+ devices
  // and only when you first boot the iPhone, or play a audio/video
  // with a different sample rate
  if (
    /(iPhone|iPad)/i.test(navigator.userAgent) &&
    context.sampleRate !== desiredSampleRate
  ) {
    var buffer = context.createBuffer(1, 1, desiredSampleRate);
    var dummy = context.createBufferSource();
    dummy.buffer = buffer;
    dummy.connect(context.destination);
    dummy.start(0);
    dummy.disconnect();

    context.close(); // dispose old context
    context = new AudioCtor();
  }

  return context;
}

function WebAudio() {
  try {
    audioContext = createAudioContext(48000);
  } catch (e) {
    console.log('Web Audio API is not supported in this browser');
    audioContext = null;
  }
}

WebAudio.prototype.getCurrentTime = function() {
  if (audioContext) {
    return audioContext.currentTime;
  } else {
    return null;
  }
};

WebAudio.prototype.LoadSound = function(url, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  //console.log("loading sound", url);

  // Decode asynchronously
  request.onload = function() {
    try {
      audioContext.decodeAudioData(
        request.response,
        function(buffer) {
          callback(buffer);
        },
        function(e) {
          console.log('error ' + e);
        }
      );
    } catch (e) {
      console.log('failed to decode');
    }
  };
  request.send();
};

WebAudio.prototype.LoadSoundFromBuffer = function(buffer, callback) {
  try {
    audioContext.decodeAudioData(
      buffer,
      function(buffer) {
        callback(buffer);
      },
      function(e) {
        console.log('error ', e);
      }
    );
  } catch (e) {
    console.log('failed to decode', e);
  }
};

WebAudio.prototype.PlaySoundByBuffer = function(
  audioBuffer,
  id,
  when,
  loop,
  callback
) {
  var source = audioContext.createBufferSource(); // creates a sound source
  source.buffer = audioBuffer; // tell the source which sound to play

  // connect the source direct to the destination
  source.connect(audioContext.destination);

  source.onended = callback.bind(this, id);

  source.loop = loop;

  source.start(when); // play the source now

  if (['suspended', 'interrupted'].includes(source.context.state)) {
    source.context.resume();
  }

  return source;
};

WebAudio.prototype.StopSoundBySource = function(source) {
  // todo: investigate whether this condition is needed/useful
  // across browsers.

  //if (source.context.state === 'running') {
  source.stop();
  //}
};

export default WebAudio;
