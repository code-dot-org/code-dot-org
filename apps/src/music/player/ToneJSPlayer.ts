import SoundCache from './SoundCache';

const DEFAULT_BPM = 120;

export interface Sound {
  sampleId: string;
  transportTime: string;
  originalBpm: number;
  pitchShift: number;
}

export interface SamplerSequence {
  instrument: string;
  events: {notes: string[]; transportTime: string}[];
}

class ToneJSPlayer {
  private samplers: {[instrument: string]: typeof Tone.Sampler};
  private activePlayers: (typeof Tone.GrainPlayer)[];

  constructor(
    bpm = DEFAULT_BPM,
    private readonly soundCache: SoundCache = new SoundCache()
  ) {
    Tone.Transport.bpm.value = bpm;
    this.activePlayers = [];
    this.samplers = [];
  }

  getCurrentPosition(): string {
    return Tone.Transport.position;
  }

  loadSounds(sampleIds: string[]) {
    this.soundCache.loadSounds(sampleIds);
  }

  async loadInstrument(
    instrumentName: string,
    sampleMap: {[note: number]: string}
  ) {
    const urls: {[note: number]: AudioBuffer} = {};
    await this.soundCache.loadSounds(Object.values(sampleMap));
    Object.keys(sampleMap).forEach(note => {
      const buffer = this.soundCache.getSound(sampleMap[parseInt(note)]);
      if (buffer) {
        urls[parseInt(note)] = buffer;
      }
    });

    const sampler = new Tone.Sampler(urls).toDestination();
    this.samplers[instrumentName] = sampler;
  }

  setBpm(bpm: number) {
    Tone.Transport.bpm.value = bpm;
  }

  scheduleSound(sound: Sound) {
    const buffer = this.soundCache.getSound(sound.sampleId);
    if (!buffer) {
      console.log('not in cache');
      return;
    }

    const playbackRate = Tone.Transport.bpm.value / sound.originalBpm;

    const player = new Tone.GrainPlayer({
      url: buffer,
      grainSize: playbackRate * 0.1,
    }).toDestination();

    player.detune = sound.pitchShift * 100;
    player.playbackRate = playbackRate;
    player.sync().start(sound.transportTime);

    this.activePlayers.push(player);
  }

  scheduleSamplerSequence({instrument, events}: SamplerSequence) {
    events.forEach(({notes, transportTime}) => {
      this.samplers[instrument].sync().triggerAttack(notes, transportTime);
    });
  }

  start(startTime?: string) {
    Tone.Transport.start(undefined, startTime);
  }

  pause() {
    Tone.Transport.pause();
  }

  stop() {
    Tone.Transport.stop();
    this.activePlayers.forEach(player => player.dispose());
    this.activePlayers = [];
    Object.values(this.samplers).forEach(sampler =>
      sampler.releaseAll().unsync()
    );
  }
}

export default ToneJSPlayer;
