// Tone builds its audio context at import, so the module is replaced
// whole: fakes that record what the synth asks of them.
jest.mock('tone', () => {
  type Fn = jest.Mock;
  const param = () => {
    const p: {value: number; [method: string]: unknown} = {value: 0};
    [
      'setValueAtTime',
      'linearRampToValueAtTime',
      'exponentialRampToValueAtTime',
      'cancelScheduledValues',
    ].forEach(method => (p[method] = jest.fn(() => p)));
    return p;
  };
  class Node {
    context = {isOffline: false};
    connect: Fn = jest.fn(() => this);
    chain: Fn = jest.fn(() => this);
    toDestination: Fn = jest.fn(() => this);
    dispose: Fn = jest.fn();
  }
  const made = {
    tones: [] as MonoSynth[],
    noises: [] as NoiseSynth[],
    filters: [] as Filter[],
    gains: [] as Gain[],
    lfos: [] as LFO[],
    compressors: [] as Compressor[],
    synths: [] as Synth[],
    plucks: [] as PluckSynth[],
  };
  class Synth extends Node {
    frequency = param();
    detune = param();
    envelope = {decay: 0, cancel: jest.fn()};
    modulationEnvelope = {decay: 0};
    triggerAttackRelease: Fn = jest.fn(() => this);
    triggerRelease: Fn = jest.fn(() => this);
    constructor(public options: object) {
      super();
      made.synths.push(this);
    }
  }
  class MembraneSynth extends Synth {}
  class FMSynth extends Synth {}
  class MetalSynth extends Synth {}
  class MonoSynth extends Node {
    frequency = param();
    detune = param();
    envelope = {decay: 0, cancel: jest.fn()};
    filterEnvelope = {decay: 0, baseFrequency: 0, octaves: 0};
    triggerAttackRelease: Fn = jest.fn(() => this);
    triggerRelease: Fn = jest.fn(() => this);
    constructor(
      public options: {
        oscillator: {type: string; count?: number; spread?: number};
      }
    ) {
      super();
      made.tones.push(this);
    }
  }
  class NoiseSynth extends Node {
    envelope = {decay: 0, cancel: jest.fn()};
    triggerAttackRelease: Fn = jest.fn(() => this);
    triggerRelease: Fn = jest.fn(() => this);
    constructor(public options: object) {
      super();
      made.noises.push(this);
    }
  }
  class Filter extends Node {
    type: string;
    frequency = param();
    detune = param();
    Q = param();
    constructor(options: {type: string; frequency: number; Q?: number}) {
      super();
      this.type = options.type;
      this.frequency.value = options.frequency;
      this.Q.value = options.Q ?? 1;
      made.filters.push(this);
    }
  }
  class Gain extends Node {
    gain = param();
    constructor(value: number) {
      super();
      this.gain.value = value;
      made.gains.push(this);
    }
  }
  class LFO extends Node {
    frequency = param();
    amplitude = param();
    min: number;
    max: number;
    start: Fn = jest.fn(() => this);
    stop: Fn = jest.fn(() => this);
    constructor(options: {frequency: number; min: number; max: number}) {
      super();
      this.frequency.value = options.frequency;
      this.min = options.min;
      this.max = options.max;
      made.lfos.push(this);
    }
  }
  class Compressor extends Node {
    constructor(public options: object) {
      super();
      made.compressors.push(this);
    }
  }
  class PluckSynth extends Node {
    release = 0;
    triggerAttack: Fn = jest.fn(() => this);
    constructor(public options: object) {
      super();
      made.plucks.push(this);
    }
  }
  // Fresh per test: the module keeps its bus and instruments per context.
  const makeContext = () => ({
    state: 'running',
    immediate: () => 10,
    setTimeout: jest.fn(),
  });
  let context = makeContext();
  // Like a browser, the state changes only when the promise settles.
  const start = jest.fn(() =>
    Promise.resolve().then(() => {
      context.state = 'running';
    })
  );
  return {
    MonoSynth,
    NoiseSynth,
    Filter,
    Gain,
    LFO,
    Compressor,
    MembraneSynth,
    FMSynth,
    MetalSynth,
    PluckSynth,
    getContext: () => context,
    start,
    __made: made,
    get __context() {
      return context;
    },
    __resetContext: () => {
      context = makeContext();
    },
  };
});

