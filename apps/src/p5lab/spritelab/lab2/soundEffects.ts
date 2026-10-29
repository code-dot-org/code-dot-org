// Short synthesized sounds. The play-sound-effect block builds one from
// four choices: the wave, how high, how long, and how the pitch moves. A
// preset is a named sequence of notes. They play on Tone.js, which the
// play-music block already loads, so the sounds share its context.

import {
  Compressor,
  Filter,
  FMSynth,
  Gain,
  getContext,
  LFO,
  MembraneSynth,
  MetalSynth,
  MonoSynth,
  NoiseSynth,
  PluckSynth,
  start as startAudio,
} from 'tone';

// Pure tones first, brightening, then the instruments, then noise.
export const WAVES = [
  'sine',
  'triangle',
  'square',
  'sawtooth',
  'double',
  'pluck',
  'bell',
  'drum',
  'clang',
  'noise',
] as const;
export const PITCHES = ['low', 'middle', 'high'] as const;
export const LENGTHS = ['short', 'medium', 'long'] as const;
// One note's shapes, then the chords and runs.
export const PATTERNS = [
  'steady',
  'wobble',
  'slide up',
  'slide down',
  'chord',
  'minor chord',
  'run up',
  'run down',
] as const;

export type Wave = (typeof WAVES)[number];
/** Waves an instrument plays rather than an oscillator: a drum skin, a
    bell, a struck cymbal, a plucked string. */
const SYNTH_WAVES = ['drum', 'bell', 'clang', 'pluck'] as const;
export type SynthWave = (typeof SYNTH_WAVES)[number];
export type Pitch = (typeof PITCHES)[number];
export type Length = (typeof LENGTHS)[number];
export type Pattern = (typeof PATTERNS)[number];

export interface SoundEffect {
  wave: Wave;
  pitch: Pitch;
  length: Length;
  pattern: Pattern;
}

export interface Note {
  hz: number;
  /** Seconds after the sound starts. */
  at: number;
  seconds: number;
  /** Noise is white noise through a bandpass filter centered on hz; a
      synth wave is an instrument pitched at hz. */
  type: OscillatorType | 'noise' | SynthWave;
  /** Peak gain, 0 to 1. */
  volume: number;
  /** The frequency reached as the note ends, for a slide. */
  slideTo?: number;
  /** Vibrato. */
  wobble?: boolean;
  /** Frequency ratios the note cycles through, ARPEGGIO_RATE_HZ steps a
      second, the way old home computers played a chord on one voice. Not
      combined with slideTo: both drive the same frequency. */
  arpeggio?: readonly number[];
  /** Oscillators sounding the note, spread a few cents apart; 1 or
      absent is one. Noise ignores it. The "double" wave is two. */
  unison?: number;
  /** Played at exactly its pitch, without the humanize nudge: a UI cue
      heard many times in a row must not wander. */
  exact?: boolean;
}

