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
    connect: Fn = jest.fn(() => this);
    chain: Fn = jest.fn(() => this);
    toDestination: Fn = jest.fn(() => this);
    dispose: Fn = jest.fn();
  }
  class Source extends Node {
    onstop: () => void = () => undefined;
    start: Fn = jest.fn(() => this);
    stop: Fn = jest.fn(() => this);
  }
  const made = {
    oscillators: [] as Oscillator[],
    noises: [] as Noise[],
    filters: [] as Filter[],
    gains: [] as Gain[],
    lfos: [] as LFO[],
    compressors: [] as Compressor[],
  };
  class Oscillator extends Source {
    type: string;
    frequency = param();
    count = 1;
    spread = 0;
    constructor(options: {type: string; frequency: number}) {
      super();
      this.type = options.type;
      this.frequency.value = options.frequency;
      made.oscillators.push(this);
    }
  }
  class FatOscillator extends Oscillator {
    constructor(options: {
      type: string;
      frequency: number;
      count: number;
      spread: number;
    }) {
      super(options);
      this.count = options.count;
      this.spread = options.spread;
    }
  }
  class Noise extends Source {
    type: string;
    constructor(options: {type: string}) {
      super();
      this.type = options.type;
      made.noises.push(this);
    }
  }
  class Filter extends Node {
    type: string;
    frequency = param();
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
  class LFO extends Source {
    frequency = param();
    amplitude = param();
    min: number;
    max: number;
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
  const context = {
    state: 'running',
    now: () => 10,
  };
  // Like a browser, the state changes only when the promise settles.
  const start = jest.fn(() =>
    Promise.resolve().then(() => {
      context.state = 'running';
    })
  );
  return {
    Oscillator,
    FatOscillator,
    Noise,
    Filter,
    Gain,
    LFO,
    Compressor,
    getContext: () => context,
    start,
    __made: made,
    __context: context,
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
              expect(note.volume).toBeLessThan(0.5);
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
  }
  interface FakeSource {
    type: string;
    frequency: Param;
    count: number;
    spread: number;
    start: jest.Mock;
    stop: jest.Mock;
    dispose: jest.Mock;
    onstop: () => void;
  }
  interface FakeLfo {
    frequency: Param;
    amplitude: Param;
    connect: jest.Mock;
    start: jest.Mock;
    stop: jest.Mock;
  }
  const fake = tone as unknown as {
    __made: {
      oscillators: FakeSource[];
      noises: FakeSource[];
      filters: {type: string; frequency: Param}[];
      gains: {gain: Param}[];
      lfos: FakeLfo[];
      compressors: object[];
    };
    __context: {state: string};
  };
  const made = fake.__made;
  // Each play is nudged up to 2% in pitch.
  const near = (value: number, hz: number) =>
    Math.abs(value - hz) / hz <= 0.021;
  const rampTarget = (p: Param) =>
    p.exponentialRampToValueAtTime.mock.calls.at(-1)?.[0] as number;
  const rampTime = (p: Param) =>
    p.exponentialRampToValueAtTime.mock.calls.at(-1)?.[1] as number;

  beforeEach(() => {
    Object.values(made).forEach(list => (list.length = 0));
    fake.__context.state = 'running';
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    stopSoundEffects();
  });

  it('schedules one voice per note from the context time', () => {
    const notes = notesFor({...jump, pattern: 'run up', length: 'long'});
    playNotes(notes);
    expect(made.oscillators).toHaveLength(4);
    made.oscillators.forEach((oscillator, i) => {
      expect(oscillator.start).toHaveBeenCalledWith(10 + notes[i].at);
      expect(oscillator.stop).toHaveBeenCalledWith(
        10 + notes[i].at + notes[i].seconds
      );
    });
  });

  it('ramps a slide to its target frequency', () => {
    playSoundEffect(jump);
    const [oscillator] = made.oscillators;
    const [note] = notesFor(jump);
    expect(near(rampTarget(oscillator.frequency), note.slideTo!)).toBe(true);
    expect(rampTime(oscillator.frequency)).toBe(10 + note.seconds);
  });

  it('keeps a run in tune with itself under the pitch nudge', () => {
    const notes = notesFor({...jump, pattern: 'run up', length: 'long'});
    playNotes(notes);
    const ratios = made.oscillators.map(
      (o, i) => o.frequency.value / notes[i].hz
    );
    ratios.forEach(ratio => expect(ratio).toBeCloseTo(ratios[0], 6));
    expect(near(made.oscillators[0].frequency.value, notes[0].hz)).toBe(true);
  });

  it('closes a slide-up filter toward the slide end, not the start', () => {
    playSoundEffect(jump);
    const [note] = notesFor(jump);
    const lowpass = made.filters.find(f => f.type === 'lowpass')!;
    expect(rampTarget(lowpass.frequency)).toBeGreaterThan(note.slideTo! * 1.4);
  });

  it('puts a closing low-pass filter and the shared compressor on each voice', () => {
    playSoundEffect({...jump, pattern: 'steady'});
    const lowpass = made.filters.filter(f => f.type === 'lowpass');
    expect(lowpass).toHaveLength(1);
    const [note] = notesFor({...jump, pattern: 'steady'});
    const opened = lowpass[0].frequency.setValueAtTime.mock.calls[0][0];
    expect(opened).toBeGreaterThan(rampTarget(lowpass[0].frequency));
    expect(rampTarget(lowpass[0].frequency)).toBeGreaterThan(note.hz * 0.9);
    // The bus lives with the module, so an earlier test may have made it;
    // this test never adds a second.
    const compressors = made.compressors.length;
    expect(compressors).toBeLessThanOrEqual(1);
    playSoundEffect({...jump, pattern: 'steady'});
    expect(made.compressors).toHaveLength(compressors);
  });

  it('drives a wobble from an LFO on the pitch', () => {
    playSoundEffect({...jump, pattern: 'wobble'});
    expect(made.oscillators).toHaveLength(1);
    expect(made.lfos).toHaveLength(1);
    const [lfo] = made.lfos;
    expect(lfo.connect).toHaveBeenCalledWith(made.oscillators[0].frequency);
    expect(lfo.start).toHaveBeenCalled();
    expect(lfo.stop).toHaveBeenCalled();
  });

  it('steps an arpeggio through its ratios fifty times a second', () => {
    playSoundEffect({...jump, pattern: 'chord', length: 'short'});
    const steps = made.oscillators[0].frequency.setValueAtTime.mock.calls;
    // 0.12 s at 50 Hz: six steps, cycling root, third, fifth.
    expect(steps).toHaveLength(6);
    const hz = steps[0][0] as number;
    expect(near(steps[1][0] as number, hz * 1.25)).toBe(true);
    expect(near(steps[2][0] as number, hz * 1.5)).toBe(true);
    expect(near(steps[3][0] as number, hz)).toBe(true);
    expect(steps[1][1] - steps[0][1]).toBeCloseTo(0.02, 5);
  });

  it('spreads a unison voice over a fat oscillator', () => {
    playNotes([
      {hz: 440, at: 0, seconds: 0.2, type: 'sawtooth', volume: 0.1, unison: 3},
    ]);
    expect(made.oscillators).toHaveLength(1);
    const [fat] = made.oscillators;
    expect(fat.count).toBe(3);
    expect(fat.spread).toBe(16);
    expect(near(fat.frequency.value, 440)).toBe(true);
  });

  it('counts unison oscillators against the voice cap', () => {
    const unison = (n: number) =>
      playNotes([
        {hz: 440, at: 0, seconds: 1, type: 'square', volume: 0.1, unison: n},
      ]);
    for (let i = 0; i < 10; i++) {
      unison(3);
    }
    expect(made.oscillators).toHaveLength(10);
    unison(3);
    expect(made.oscillators).toHaveLength(10);
    unison(2);
    expect(made.oscillators).toHaveLength(11);
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
    expect(made.oscillators).toHaveLength(0);
    expect(made.noises).toHaveLength(1);
    expect(made.noises[0].stop).toHaveBeenCalledWith(10 + note.seconds);
    const band = made.filters.find(f => f.type === 'bandpass')!;
    expect(near(band.frequency.value, note.hz)).toBe(true);
    expect(near(rampTarget(band.frequency), note.slideTo!)).toBe(true);
    expect(rampTime(band.frequency)).toBe(10 + note.seconds);
  });

  it('plays a UI cue at exactly its pitch, never nudged', () => {
    for (let i = 0; i < 5; i++) {
      playPreset('pick');
    }
    expect(made.oscillators.every(o => o.frequency.value === 740)).toBe(true);
  });

  it('plays a preset', () => {
    playPreset('reveal');
    expect(made.oscillators).toHaveLength(PRESETS.reveal.length);
  });

  it('stops every live voice and lets its nodes go', () => {
    playPreset('reveal');
    stopSoundEffects();
    made.oscillators.forEach(oscillator => {
      expect(oscillator.stop).toHaveBeenCalledTimes(2);
      expect(oscillator.dispose).toHaveBeenCalled();
    });
    made.gains.forEach(gain => {
      expect(
        (gain as unknown as {dispose: jest.Mock}).dispose
      ).toHaveBeenCalled();
    });
  });

  it('forgets a voice once it has ended', () => {
    playSoundEffect(jump);
    const [oscillator] = made.oscillators;
    oscillator.onstop();
    expect(oscillator.dispose).toHaveBeenCalled();
    stopSoundEffects();
    expect(oscillator.stop).toHaveBeenCalledTimes(1);
  });

  it('holds a sound while the context is suspended and plays the latest once it runs', async () => {
    fake.__context.state = 'suspended';
    playSoundEffect({...jump, pattern: 'steady'});
    playSoundEffect({...jump, pattern: 'steady', pitch: 'low'});
    expect(made.oscillators).toHaveLength(0);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(made.oscillators).toHaveLength(1);
    expect(
      near(
        made.oscillators[0].frequency.value,
        notesFor({...jump, pattern: 'steady', pitch: 'low'})[0].hz
      )
    ).toBe(true);
  });

  it('drops a sound once too many voices are live', () => {
    for (let i = 0; i < 40; i++) {
      playPreset('pick');
    }
    expect(made.oscillators.length).toBeLessThanOrEqual(32);
  });

  it('plays nothing with ?quiet on the URL', () => {
    window.history.replaceState({}, '', '/?quiet');
    playSoundEffect(jump);
    expect(made.oscillators).toHaveLength(0);
  });
});