import * as tone from 'tone';

import {
  asSoundEffect,
  LENGTHS,
  Note,
  notesFor,
  PATTERNS,
  PITCHES,
  playNotes,
  playPreset,
  playSoundEffect,
  PRESETS,
  SoundEffect,
  stopSoundEffects,
  WAVES,
} from '@cdo/apps/p5lab/spritelab/lab2/soundEffects';

const jump: SoundEffect = {
  wave: 'square',
  pitch: 'high',
  length: 'short',
  pattern: 'slide up',
};

function endOf(notes: Note[]): number {
  return Math.max(...notes.map(note => note.at + note.seconds));
}

describe('asSoundEffect', () => {
  it('accepts the four lists and nothing else', () => {
    expect(asSoundEffect('sine', 'low', 'short', 'steady')).toEqual({
      wave: 'sine',
      pitch: 'low',
      length: 'short',
      pattern: 'steady',
    });
    expect(asSoundEffect('organ', 'low', 'short', 'steady')).toBeNull();
    expect(asSoundEffect('sine', 'low', 'short', undefined)).toBeNull();
    expect(asSoundEffect('sine', 'low', 1, 'steady')).toBeNull();
  });
});

describe('notesFor', () => {
  it('builds notes for every combination', () => {
    for (const wave of WAVES) {
      for (const pitch of PITCHES) {
        for (const length of LENGTHS) {
          for (const pattern of PATTERNS) {
            const notes = notesFor({wave, pitch, length, pattern});
            expect(notes.length).toBeGreaterThan(0);
            notes.forEach(note => {
              expect(note.type).toBe(wave === 'double' ? 'sawtooth' : wave);
              expect(note.hz).toBeGreaterThan(0);
              expect(note.seconds).toBeGreaterThan(0);
              expect(note.volume).toBeGreaterThan(0);
              expect(note.volume).toBeLessThanOrEqual(1);
            });
          }
        }
      }
    }
  });

  it('plays a steady effect as one note of its length', () => {
    const short = notesFor({...jump, pattern: 'steady'});
    const long = notesFor({...jump, pattern: 'steady', length: 'long'});
    expect(short).toHaveLength(1);
    expect(short[0].slideTo).toBeUndefined();
    expect(short[0].wobble).toBeUndefined();
    expect(endOf(long)).toBeGreaterThan(endOf(short) * 4);
  });

  it('slides an octave up or down', () => {
    const [up] = notesFor(jump);
    const [down] = notesFor({...jump, pattern: 'slide down'});
    expect(up.slideTo).toBe(up.hz * 2);
    expect(down.slideTo).toBe(down.hz / 2);
  });

  it('wobbles one note', () => {
    const notes = notesFor({...jump, pattern: 'wobble'});
    expect(notes).toHaveLength(1);
    expect(notes[0].wobble).toBe(true);
  });

  it('plays the double wave as two sawtooths in unison', () => {
    const [note] = notesFor({...jump, wave: 'double'});
    expect(note.type).toBe('sawtooth');
    expect(note.unison).toBe(2);
    expect(notesFor({...jump, wave: 'sawtooth'})[0].unison).toBeUndefined();
  });

  it('cycles a chord on one note, major or minor', () => {
    const major = notesFor({...jump, pattern: 'chord'});
    const minor = notesFor({...jump, pattern: 'minor chord'});
    expect(major).toHaveLength(1);
    expect(major[0].arpeggio).toEqual([1, 5 / 4, 3 / 2]);
    expect(minor[0].arpeggio).toEqual([1, 6 / 5, 3 / 2]);
  });

  it('runs up from the root and down from the octave', () => {
    const up = notesFor({...jump, pattern: 'run up', length: 'medium'});
    const down = notesFor({...jump, pattern: 'run down', length: 'medium'});
    const root = notesFor({...jump, pattern: 'steady'})[0].hz;
    expect(up).toHaveLength(3);
    expect(up[0].hz).toBe(root);
    expect(down[0].hz).toBe(root * 2);
    const rising = (notes: Note[]) =>
      notes.every((note, i) => i === 0 || note.hz > notes[i - 1].hz);
    expect(rising(up)).toBe(true);
    expect(rising([...down].reverse())).toBe(true);
    expect(up.map(note => note.at)).toEqual(down.map(note => note.at));
  });

  it('gives a longer run more notes', () => {
    expect(
      notesFor({...jump, pattern: 'run up', length: 'short'})
    ).toHaveLength(2);
    expect(notesFor({...jump, pattern: 'run up', length: 'long'})).toHaveLength(
      4
    );
  });

  it('pitches high above middle above low', () => {
    const hz = (pitch: SoundEffect['pitch']) =>
      notesFor({...jump, pattern: 'steady', pitch})[0].hz;
    expect(hz('low')).toBeLessThan(hz('middle'));
    expect(hz('middle')).toBeLessThan(hz('high'));
  });
});

