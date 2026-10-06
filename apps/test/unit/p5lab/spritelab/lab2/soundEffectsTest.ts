import {
  asSoundEffect,
  LENGTHS,
  Note,
  notesFor,
  PATTERNS,
  PITCHES,
  playNotes,
  playSoundEffect,
  SoundEffect,
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
    expect(asSoundEffect('noise', 'low', 'short', 'steady')).toBeNull();
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
              expect(note.type).toBe(wave);
              expect(note.hz).toBeGreaterThan(0);
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
    expect(endOf(long)).toBeGreaterThan(endOf(short) * 4);
  });

  it('slides an octave up or down', () => {
    const [up] = notesFor(jump);
    const [down] = notesFor({...jump, pattern: 'slide down'});
    expect(up.slideTo).toBe(up.hz * 2);
    expect(down.slideTo).toBe(down.hz / 2);
  });

  it('runs up in rising steps and down in falling ones', () => {
    const up = notesFor({...jump, pattern: 'run up', length: 'medium'});
    const down = notesFor({...jump, pattern: 'run down', length: 'medium'});
    expect(up).toHaveLength(3);
    expect(up.map(note => note.hz)).toEqual(
      [...up.map(note => note.hz)].sort((a, b) => a - b)
    );
    expect(down.map(note => note.hz)).toEqual(
      [...up.map(note => note.hz)].reverse()
    );
    expect(up.map(note => note.at)).toEqual(
      [...up.map(note => note.at)].sort((a, b) => a - b)
    );
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

describe('playNotes', () => {
  interface FakeParam {
    value: number;
    setValueAtTime: jest.Mock;
    linearRampToValueAtTime: jest.Mock;
    exponentialRampToValueAtTime: jest.Mock;
  }
  const param = (): FakeParam => ({
    value: 0,
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
  });
  const oscillators: {
    frequency: FakeParam;
    start: jest.Mock;
    stop: jest.Mock;
  }[] = [];

  class FakeAudioContext {
    state = 'running';
    currentTime = 10;
    destination = {};
    resume = jest.fn(() => Promise.resolve());
    createOscillator() {
      const oscillator = {
        type: 'sine',
        frequency: param(),
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
      return {gain: param(), connect: jest.fn(), disconnect: jest.fn()};
    }
  }

  beforeEach(() => {
    oscillators.length = 0;
    (window as unknown as {AudioContext: unknown}).AudioContext =
      FakeAudioContext;
  });

  afterEach(() => {
    delete (window as unknown as {AudioContext?: unknown}).AudioContext;
  });

  it('schedules one voice per note from the context time', () => {
    const notes = notesFor({...jump, pattern: 'run up', length: 'long'});
    playNotes(notes);
    expect(oscillators).toHaveLength(4);
    oscillators.forEach((oscillator, i) => {
      expect(oscillator.stop).toHaveBeenCalledWith(
        10 + notes[i].at + notes[i].seconds
      );
    });
  });

  it('ramps a slide to its target frequency', () => {
    playSoundEffect(jump);
    const [oscillator] = oscillators;
    const [note] = notesFor(jump);
    expect(
      oscillator.frequency.exponentialRampToValueAtTime
    ).toHaveBeenCalledWith(note.slideTo, 10 + note.seconds);
  });

  it('does nothing without an AudioContext', () => {
    delete (window as unknown as {AudioContext?: unknown}).AudioContext;
    expect(() => playSoundEffect(jump)).not.toThrow();
    expect(oscillators).toHaveLength(0);
  });
});