// C4, C5, C6.
const BASE_HZ: Record<Pitch, number> = {low: 262, middle: 523, high: 1047};
const SECONDS: Record<Length, number> = {short: 0.12, medium: 0.3, long: 0.7};
// Measured so a medium steady note of every wave reads about -26 dBFS
// over its loudest tenth of a second, with peaks under -14 dBFS: the
// headroom a browser game leaves, and room for a chord to stack.
const VOLUME: Record<Wave, number> = {
  sine: 0.13,
  triangle: 0.16,
  square: 0.115,
  sawtooth: 0.2,
  double: 0.39,
  noise: 0.25,
  drum: 0.13,
  bell: 0.45,
  clang: 0.07,
  pluck: 0.3,
};
// Where a wave's loudness drifts with pitch, gain follows (middle/hz)^power.
const TILT: Partial<Record<Wave, number>> = {
  noise: 0.45,
  pluck: -0.35,
  double: 0.25,
  clang: -0.33,
};
// Tone's noise comes out about a quarter as loud as its other instruments;
// lifted at build so the volume table stays within 0 to 1.
const NOISE_TRIM_DB = 12;
const DOUBLE_VOICES = 2;
// How narrow the band of noise is; higher rings closer to a pitch.
const NOISE_Q = 1.5;
// A major arpeggio, the steps of a run. A run up starts at the root, a run
// down at the octave.
const RUN_RATIOS = [1, 5 / 4, 3 / 2, 2];
const RUN_NOTES: Record<Length, number> = {short: 2, medium: 3, long: 4};
// Each note of a run rings past the next one's start.
const RUN_OVERLAP = 1.5;
const WOBBLE_RATE_HZ = 8;
// A semitone either side.
const WOBBLE_DEPTH_CENTS = 100;
// A wobble deepens from nothing over this long (half the note if shorter).
const WOBBLE_ONSET_S = 0.12;
// A chord's notes cycle on one voice at this rate, the frame rate the old
// home computer games changed their notes at.
const ARPEGGIO_RATE_HZ = 50;
const CHORD_RATIOS = [1, 5 / 4, 3 / 2] as const;
const MINOR_CHORD_RATIOS = [1, 6 / 5, 3 / 2] as const;
// How far apart unison oscillators sit, in cents, end to end.
const UNISON_SPREAD_CENTS = 16;
// A drum's pitch drops from this many octaves above the note over this
// long: the thump of a struck skin.
const DRUM_OCTAVES = 4;
const DRUM_PITCH_DECAY_S = 0.05;
// A bell is a sine modulated by another a little over three times as fast,
// which gives the clashing overtones of struck metal.
const BELL_HARMONICITY = 3.01;
const BELL_MODULATION_INDEX = 12;
// A clang is a cymbal: a bright, inharmonic ring under a high-pass sweep.
const CLANG_HARMONICITY = 5.1;
const CLANG_MODULATION_INDEX = 24;
const CLANG_RESONANCE_HZ = 3000;
const CLANG_OCTAVES = 1.5;
// How long an instrument's release rings past the note's end.
const SYNTH_RELEASE_S = 0.1;
// Building an instrument costs up to a frame, striking one microseconds.
// A run's notes overlap, so each timbre keeps this many.
const INSTRUMENTS_PER_TIMBRE = 4;
// Tone wants each strike later than the instrument's last; same-frame
// strikes land this far apart.
const RESTRIKE_GAP_S = 0.001;
// A plucked string cannot bend: slides and wobbles play plain, chords strum.
const PLUCK_ATTACK_NOISE = 2;
const PLUCK_DAMPENING_HZ = 4000;
const PLUCK_RESONANCE = 0.985;

/** The effect four strings name, or null when any is not an option. */
export function asSoundEffect(
  wave: unknown,
  pitch: unknown,
  length: unknown,
  pattern: unknown
): SoundEffect | null {
  const has = (list: readonly string[], value: unknown) =>
    typeof value === 'string' && list.includes(value);
  if (
    !has(WAVES, wave) ||
    !has(PITCHES, pitch) ||
    !has(LENGTHS, length) ||
    !has(PATTERNS, pattern)
  ) {
    return null;
  }
  return {wave, pitch, length, pattern} as SoundEffect;
}

/** The gain for a wave at a pitch: its calibrated level, tilted where
    the wave's loudness drifts with pitch. The tilt was measured across the
    three pitches, so a run's notes beyond them get the nearest edge. */
const volumeFor = (wave: Wave, hz: number): number => {
  const within = Math.min(BASE_HZ.high, Math.max(BASE_HZ.low, hz));
  return VOLUME[wave] * (BASE_HZ.middle / within) ** (TILT[wave] ?? 0);
};

