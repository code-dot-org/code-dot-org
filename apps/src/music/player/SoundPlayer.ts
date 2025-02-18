import {Effects} from './interfaces/Effects';
import AudioSystem from './soundSub';

interface SoundPlayerOptions {
  delayTimeSeconds: number; // Delay time used in the delay effect
  releaseTimeSeconds: number; // Release time for fading out fixed-duration sounds
}

type ActiveSoundSource = {
  source: AudioBufferSourceNode;
  id: number;
};

/**
 * Handles sound playback of {@link AudioBuffer}s using the Web Audio API
 * (wrapped by {@link AudioSystem}).
 */
class SoundPlayer {
  private readonly audioSystem: AudioSystem;
  private readonly tagGroups: {
    [tag: string]: {sources: ActiveSoundSource[]};
  };
  private audioIdUpto;

  constructor() {
    this.audioSystem = new AudioSystem();
    this.tagGroups = {};
    this.audioIdUpto = 0;
  }

  updateConfiguration(options: SoundPlayerOptions) {
    this.audioSystem.updateConfiguration(options);
  }

  getCurrentAudioTime() {
    return this.audioSystem.getCurrentTime();
  }

  startPlayback() {
    this.audioSystem.StartPlayback();
  }

  playSound(
    audioBuffer: AudioBuffer,
    groupTag: string,
    when = 0,
    onStop: () => void = () => undefined,
    loop = false,
    effects: Effects | undefined = undefined,
    duration: number | undefined = undefined
  ) {
    // Set up a tag group if we don't have one already.
    if (!this.tagGroups[groupTag]) {
      this.tagGroups[groupTag] = {
        sources: [],
      };
    }

    const tagGroup = this.tagGroups[groupTag];

    const source = this.audioSystem.PlaySoundByBuffer(
      audioBuffer,
      this.audioIdUpto,
      when,
      loop,
      effects,
      (id: number) => {
        // callback received when sound ends
        // we've recorded this source (in case we needed to stop it prematurely),
        // so now we can release the handle.
        this.removeStoppedBuffer(groupTag, id);
        if (onStop) {
          onStop();
        }
      },
      duration
    );

    tagGroup.sources.push({source: source, id: this.audioIdUpto});
    return this.audioIdUpto++;
  }

  removeStoppedBuffer(groupTag: string, soundSourceId: number) {
    const sources = this.tagGroups[groupTag].sources;

    for (let s = sources.length - 1; s >= 0; s--) {
      const source = sources[s];

      if (source.id === soundSourceId) {
        sources.splice(s, 1);
      }
    }
  }

  stopSound(groupTag: string) {
    if (!this.tagGroups[groupTag]) {
      return;
    }

    const sources = this.tagGroups[groupTag].sources;

    for (let b = 0; b < sources.length; b++) {
      const source = sources[b].source;
      this.audioSystem.StopSoundBySource(source);
    }
  }

  stopSoundByUniqueId(groupTag: string, uniqueId: number) {
    const sources = this.tagGroups[groupTag].sources;
    const source = sources.find(source => source.id === uniqueId)?.source;
    if (source) {
      this.audioSystem.StopSoundBySource(source);
    }
  }
}

export default SoundPlayer;
