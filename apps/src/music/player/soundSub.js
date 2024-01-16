import SoundEffects from './soundEffects';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
//import * as Tone from 'tone';
//import '../../../node_modules/tone/build/esm/index.js';
// const Tone = require('tone');

// import {PitchShifter} from 'soundtouchjs';

const DEFAULT_DELAY_TIME = 60 / 120 / 2;

// audio
var audioContext = null;

var soundEffects = null;

// Time constant used to compute the release rate; at each time constant
// interval the sound will decay exponentially.
const RELEASE_TIME_CONSTANT = 0.075;

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

class AudioSystem {
  constructor() {
    try {
      audioContext = createAudioContext(48000);
    } catch (e) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError('Web Audio API is not supported in this browser', e);
      throw e;
    }

    soundEffects = new SoundEffects(audioContext, DEFAULT_DELAY_TIME);
  }

  /**
   * @param {*} options Audio system configuration.
   *   {
   *     delayTimeSeconds: number, // Delay time used in the delay effect
   *     releaseTimeSeconds: number // Release time for fading out fixed-duration sounds
   *   }
   */
  updateConfiguration(options) {
    const {delayTimeSeconds, releaseTimeSeconds} = options;
    soundEffects = new SoundEffects(audioContext, delayTimeSeconds);
    this.releaseTimeSeconds = releaseTimeSeconds;
  }

  getCurrentTime() {
    if (audioContext) {
      return audioContext.currentTime;
    } else {
      return null;
    }
  }

  StartPlayback() {
    if (['suspended', 'interrupted'].includes(audioContext.state)) {
      audioContext.resume();
    }
  }

  PlaySoundByBuffer(
    audioBuffer,
    id,
    when,
    loop,
    effects,
    callback,
    duration,
    pitchShift,
    playbackRate
  ) {
    // const tonePlayer = new Tone.Player({url: audioBuffer});
    // console.log(tonePlayer);
    // const source = new PitchShifter(audioContext, audioBuffer);
    // source.tempo = playbackRate;
    // console.log(source);

    // let currentNode = source;

    let source, currentNode;
    if (window.noGrain) {
      // eslint-disable-next-line no-undef
      source = new Tone.Player({
        url: audioBuffer,
      });

      const compensation = -12 * Math.log2(playbackRate);
      // eslint-disable-next-line no-undef
      const pitchShiftNode = new Tone.PitchShift(compensation + pitchShift);
      source.connect(pitchShiftNode);
      currentNode = pitchShiftNode;
    } else {
      // eslint-disable-next-line no-undef
      source = new Tone.GrainPlayer({
        url: audioBuffer,
        grainSize: playbackRate * 0.1,
      });
      source.detune = pitchShift * 100;
      currentNode = source;
    }
    source.playbackRate = playbackRate;
    console.log(source);

    if (duration) {
      // If playing for a specific duration, apply a small fadeout to the sound
      // to prevent clicks and pops
      const gainNode = audioContext.createGain();
      const releaseDuration = this.releaseTimeSeconds;
      gainNode.gain.setTargetAtTime(
        0,
        when + duration - releaseDuration,
        RELEASE_TIME_CONSTANT
      );
      source.connect(gainNode);
      currentNode = gainNode;
    }

    if (effects) {
      // Insert sound effects, which will connect to the o\utput.
      soundEffects.insertEffects(effects, currentNode);
    } else {
      // No sound effects, so we will connect directly to the output.
      // currentNode.connect(audioContext.destination);
      currentNode.toDestination();
    }
    source.onended = callback.bind(this, id);

    source.loop = loop;

    source.start(`+${when - audioContext.currentTime}`, 0, duration); // play the source now

    if (['suspended', 'interrupted'].includes(source.context.state)) {
      source.context.resume();
    }

    return source;
  }

  StopSoundBySource(source) {
    // todo: investigate whether this condition is needed/useful
    // across browsers.
    //if (source.context.state === 'running') {
    source.stop();
    source.dispose();
    //}
  }
}

export default AudioSystem;