export function notesFor(effect: SoundEffect): Note[] {
  const hz = BASE_HZ[effect.pitch];
  const seconds = SECONDS[effect.length];
  const voiceAt = (
    noteHz: number
  ): Pick<Note, 'type' | 'volume' | 'unison'> => ({
    ...(effect.wave === 'double'
      ? {type: 'sawtooth' as const, unison: DOUBLE_VOICES}
      : {type: effect.wave}),
    volume: volumeFor(effect.wave, noteHz),
  });
  const voice = voiceAt(hz);
  switch (effect.pattern) {
    case 'steady':
      return [{...voice, hz, at: 0, seconds}];
    case 'slide up':
      return [{...voice, hz, at: 0, seconds, slideTo: hz * 2}];
    case 'slide down':
      return [{...voice, hz, at: 0, seconds, slideTo: hz / 2}];
    case 'wobble':
      return [{...voice, hz, at: 0, seconds, wobble: true}];
    case 'chord':
      return [{...voice, hz, at: 0, seconds, arpeggio: CHORD_RATIOS}];
    case 'minor chord':
      return [{...voice, hz, at: 0, seconds, arpeggio: MINOR_CHORD_RATIOS}];
    case 'run up':
    case 'run down': {
      const count = RUN_NOTES[effect.length];
      const ratios =
        effect.pattern === 'run up'
          ? RUN_RATIOS.slice(0, count)
          : RUN_RATIOS.slice(-count).reverse();
      const step = seconds / count;
      return ratios.map((ratio, i) => ({
        ...voiceAt(hz * ratio),
        hz: hz * ratio,
        at: i * step,
        seconds: step * RUN_OVERLAP,
      }));
    }
  }
}

// Presets: the explore level's cues, then game sounds.
const CUE = {type: 'triangle', volume: 0.12, exact: true} as const;
const cue = (
  hz: number,
  at: number,
  seconds: number,
  volume?: number
): Note => ({
  ...CUE,
  hz,
  at,
  seconds,
  ...(volume === undefined ? {} : {volume}),
});
const SOFT_CUE = {...CUE, type: 'sine'} as const;

export const PRESETS = {
  pick: [cue(740, 0, 0.09)],
  unpick: [cue(440, 0, 0.09)],
  flip: [cue(520, 0, 0.05, 0.05)],
  complete: [cue(659, 0, 0.12), cue(988, 0.1, 0.22)],
  go: [cue(392, 0, 0.1), cue(494, 0.08, 0.1), cue(587, 0.16, 0.24)],
  reveal: [
    cue(523, 0, 0.12),
    cue(659, 0.1, 0.12),
    cue(784, 0.2, 0.12),
    cue(1047, 0.3, 0.4),
  ],
  shuffle: [0, 1, 2, 3, 4].map(i => cue(500 + i * 90, i * 0.05, 0.05, 0.07)),
  cheer: [cue(784, 0, 0.1), cue(1047, 0.09, 0.25)],
  hmm: [
    {...SOFT_CUE, hz: 330, at: 0, seconds: 0.14},
    {...SOFT_CUE, hz: 262, at: 0.12, seconds: 0.28},
  ],
  jump: notesFor({
    wave: 'square',
    pitch: 'high',
    length: 'short',
    pattern: 'slide up',
  }),
  coin: notesFor({
    wave: 'square',
    pitch: 'high',
    length: 'short',
    pattern: 'run up',
  }),
  laser: notesFor({
    wave: 'double',
    pitch: 'high',
    length: 'short',
    pattern: 'slide down',
  }),
  fail: notesFor({
    wave: 'triangle',
    pitch: 'low',
    length: 'long',
    pattern: 'run down',
  }),
  alarm: notesFor({
    wave: 'square',
    pitch: 'middle',
    length: 'long',
    pattern: 'wobble',
  }),
  boom: notesFor({
    wave: 'noise',
    pitch: 'low',
    length: 'long',
    pattern: 'slide down',
  }),
} satisfies Record<string, Note[]>;

export type PresetName = keyof typeof PRESETS;

/** The play-sound block names a preset as synth://name beside its
    sound:// files. */
export const SYNTH_SOUND_PREFIX = 'synth://';

export function synthSoundUrl(name: PresetName): string {
  return `${SYNTH_SOUND_PREFIX}${name}`;
}

/** The preset a play-sound value names, or null for a sound file. */
export function synthPresetOf(url: unknown): PresetName | null {
  if (typeof url !== 'string' || !url.startsWith(SYNTH_SOUND_PREFIX)) {
    return null;
  }
  const name = url.slice(SYNTH_SOUND_PREFIX.length);
  return Object.prototype.hasOwnProperty.call(PRESETS, name)
    ? (name as PresetName)
    : null;
}

