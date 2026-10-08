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
  interface FakeParam {
    value: number;
    setValueAtTime: jest.Mock;
    linearRampToValueAtTime: jest.Mock;
    exponentialRampToValueAtTime: jest.Mock;
    cancelScheduledValues: jest.Mock;
  }
  const param = (): FakeParam => ({
    value: 0,
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
    cancelScheduledValues: jest.fn(),
  });
  interface FakeOscillator {
    type: string;
    frequency: FakeParam;
    detune: FakeParam;
    connect: jest.Mock;
    disconnect: jest.Mock;
    start: jest.Mock;
    stop: jest.Mock;
    onended: null | (() => void);
  }
  const oscillators: FakeOscillator[] = [];
  const noiseSources: {start: jest.Mock; stop: jest.Mock; loop: boolean}[] = [];
  const filters: {type: string; frequency: FakeParam}[] = [];
  const gains: {gain: FakeParam}[] = [];
  const compressors: object[] = [];
  let state = 'running';

  class FakeAudioContext {
    get state() {
      return state;
    }
    currentTime = 10;
    destination = {};
    // Like a browser, the state changes only when the promise settles.
    resume = jest.fn(() =>
      Promise.resolve().then(() => {
        state = 'running';
      })
    );
    createOscillator(): FakeOscillator {
      const oscillator = {
        type: 'sine',
        frequency: param(),
        detune: param(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        onended: null,
      };
      oscillators.push(oscillator);
      return oscillator;
    }
    createGain() {
      const gain = {gain: param(), connect: jest.fn(), disconnect: jest.fn()};
      gains.push(gain);
      return gain;
    }
    sampleRate = 8000;
    createBuffer(_channels: number, length: number) {
      return {getChannelData: () => new Float32Array(length)};
    }
    createBufferSource() {
      const source = {
        buffer: null,
        loop: false,
        connect: jest.fn(),
        disconnect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        onended: null,
      };
      noiseSources.push(source);
      return source;
    }
    createDynamicsCompressor() {
      const compressor = {
        threshold: param(),
        knee: param(),
        ratio: param(),
        attack: param(),
        release: param(),
        connect: jest.fn(),
      };
      compressors.push(compressor);
      return compressor;
    }
    createBiquadFilter() {
      const filter = {
        type: '',
        frequency: param(),
        Q: param(),
        connect: jest.fn(),
      };
      filters.push(filter);
      return filter;
    }
  }

  // Voices with a stop time are the notes; a wobble adds a vibrato
  // oscillator stopped the same way, so count by frequency instead.
  const noteOscillators = () => oscillators.filter(o => o.frequency.value > 20);
  // Each play is nudged up to 2% in pitch.
  const near = (value: number, hz: number) =>
    Math.abs(value - hz) / hz <= 0.021;
  const rampTarget = (p: FakeParam) =>
    p.exponentialRampToValueAtTime.mock.calls.at(-1)?.[0] as number;
  const rampTime = (p: FakeParam) =>
    p.exponentialRampToValueAtTime.mock.calls.at(-1)?.[1] as number;

  beforeEach(() => {
    oscillators.length = 0;
    noiseSources.length = 0;
    filters.length = 0;
    gains.length = 0;
    compressors.length = 0;
    state = 'running';
    (window as unknown as {AudioContext: unknown}).AudioContext =
      FakeAudioContext;
  });

  afterEach(() => {
    stopSoundEffects();
    delete (window as unknown as {AudioContext?: unknown}).AudioContext;
  });

  it('schedules one voice per note from the context time', () => {
    const notes = notesFor({...jump, pattern: 'run up', length: 'long'});
    playNotes(notes);
    expect(noteOscillators()).toHaveLength(4);
    noteOscillators().forEach((oscillator, i) => {
      expect(oscillator.stop).toHaveBeenCalledWith(
        10 + notes[i].at + notes[i].seconds
      );
    });
  });

  it('ramps a slide to its target frequency', () => {
    playSoundEffect(jump);
    const [oscillator] = oscillators;
    const [note] = notesFor(jump);
    expect(near(rampTarget(oscillator.frequency), note.slideTo!)).toBe(true);
    expect(rampTime(oscillator.frequency)).toBe(10 + note.seconds);
  });

  it('keeps a run in tune with itself under the pitch nudge', () => {
    const notes = notesFor({...jump, pattern: 'run up', length: 'long'});
    playNotes(notes);
    const ratios = noteOscillators().map(
      (o, i) => o.frequency.value / notes[i].hz
    );
    ratios.forEach(ratio => expect(ratio).toBeCloseTo(ratios[0], 6));
    expect(near(noteOscillators()[0].frequency.value, notes[0].hz)).toBe(true);
  });

  it('closes a slide-up filter toward the slide end, not the start', () => {
    playSoundEffect(jump);
    const [note] = notesFor(jump);
    const lowpass = filters.find(f => f.type === 'lowpass')!;
    expect(rampTarget(lowpass.frequency)).toBeGreaterThan(note.slideTo! * 1.4);
  });

  it('puts a closing low-pass filter and the shared compressor on each voice', () => {
    playSoundEffect({...jump, pattern: 'steady'});
    const lowpass = filters.filter(f => f.type === 'lowpass');
    expect(lowpass).toHaveLength(1);
    const [note] = notesFor({...jump, pattern: 'steady'});
    const opened = lowpass[0].frequency.setValueAtTime.mock.calls[0][0];
    expect(opened).toBeGreaterThan(rampTarget(lowpass[0].frequency));
    expect(rampTarget(lowpass[0].frequency)).toBeGreaterThan(note.hz * 0.9);
    // The bus lives with the module's context, so an earlier test may have
    // made it; this test never adds a second.
    const made = compressors.length;
    expect(made).toBeLessThanOrEqual(1);
    playSoundEffect({...jump, pattern: 'steady'});
    expect(compressors).toHaveLength(made);
  });

  it('drives a wobble from a second oscillator', () => {
    playSoundEffect({...jump, pattern: 'wobble'});
    expect(oscillators).toHaveLength(2);
    const lfo = oscillators.find(o => o.frequency.value < 20)!;
    expect(lfo.start).toHaveBeenCalled();
    expect(lfo.stop).toHaveBeenCalled();
  });

  it('steps an arpeggio through its ratios fifty times a second', () => {
    playSoundEffect({...jump, pattern: 'chord', length: 'short'});
    const steps = oscillators[0].frequency.setValueAtTime.mock.calls;
    // 0.12 s at 50 Hz: six steps, cycling root, third, fifth.
    expect(steps).toHaveLength(6);
    const hz = steps[0][0] as number;
    expect(near(steps[1][0] as number, hz * 1.25)).toBe(true);
    expect(near(steps[2][0] as number, hz * 1.5)).toBe(true);
    expect(near(steps[3][0] as number, hz)).toBe(true);
    expect(steps[1][1] - steps[0][1]).toBeCloseTo(0.02, 5);
  });

  it('spreads unison oscillators around the pitch and sums them', () => {
    playNotes([
      {hz: 440, at: 0, seconds: 0.2, type: 'sawtooth', volume: 0.1, unison: 3},
    ]);
    expect(noteOscillators()).toHaveLength(3);
    const cents = noteOscillators().map(o => o.detune.value);
    expect(cents).toEqual([-8, 0, 8]);
    expect(noteOscillators().every(o => near(o.frequency.value, 440))).toBe(
      true
    );
  });

  it('counts unison oscillators against the voice cap', () => {
    const unison = (n: number) =>
      playNotes([
        {hz: 440, at: 0, seconds: 1, type: 'square', volume: 0.1, unison: n},
      ]);
    for (let i = 0; i < 10; i++) {
      unison(3);
    }
    expect(noteOscillators()).toHaveLength(30);
    unison(3);
    expect(noteOscillators()).toHaveLength(30);
    unison(2);
    expect(noteOscillators()).toHaveLength(32);
  });

  it('deepens a wobble from nothing as the note settles', () => {
    playSoundEffect({...jump, pattern: 'wobble', length: 'long'});
    const lfo = oscillators.find(o => o.frequency.value < 20)!;
    expect(lfo).toBeDefined();
    const depthGains = gains.filter(
      g =>
        g.gain.setValueAtTime.mock.calls[0]?.[0] === 0 &&
        g.gain.linearRampToValueAtTime.mock.calls.length === 1 &&
        g.gain.exponentialRampToValueAtTime.mock.calls.length === 0
    );
    expect(depthGains).toHaveLength(1);
    const [, rampEnd] =
      depthGains[0].gain.linearRampToValueAtTime.mock.calls[0];
    expect(rampEnd - 10).toBeCloseTo(0.12, 5);
  });

  it('plays noise through a bandpass filter at the note pitch', () => {
    const [note] = notesFor({...jump, wave: 'noise', pattern: 'slide down'});
    playNotes([note]);
    expect(oscillators).toHaveLength(0);
    expect(noiseSources).toHaveLength(1);
    expect(noiseSources[0].loop).toBe(true);
    expect(noiseSources[0].stop).toHaveBeenCalledWith(10 + note.seconds);
    const band = filters.find(f => f.type === 'bandpass')!;
    expect(near(band.frequency.value, note.hz)).toBe(true);
    expect(near(rampTarget(band.frequency), note.slideTo!)).toBe(true);
    expect(rampTime(band.frequency)).toBe(10 + note.seconds);
  });

  it('plays a preset', () => {
    playPreset('reveal');
    expect(noteOscillators()).toHaveLength(PRESETS.reveal.length);
  });

  it('stops every live voice', () => {
    playPreset('reveal');
    stopSoundEffects();
    noteOscillators().forEach(oscillator => {
      expect(oscillator.stop).toHaveBeenCalledTimes(2);
      expect(oscillator.disconnect).toHaveBeenCalled();
    });
  });

  it('forgets a voice once it has ended', () => {
    playSoundEffect(jump);
    const [oscillator] = oscillators;
    oscillator.onended?.();
    stopSoundEffects();
    expect(oscillator.stop).toHaveBeenCalledTimes(1);
  });

  it('holds a sound while the context is suspended and plays the latest once it runs', async () => {
    state = 'suspended';
    playSoundEffect({...jump, pattern: 'steady'});
    playSoundEffect({...jump, pattern: 'steady', pitch: 'low'});
    expect(oscillators).toHaveLength(0);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(oscillators).toHaveLength(1);
    expect(
      near(
        oscillators[0].frequency.value,
        notesFor({...jump, pattern: 'steady', pitch: 'low'})[0].hz
      )
    ).toBe(true);
  });

  it('drops a sound once too many voices are live', () => {
    for (let i = 0; i < 40; i++) {
      playPreset('pick');
    }
    expect(noteOscillators().length).toBeLessThanOrEqual(32);
  });

  it('does nothing without an AudioContext', () => {
    delete (window as unknown as {AudioContext?: unknown}).AudioContext;
    expect(() => playSoundEffect(jump)).not.toThrow();
    expect(oscillators).toHaveLength(0);
  });
});
