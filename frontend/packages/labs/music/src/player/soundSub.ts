import {LabRegistry} from '@code-dot-org/lab';

import type {Effects} from './interfaces/Effects';
import SoundEffects from './soundEffects';

const DEFAULT_DELAY_TIME = 60 / 120 / 2;

// Time constant used to compute the release rate; at each time constant
// interval the sound will decay exponentially.
const RELEASE_TIME_CONSTANT = 0.075;

function createAudioContext(desiredSampleRate?: number): AudioContext {
  // Create an audio context
  const AudioContext = window.AudioContext;

  desiredSampleRate =
    typeof desiredSampleRate === 'number' ? desiredSampleRate : 44100;
  let context = new AudioContext();

  // Check if hack is necessary. Only occurs in iOS6+ devices
  // and only when you first boot the iPhone, or play a audio/video
  // with a different sample rate
  if (
    /(iPhone|iPad)/i.test(navigator.userAgent) &&
    context.sampleRate !== desiredSampleRate
  ) {
    const buffer = context.createBuffer(1, 1, desiredSampleRate);
    const dummy = context.createBufferSource();
    dummy.buffer = buffer;
    dummy.connect(context.destination);
    dummy.start(0);
    dummy.disconnect();

    context.close(); // dispose old context
    context = new AudioContext();
  }

  return context;
}

class AudioSystem {
  static audioContext?: AudioContext;
  static soundEffects?: SoundEffects;

  releaseTimeSeconds: number = 0;

  constructor() {
    try {
      AudioSystem.audioContext = createAudioContext(48000);
    } catch (e) {
      if (e instanceof Error) {
        LabRegistry.metricsReporter.logError(
          'Web Audio API is not supported in this browser',
          e,
        );
      }
      throw e;
    }

    AudioSystem.soundEffects = new SoundEffects(
      AudioSystem.audioContext,
      DEFAULT_DELAY_TIME,
    );
  }

  /**
   * @param {*} options Audio system configuration.
   *   {
   *     delayTimeSeconds: number, // Delay time used in the delay effect
   *     releaseTimeSeconds: number // Release time for fading out fixed-duration sounds
   *   }
   */
  updateConfiguration(options: {
    delayTimeSeconds: number;
    releaseTimeSeconds: number;
  }) {
    if (AudioSystem.audioContext) {
      const {delayTimeSeconds, releaseTimeSeconds} = options;
      AudioSystem.soundEffects = new SoundEffects(
        AudioSystem.audioContext,
        delayTimeSeconds,
      );
      this.releaseTimeSeconds = releaseTimeSeconds;
    }
  }

  getCurrentTime() {
    if (AudioSystem.audioContext) {
      return AudioSystem.audioContext.currentTime;
    } else {
      return null;
    }
  }

  StartPlayback() {
    if (AudioSystem.audioContext) {
      if (
        ['suspended', 'interrupted'].includes(AudioSystem.audioContext.state)
      ) {
        AudioSystem.audioContext.resume();
      }
    }
  }

  PlaySoundByBuffer(
    audioBuffer: AudioBuffer,
    id: number,
    when: number,
    loop: boolean,
    effects: Effects | undefined,
    callback: (id: number) => void,
    duration?: number,
  ): AudioBufferSourceNode | undefined {
    if (!AudioSystem.audioContext) {
      return;
    }

    const source: AudioBufferSourceNode =
      AudioSystem.audioContext.createBufferSource(); // creates a sound source
    source.buffer = audioBuffer; // tell the source which sound to play
    let currentNode: AudioNode = source;

    if (duration) {
      // If playing for a specific duration, apply a small fadeout to the sound
      // to prevent clicks and pops
      const gainNode = AudioSystem.audioContext.createGain();
      const releaseDuration = this.releaseTimeSeconds;
      gainNode.gain.setTargetAtTime(
        0,
        when + duration - releaseDuration,
        RELEASE_TIME_CONSTANT,
      );
      source.connect(gainNode);
      currentNode = gainNode;
    }

    if (effects) {
      // Insert sound effects, which will connect to the output.
      AudioSystem.soundEffects?.insertEffects(effects, currentNode);
    } else {
      // No sound effects, so we will connect directly to the output.
      currentNode.connect(AudioSystem.audioContext.destination);
    }

    source.onended = callback.bind(this, id);
    source.loop = loop;
    source.start(when, 0, duration); // play the source now

    if (['suspended', 'interrupted'].includes(AudioSystem.audioContext.state)) {
      AudioSystem.audioContext.resume();
    }

    return source;
  }

  StopSoundBySource(source: AudioBufferSourceNode) {
    // todo: investigate whether this condition is needed/useful
    // across browsers.
    //if (source.context.state === 'running') {
    source.stop();
    //}
  }
}

export default AudioSystem;