// Long enough that a note doesn't start with a click.
const ATTACK_S = 0.01;
// A sound asked for while the context was suspended plays once it runs,
// unless this long has passed.
const STALE_MS = 1000;
// A block fired every frame could pile up voices; past this many, a new
// sound is dropped. A voice costs one per oscillator, so a unison voice
// costs its count.
const MAX_LIVE_VOICES = 32;
// Every play is nudged up to this far in pitch, so repeats don't sound
// mechanical; one factor per play keeps a run in tune with itself.
const HUMANIZE = 0.02;
// A low-pass filter on each voice opens this far above the note and closes
// toward it as the note fades, cutting the high harmonics of a square or
// sawtooth. A slide closes toward its higher end.
const FILTER_OPEN_RATIO = 6;
const FILTER_CLOSED_RATIO = 1.5;
const FILTER_MAX_HZ = 12000;
const FILTER_MIN_HZ = 200;

interface Voice {
  /** Oscillators sounding, for the voice cap. */
  cost: number;
  /** The pitch a slide or arpeggio drives: the instrument's frequency, or
      a noise voice's bandpass center; none for a pluck, whose pitch is set
      when the string is struck. */
  frequency: MonoSynth['frequency'] | Filter['frequency'] | undefined;
  /** The pitch's offset in cents, which a wobble sways. A signal fed into
      another signal takes it over, so the wobble rides here, where the
      resting value is zero, not on the frequency. */
  detune: MonoSynth['detune'] | undefined;
  /** Hangs up the voice once its sound has rung past the end. */
  end: (at: number) => void;
  /** Cuts the sound now. */
  cut: () => void;
}

type ToneWave = Exclude<Wave, 'noise' | SynthWave>;
type Instrument = MembraneSynth | FMSynth | MetalSynth;
interface NoiseVoice {
  synth: NoiseSynth;
  band: Filter;
}
interface Pluck {
  string: PluckSynth;
  gain: Gain;
}

/** What lives as long as the audio context: the bus and the instruments.
    An offline render brings its own context, so these follow it. */
interface Rig {
  context: ReturnType<typeof getContext>;
  bus: Compressor;
  tones: Record<ToneWave, MonoSynth[]>;
  noises: NoiseVoice[];
  instruments: Record<Exclude<SynthWave, 'pluck'>, Instrument[]>;
  plucks: Pluck[];
}

// ?quiet on the URL turns the sounds off.
const muted = (): boolean =>
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('quiet');

let rig: Rig | null = null;
const live = new Set<Voice>();
let pending: {notes: Note[]; askedAt: number} | null = null;
/** When a pooled instrument was last struck, by object. */
const lastStruck = new WeakMap<object, number>();
/** The wobble riding each instrument's detune, by that signal. */
const wobbles = new Map<object, LFO>();

/** The rig for the current context. Its compressor evens the loudness of
    overlapping sounds and of the waves against each other. */
function currentRig(): Rig {
  const context = getContext();
  if (rig?.context !== context) {
    // The old context's voices would never end; their timers died with it.
    live.clear();
    wobbles.clear();
    rig = {
      context,
      bus: new Compressor({
        threshold: -18,
        knee: 12,
        ratio: 4,
        attack: 0.003,
        release: 0.15,
      }).toDestination(),
      tones: {sine: [], triangle: [], square: [], sawtooth: [], double: []},
      noises: [],
      instruments: {drum: [], bell: [], clang: []},
      plucks: [],
    };
  }
  return rig;
}

const outputBus = (): Compressor => currentRig().bus;

const envelope = {
  attack: ATTACK_S,
  decay: SECONDS.medium,
  sustain: 0,
  release: SYNTH_RELEASE_S,
};

/** An oscillator wave: the filter envelope opens the low-pass above the
    note and closes it as the note fades; the double wave is two
    sawtooths a few cents apart. */