describe('PRESETS', () => {
  it('are playable note lists', () => {
    Object.values(PRESETS).forEach(notes => {
      expect(notes.length).toBeGreaterThan(0);
      notes.forEach(note => {
        expect(note.hz).toBeGreaterThan(0);
        expect(note.seconds).toBeGreaterThan(0);
        expect(note.volume).toBeGreaterThan(0);
        expect(typeof note.type).toBe('string');
      });
    });
  });

  it('builds the game sounds from the block parameters', () => {
    expect(PRESETS.jump).toEqual(notesFor(jump));
  });
});

describe('playNotes', () => {
  interface Param {
    value: number;
    setValueAtTime: jest.Mock;
    linearRampToValueAtTime: jest.Mock;
    exponentialRampToValueAtTime: jest.Mock;
    cancelScheduledValues: jest.Mock;
  }
  interface Struck {
    frequency: Param;
    detune: Param;
    envelope: {decay: number; cancel: jest.Mock};
    triggerAttackRelease: jest.Mock;
    triggerRelease: jest.Mock;
    dispose: jest.Mock;
  }
  interface FakeTone extends Struck {
    options: {oscillator: {type: string; count?: number; spread?: number}};
    filterEnvelope: {decay: number; baseFrequency: number; octaves: number};
  }
  interface FakeLfo {
    frequency: Param;
    amplitude: Param;
    min: number;
    max: number;
    connect: jest.Mock;
    start: jest.Mock;
    stop: jest.Mock;
    dispose: jest.Mock;
  }
  const fake = tone as unknown as {
    __made: {
      tones: FakeTone[];
      noises: Struck[];
      filters: {type: string; frequency: Param}[];
      gains: {gain: Param}[];
      lfos: FakeLfo[];
      compressors: object[];
      synths: (Struck & {constructor: {name: string}})[];
      plucks: {release: number; triggerAttack: jest.Mock; dispose: jest.Mock}[];
    };
    __context: {state: string; setTimeout: jest.Mock};
    __resetContext: () => void;
  };
  const made = fake.__made;
  // Each play is nudged up to 2% in pitch.
  const near = (value: number, hz: number) =>
    Math.abs(value - hz) / hz <= 0.021;
  const rampTarget = (p: Param) =>
    p.exponentialRampToValueAtTime.mock.calls.at(-1)?.[0] as number;
  const rampTime = (p: Param) =>
    p.exponentialRampToValueAtTime.mock.calls.at(-1)?.[1] as number;
  /** Every strike of the pooled tones, in order: [hz, seconds, at, volume]. */
  const strikes = () =>
    made.tones
      .flatMap(synth =>
        synth.triggerAttackRelease.mock.calls.map(
          call => [...call, synth] as [number, number, number, number, FakeTone]
        )
      )
      .sort((a, b) => a[2] - b[2]);

  beforeEach(() => {
    Object.values(made).forEach(list => (list.length = 0));
    fake.__resetContext();
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    stopSoundEffects();
  });

  it('strikes one pooled tone per note from the context time', () => {
    const notes = notesFor({...jump, pattern: 'run up', length: 'long'});
    playNotes(notes);
    expect(made.tones).toHaveLength(4);
    strikes().forEach(([hz, seconds, at], i) => {
      expect(near(hz, notes[i].hz)).toBe(true);
      expect(seconds).toBe(notes[i].seconds);
      expect(at).toBe(10 + notes[i].at);
    });
  });

  it('keeps four tones per wave and strikes them in turn', () => {
    for (let i = 0; i < 6; i++) {
      playSoundEffect({...jump, pattern: 'steady'});
    }
    expect(made.tones).toHaveLength(4);
    expect(made.tones[0].triggerAttackRelease).toHaveBeenCalledTimes(2);
    expect(made.tones[0].options.oscillator.type).toBe('square');
    made.tones.forEach(synth => expect(synth.dispose).not.toHaveBeenCalled());
  });

  it('ramps a slide to its target frequency', () => {
    playSoundEffect(jump);
    const [synth] = made.tones;
    const [note] = notesFor(jump);
    expect(near(rampTarget(synth.frequency), note.slideTo!)).toBe(true);
    expect(rampTime(synth.frequency)).toBe(10 + note.seconds);
  });

  it('keeps a run in tune with itself under the pitch nudge', () => {
    const notes = notesFor({...jump, pattern: 'run up', length: 'long'});
    playNotes(notes);
    const ratios = strikes().map(([hz], i) => hz / notes[i].hz);
    ratios.forEach(ratio => expect(ratio).toBeCloseTo(ratios[0], 6));
    expect(near(strikes()[0][0], notes[0].hz)).toBe(true);
  });

  it('opens the filter above the note and closes it toward a slide end', () => {
    playSoundEffect(jump);
    const [note] = notesFor(jump);
    const {filterEnvelope} = made.tones[0];
    expect(filterEnvelope.baseFrequency).toBeGreaterThan(note.slideTo! * 1.4);
    expect(filterEnvelope.octaves).toBeGreaterThan(0);
    expect(filterEnvelope.decay).toBe(note.seconds);
    playSoundEffect({...jump, pattern: 'steady'});
    expect(made.tones[1].filterEnvelope.baseFrequency).toBeGreaterThan(
      note.hz * 0.9
    );
  });

  it('builds the bus once', () => {
    playSoundEffect({...jump, pattern: 'steady'});
    playSoundEffect({...jump, pattern: 'steady'});
    expect(made.compressors).toHaveLength(1);
  });

  it('drives a wobble from an LFO on the detune, a semitone each way', () => {
    playSoundEffect({...jump, pattern: 'wobble'});
    expect(made.tones).toHaveLength(1);
    expect(made.lfos).toHaveLength(1);
    const [lfo] = made.lfos;
    expect(lfo.connect).toHaveBeenCalledWith(made.tones[0].detune);
    expect(lfo.min).toBe(-100);
    expect(lfo.max).toBe(100);
    expect(lfo.start).toHaveBeenCalled();
    expect(lfo.stop).toHaveBeenCalled();
  });

  it('steps an arpeggio through its ratios fifty times a second', () => {
    playSoundEffect({...jump, pattern: 'chord', length: 'short'});
    const steps = made.tones[0].frequency.setValueAtTime.mock.calls;
    // 0.12 s at 50 Hz: six steps, cycling root, third, fifth.
    expect(steps).toHaveLength(6);
    const hz = steps[0][0] as number;
    expect(near(steps[1][0] as number, hz * 1.25)).toBe(true);
    expect(near(steps[2][0] as number, hz * 1.5)).toBe(true);
    expect(near(steps[3][0] as number, hz)).toBe(true);
    expect(steps[1][1] - steps[0][1]).toBeCloseTo(0.02, 5);
  });

  it('plays the double wave on a fat sawtooth', () => {
    playSoundEffect({...jump, wave: 'double', pattern: 'steady'});
    expect(made.tones).toHaveLength(1);
    expect(made.tones[0].options.oscillator).toEqual({
      type: 'fatsawtooth',
      count: 2,
      spread: 16,
    });
  });

  it('counts unison voices against the voice cap', () => {
    const unison = (n: number) =>
      playNotes([
        {hz: 440, at: 0, seconds: 1, type: 'sawtooth', volume: 0.1, unison: n},
      ]);
    for (let i = 0; i < 10; i++) {
      unison(3);
    }
    expect(strikes()).toHaveLength(10);
    unison(3);
    expect(strikes()).toHaveLength(10);
    unison(2);
    expect(strikes()).toHaveLength(11);
  });

  it('deepens a wobble from nothing as the note settles', () => {
    playSoundEffect({...jump, pattern: 'wobble', length: 'long'});
    const [lfo] = made.lfos;
    expect(lfo.amplitude.setValueAtTime).toHaveBeenCalledWith(0, 10);
    const [, rampEnd] = lfo.amplitude.linearRampToValueAtTime.mock.calls[0];
    expect(rampEnd - 10).toBeCloseTo(0.12, 5);
  });

  it('plays noise through a bandpass filter at the note pitch', () => {
    const [note] = notesFor({...jump, wave: 'noise', pattern: 'slide down'});
    playNotes([note]);
    expect(made.tones).toHaveLength(0);
    expect(made.noises).toHaveLength(1);
    const [seconds, at, volume] =
      made.noises[0].triggerAttackRelease.mock.calls[0];
    expect(seconds).toBe(note.seconds);
    expect(at).toBe(10);
    expect(volume).toBe(note.volume);
    const band = made.filters.find(f => f.type === 'bandpass')!;
    const set = band.frequency.setValueAtTime.mock.calls.at(-1)![0] as number;
    expect(near(set, note.hz)).toBe(true);
    expect(near(rampTarget(band.frequency), note.slideTo!)).toBe(true);
    expect(rampTime(band.frequency)).toBe(10 + note.seconds);
  });

  it('plays a UI cue at exactly its pitch, never nudged', () => {
    for (let i = 0; i < 5; i++) {
      playPreset('pick');
    }
    expect(strikes().every(([hz]) => hz === 740)).toBe(true);
  });

  it('plays a preset', () => {
    playPreset('reveal');
    expect(strikes()).toHaveLength(PRESETS.reveal.length);
  });

  it('cuts every live voice, the notes not yet started included', () => {
    playPreset('reveal');
    stopSoundEffects();
    made.tones.forEach(synth => {
      expect(synth.envelope.cancel).toHaveBeenCalledWith(10);
      expect(synth.triggerRelease).toHaveBeenCalledWith(10);
      expect(synth.dispose).not.toHaveBeenCalled();
    });
    playSoundEffect({...jump, wave: 'pluck', pattern: 'steady'});
    stopSoundEffects();
    const gain = made.gains.at(-1)!.gain;
    expect(gain.cancelScheduledValues).toHaveBeenCalledWith(10);
    expect(gain.setValueAtTime).toHaveBeenLastCalledWith(0, 10);
  });

  it('ends a wobble when its instrument is struck again, or on stop', () => {
    playSoundEffect({...jump, pattern: 'wobble', length: 'long'});
    for (let i = 0; i < 3; i++) {
      playSoundEffect({...jump, pattern: 'steady'});
    }
    expect(made.lfos[0].dispose).not.toHaveBeenCalled();
    playSoundEffect({...jump, pattern: 'steady'});
    expect(made.lfos[0].dispose).toHaveBeenCalledTimes(1);
    playSoundEffect({...jump, pattern: 'wobble'});
    stopSoundEffects();
    expect(made.lfos[1].dispose).toHaveBeenCalledTimes(1);
  });

  it('strikes the longest-idle instrument, not the next in line', () => {
    const notes = notesFor({...jump, pattern: 'run up', length: 'long'});
    // The run's later notes are still ahead; a sound now takes the first.
    playNotes(notes);
    playSoundEffect({...jump, pattern: 'steady'});
    expect(made.tones).toHaveLength(4);
    expect(made.tones[0].triggerAttackRelease).toHaveBeenCalledTimes(2);
    expect(made.tones[1].triggerAttackRelease).toHaveBeenCalledTimes(1);
  });

  it('never strikes a pooled instrument twice at one instant', () => {
    for (let i = 0; i < 5; i++) {
      playSoundEffect({...jump, wave: 'drum', pattern: 'steady'});
    }
    // The fifth strike lands on the first instrument, a millisecond on.
    const starts = made.synths[0].triggerAttackRelease.mock.calls.map(
      call => call[2]
    );
    expect(starts[0]).toBe(10);
    expect(starts[1]).toBeCloseTo(10.001, 6);
  });

  it("frees a voice's place after its release", () => {
    playSoundEffect({...jump, wave: 'drum', pattern: 'steady'});
    const [onEnd, wait] = fake.__context.setTimeout.mock.calls[0];
    const [note] = notesFor({...jump, wave: 'drum', pattern: 'steady'});
    expect(wait).toBeCloseTo(note.seconds + 0.1, 5);
    // Thirty-one more fill the cap; the freed place admits one more.
    for (let i = 0; i < 31; i++) {
      playPreset('pick');
    }
    expect(strikes()).toHaveLength(31);
    playPreset('pick');
    expect(strikes()).toHaveLength(31);
    onEnd();
    playPreset('pick');
    expect(strikes()).toHaveLength(32);
  });

  it('holds a sound while the context is suspended and plays the latest once it runs', async () => {
    fake.__context.state = 'suspended';
    playSoundEffect({...jump, pattern: 'steady'});
    playSoundEffect({...jump, pattern: 'steady', pitch: 'low'});
    expect(strikes()).toHaveLength(0);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(strikes()).toHaveLength(1);
    expect(
      near(
        strikes()[0][0],
        notesFor({...jump, pattern: 'steady', pitch: 'low'})[0].hz
      )
    ).toBe(true);
  });

  it('drops a sound once too many voices are live', () => {
    for (let i = 0; i < 40; i++) {
      playPreset('pick');
    }
    expect(strikes().length).toBeLessThanOrEqual(32);
  });

  it('strikes an instrument for a drum, a bell or a clang, at the note volume', () => {
    const struck = (wave: SoundEffect['wave']) => {
      made.synths.length = 0;
      playSoundEffect({...jump, wave, pattern: 'steady'});
      return made.synths[0];
    };
    expect(struck('drum').constructor.name).toBe('MembraneSynth');
    expect(struck('bell').constructor.name).toBe('FMSynth');
    expect(struck('clang').constructor.name).toBe('MetalSynth');
    expect(made.tones).toHaveLength(0);
    const [note] = notesFor({...jump, wave: 'clang', pattern: 'steady'});
    const [hz, seconds, at, velocity] =
      made.synths[0].triggerAttackRelease.mock.calls[0];
    expect(near(hz, note.hz)).toBe(true);
    expect(seconds).toBe(note.seconds);
    expect(at).toBe(10);
    expect(velocity).toBe(note.volume);
  });

  it('slides an instrument like a tone', () => {
    playSoundEffect({...jump, wave: 'bell'});
    const [note] = notesFor({...jump, wave: 'bell'});
    const [synth] = made.synths;
    expect(near(rampTarget(synth.frequency), note.slideTo!)).toBe(true);
  });

  it('plucks one string, or a strummed chord, and never bends it', () => {
    const [note] = notesFor({...jump, wave: 'pluck', pattern: 'slide up'});
    playNotes([note]);
    expect(made.plucks).toHaveLength(1);
    expect(made.synths).toHaveLength(0);
    const [[hz, at]] = made.plucks[0].triggerAttack.mock.calls;
    expect(near(hz, note.hz)).toBe(true);
    expect(at).toBe(10);
    expect(made.plucks[0].release).toBe(note.seconds);
    playSoundEffect({...jump, wave: 'pluck', pattern: 'chord'});
    // The chord takes the next three strings of the four kept.
    expect(made.plucks).toHaveLength(4);
    const struck = made.plucks
      .slice(1)
      .map(p => p.triggerAttack.mock.calls[0][0]);
    expect(near(struck[1], struck[0] * 1.25)).toBe(true);
    expect(near(struck[2], struck[0] * 1.5)).toBe(true);
  });

  it('plays nothing with ?quiet on the URL', () => {
    window.history.replaceState({}, '', '/?quiet');
    playSoundEffect(jump);
    expect(strikes()).toHaveLength(0);
  });
});