function buildTone(wave: ToneWave): MonoSynth {
  const synth = new MonoSynth({
    oscillator:
      wave === 'double'
        ? {
            type: 'fatsawtooth',
            count: DOUBLE_VOICES,
            spread: UNISON_SPREAD_CENTS,
          }
        : {type: wave},
    envelope,
    filter: {type: 'lowpass', Q: 1},
    filterEnvelope: {...envelope, baseFrequency: FILTER_MIN_HZ, octaves: 2},
  });
  synth.connect(outputBus());
  return synth;
}

/** White noise through a bandpass filter whose center frequency plays the
    part an oscillator's frequency does. */
function buildNoise(): NoiseVoice {
  const synth = new NoiseSynth({
    volume: NOISE_TRIM_DB,
    noise: {type: 'white'},
    envelope,
  });
  const band = new Filter({
    type: 'bandpass',
    frequency: BASE_HZ.middle,
    Q: NOISE_Q,
  });
  synth.chain(band, outputBus());
  return {synth, band};
}

function buildInstrument(type: Exclude<SynthWave, 'pluck'>): Instrument {
  const instrument =
    type === 'drum'
      ? new MembraneSynth({
          pitchDecay: DRUM_PITCH_DECAY_S,
          octaves: DRUM_OCTAVES,
          envelope,
        })
      : type === 'bell'
      ? new FMSynth({
          harmonicity: BELL_HARMONICITY,
          modulationIndex: BELL_MODULATION_INDEX,
          envelope,
          modulationEnvelope: envelope,
        })
      : new MetalSynth({
          harmonicity: CLANG_HARMONICITY,
          modulationIndex: CLANG_MODULATION_INDEX,
          resonance: CLANG_RESONANCE_HZ,
          octaves: CLANG_OCTAVES,
          envelope,
        });
  instrument.connect(outputBus());
  return instrument;
}

function buildPluck(): Pluck {
  const string = new PluckSynth({
    attackNoise: PLUCK_ATTACK_NOISE,
    dampening: PLUCK_DAMPENING_HZ,
    resonance: PLUCK_RESONANCE,
  });
  const gain = new Gain(1);
  string.chain(gain, outputBus());
  return {string, gain};
}

/** The pool's longest-idle instrument, or a new one while the pool is
    short. */
function takeTurn<T extends object>(pool: T[], build: () => T): T {
  if (pool.length < INSTRUMENTS_PER_TIMBRE) {
    const made = build();
    pool.push(made);
    return made;
  }
  return pool.reduce((idle, next) =>
    (lastStruck.get(next) ?? 0) < (lastStruck.get(idle) ?? 0) ? next : idle
  );
}

function strikeTime(instrument: object, start: number): number {
  const last = lastStruck.get(instrument);
  const at =
    last === undefined ? start : Math.max(start, last + RESTRIKE_GAP_S);
  lastStruck.set(instrument, at);
  return at;
}

const liveCost = (): number =>
  [...live].reduce((sum, voice) => sum + voice.cost, 0);

const clampHz = (hz: number) =>
  Math.min(FILTER_MAX_HZ, Math.max(FILTER_MIN_HZ, hz));

const isSynthWave = (type: Note['type']): type is SynthWave =>
  (SYNTH_WAVES as readonly string[]).includes(type);

/** The pooled oscillator wave a note plays on; unison sawtooths are the
    double wave, and a type the block never makes falls back to sine. */
function toneWaveOf(note: Note): ToneWave {
  if (note.type === 'sawtooth' && (note.unison ?? 1) > 1) {
    return 'double';
  }
  return note.type === 'custom' ||
    note.type === 'noise' ||
    isSynthWave(note.type)
    ? 'sine'
    : note.type;
}

/** Hangs the voice up once its release has rung past the end. */
function endAfterRelease(voice: Voice, at: number): void {
  getContext().setTimeout(
    () => live.delete(voice),
    at + SYNTH_RELEASE_S - getContext().now()
  );
}

function endWobble(detune: object): void {
  wobbles.get(detune)?.dispose();
  wobbles.delete(detune);
}

/** The voice's frequency and detune, cleared of the last note's slide or
    wobble, which must not carry into this one. */
function freshPitch(
  frequency: MonoSynth['frequency'] | Filter['frequency'],
  detune: MonoSynth['detune'],
  at: number
): void {
  frequency.cancelScheduledValues(at);
  detune.cancelScheduledValues(at).setValueAtTime(0, at);
  endWobble(detune);
}

/** Silences a synth now, a note it has not yet started included: Tone's
    release alone ignores an envelope still at zero. */
function hush(synth: MonoSynth | NoiseSynth | Instrument): void {
  const now = getContext().now();
  synth.envelope.cancel(now);
  synth.triggerRelease(now);
}

function strikeTone(
  wave: ToneWave,
  note: Note,
  hz: number,
  top: number,
  start: number
): Voice {
  const synth = takeTurn(currentRig().tones[wave], () => buildTone(wave));
  const at = strikeTime(synth, start);
  const closed = clampHz(top * FILTER_CLOSED_RATIO);
  synth.envelope.decay = note.seconds;
  synth.filterEnvelope.decay = note.seconds;
  synth.filterEnvelope.baseFrequency = closed;
  synth.filterEnvelope.octaves = Math.log2(
    clampHz(hz * FILTER_OPEN_RATIO) / closed
  );
  freshPitch(synth.frequency, synth.detune, at);
  synth.triggerAttackRelease(hz, note.seconds, at, note.volume);
  const voice: Voice = {
    cost: note.unison ?? 1,
    frequency: synth.frequency,
    detune: synth.detune,
    end: when => endAfterRelease(voice, when),
    cut: () => {
      hush(synth);
      live.delete(voice);
    },
  };
  return voice;
}

function strikeNoise(note: Note, hz: number, start: number): Voice {
  const noise = takeTurn(currentRig().noises, buildNoise);
  const {synth, band} = noise;
  const at = strikeTime(noise, start);
  synth.envelope.decay = note.seconds;
  freshPitch(band.frequency, band.detune, at);
  band.frequency.setValueAtTime(hz, at);
  synth.triggerAttackRelease(note.seconds, at, note.volume);
  const voice: Voice = {
    cost: 1,
    frequency: band.frequency,
    detune: band.detune,
    end: when => endAfterRelease(voice, when),
    cut: () => {
      hush(synth);
      live.delete(voice);
    },
  };
  return voice;
}

/** Strings plucked together: one for the note, or one per chord note. */
function strikePluck(note: Note, hz: number, start: number): Voice {
  const ratios = note.arpeggio ?? [1];
  const strings = ratios.map(ratio => {
    const pluck = takeTurn(currentRig().plucks, buildPluck);
    const at = strikeTime(pluck, start);
    pluck.string.release = note.seconds;
    // Summing doubles the energy per doubling of strings.
    pluck.gain.gain.setValueAtTime(note.volume / Math.sqrt(ratios.length), at);
    pluck.string.triggerAttack(hz * ratio, at);
    return pluck;
  });
  const voice: Voice = {
    cost: strings.length,
    frequency: undefined,
    detune: undefined,
    end: when => endAfterRelease(voice, when),
    cut: () => {
      const now = getContext().now();
      strings.forEach(pluck =>
        pluck.gain.gain.cancelScheduledValues(now).setValueAtTime(0, now)
      );
      live.delete(voice);
    },
  };
  return voice;
}

/** A drum, bell or clang struck at the note's volume; its own envelope
    shapes the note. */
function strikeInstrument(
  type: Exclude<SynthWave, 'pluck'>,
  note: Note,
  hz: number,
  start: number
): Voice {
  const instrument = takeTurn(currentRig().instruments[type], () =>
    buildInstrument(type)
  );
  const at = strikeTime(instrument, start);
  instrument.envelope.decay = note.seconds;
  if (instrument instanceof FMSynth) {
    instrument.modulationEnvelope.decay = note.seconds;
  }
  freshPitch(instrument.frequency, instrument.detune, at);
  instrument.triggerAttackRelease(hz, note.seconds, at, note.volume);
  const voice: Voice = {
    cost: 1,
    frequency: instrument.frequency,
    detune: instrument.detune,
    end: when => endAfterRelease(voice, when),
    cut: () => {
      hush(instrument);
      live.delete(voice);
    },
  };
  return voice;
}

function schedule(notes: Note[]): void {
  const cost = notes.reduce(
    (sum, note) =>
      sum +
      (note.type === 'noise'
        ? 1
        : note.type === 'pluck'
        ? note.arpeggio?.length ?? 1
        : note.unison ?? 1),
    0
  );
  if (liveCost() + cost > MAX_LIVE_VOICES) {
    return;
  }
  const now = getContext().now();
  const humanize = 1 + (Math.random() * 2 - 1) * HUMANIZE;
  for (const note of notes) {
    const nudge = note.exact ? 1 : humanize;
    const hz = note.hz * nudge;
    const start = now + note.at;
    const end = start + note.seconds;
    const top = Math.max(
      hz,
      (note.slideTo ?? 0) * nudge,
      hz * Math.max(0, ...(note.arpeggio ?? []))
    );
    const voice =
      note.type === 'noise'
        ? strikeNoise(note, hz, start)
        : note.type === 'pluck'
        ? strikePluck(note, hz, start)
        : isSynthWave(note.type)
        ? strikeInstrument(note.type, note, hz, start)
        : strikeTone(toneWaveOf(note), note, hz, top, start);
    const {frequency, detune} = voice;
    if (note.slideTo && frequency) {
      frequency
        .setValueAtTime(hz, start)
        .exponentialRampToValueAtTime(note.slideTo * nudge, end);
    }
    if (note.arpeggio?.length && frequency) {
      const ratios = note.arpeggio;
      const step = 1 / ARPEGGIO_RATE_HZ;
      for (let i = 0; start + i * step < end; i++) {
        frequency.setValueAtTime(
          hz * ratios[i % ratios.length],
          start + i * step
        );
      }
    }
    if (note.wobble && detune) {
      const lfo = new LFO({
        frequency: WOBBLE_RATE_HZ,
        min: -WOBBLE_DEPTH_CENTS,
        max: WOBBLE_DEPTH_CENTS,
      });
      lfo.amplitude
        .setValueAtTime(0, start)
        .linearRampToValueAtTime(
          1,
          start + Math.min(WOBBLE_ONSET_S, note.seconds / 2)
        );
      lfo.connect(detune);
      lfo.start(start).stop(end);
      wobbles.set(detune, lfo);
      // Tone cannot free the wobble from its own stop in an offline render.
      if (!lfo.context.isOffline) {
        getContext().setTimeout(() => {
          if (wobbles.get(detune) === lfo) {
            endWobble(detune);
          }
        }, end - now + SYNTH_RELEASE_S);
      }
    }
    voice.end(end);
    live.add(voice);
  }
}

/**
 * Plays the notes now. A context the browser still holds suspended (no
 * user gesture yet) gets only the latest request, and only once it runs.
 */
export function playNotes(notes: Note[]): void {
  if (muted()) {
    return;
  }
  const context = getContext();
  if (context.state === 'running') {
    schedule(notes);
    return;
  }
  const first = pending === null;
  pending = {notes, askedAt: Date.now()};
  if (first) {
    startAudio().then(
      () => {
        const request = pending;
        pending = null;
        if (
          request &&
          context.state === 'running' &&
          Date.now() - request.askedAt < STALE_MS
        ) {
          schedule(request.notes);
        }
      },
      () => {
        pending = null;
      }
    );
  }
}

/** Silences every sound still playing or scheduled. */
export function stopSoundEffects(): void {
  pending = null;
  for (const voice of [...live]) {
    voice.cut();
  }
  live.clear();
  [...wobbles.keys()].forEach(endWobble);
}

export function playSoundEffect(effect: SoundEffect): void {
  playNotes(notesFor(effect));
}

export function playPreset(name: PresetName): void {
  playNotes(PRESETS[name]);
}
