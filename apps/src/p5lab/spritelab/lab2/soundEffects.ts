// Short synthesized sounds. The play-sound-effect block builds one from
// four choices: the wave, how high, how long, and how the pitch moves. A
// preset is a named sequence of notes. They play on Tone.js, which the
// play-music block already loads, so the sounds share its context.

import {
  Compressor,
  FatOscillator,
  Filter,
  Gain,
  getContext,
  LFO,
  Noise,
  Oscillator,
  start as startAudio,
  ToneAudioNode,
} from 'tone';

export const WAVES = [
  'sine',
  'triangle',
  'square',
  'sawtooth',
  'double',
  'noise',
] as const;
export const PITCHES = ['low', 'middle', 'high'] as const;
export const LENGTHS = ['short', 'medium', 'long'] as const;
export const PATTERNS = [
  'steady',
  'slide up',
  'slide down',
  'run up',
  'run down',
  'wobble',
  'chord',
  'minor chord',
] as const;

export type Wave = (typeof WAVES)[number];
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
  /** Noise is white noise through a bandpass filter centered on hz. */
  type: OscillatorType | 'noise';
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
// Square and sawtooth waves carry more energy, so they get less gain for
// about the same loudness.
const VOLUME: Record<Wave, number> = {
  sine: 0.2,
  triangle: 0.16,
  square: 0.07,
  sawtooth: 0.08,
  double: 0.08,
  noise: 0.3,
};
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
// About a semitone either side.
const WOBBLE_DEPTH = 0.06;
// The wobble deepens from nothing over this long, so the note settles on
// its pitch before it shakes; a short note gets half its length.
const WOBBLE_ONSET_S = 0.12;
// A chord's notes cycle on one voice at this rate, the frame rate the old
// home computer games changed their notes at.
const ARPEGGIO_RATE_HZ = 50;
const CHORD_RATIOS = [1, 5 / 4, 3 / 2] as const;
const MINOR_CHORD_RATIOS = [1, 6 / 5, 3 / 2] as const;
// How far apart unison oscillators sit, in cents, end to end.
const UNISON_SPREAD_CENTS = 16;

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

export function notesFor(effect: SoundEffect): Note[] {
  const hz = BASE_HZ[effect.pitch];
  const seconds = SECONDS[effect.length];
  const voice: Pick<Note, 'type' | 'volume' | 'unison'> =
    effect.wave === 'double'
      ? {type: 'sawtooth', volume: VOLUME.double, unison: DOUBLE_VOICES}
      : {type: effect.wave, volume: VOLUME[effect.wave]};
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
        ...voice,
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
// Exponential ramps can't reach zero.
const SILENCE = 0.0001;
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
  source: Oscillator | FatOscillator | Noise;
  /** A wobble's vibrato, started and stopped with the source. */
  lfo?: LFO;
  /** Oscillators sounding, for the voice cap. */
  cost: number;
  /** The pitch a slide, wobble or arpeggio drives: the oscillator's
      frequency, or a noise voice's bandpass center. */
  frequency: Oscillator['frequency'] | Filter['frequency'];
  /** The node the voice's filter attaches to. */
  tail: ToneAudioNode;
  /** Everything to dispose once the voice has ended. */
  nodes: ToneAudioNode[];
}

let bus: Compressor | null = null;
const live = new Set<Voice>();
let pending: {notes: Note[]; askedAt: number} | null = null;

/** A compressor evens the loudness of overlapping sounds and of the waves
    against each other; its makeup gain lifts every sound by several dB. */
function outputBus(): Compressor {
  bus ??= new Compressor({
    threshold: -18,
    knee: 12,
    ratio: 4,
    attack: 0.003,
    release: 0.15,
  }).toDestination();
  return bus;
}

// ?quiet on the URL turns the sounds off.
const muted = (): boolean =>
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('quiet');

function startOscillator(
  type: OscillatorType,
  hz: number,
  start: number,
  unison: number
): Voice {
  const count = Math.max(1, Math.floor(unison));
  const source =
    count > 1
      ? new FatOscillator({
          type,
          frequency: hz,
          count,
          spread: UNISON_SPREAD_CENTS,
        })
      : new Oscillator({type, frequency: hz});
  // Summing doubles the energy per doubling of voices; this holds the
  // loudness about even.
  const sum = new Gain(1 / Math.sqrt(count));
  source.connect(sum);
  source.start(start);
  return {
    source,
    cost: count,
    frequency: source.frequency,
    tail: sum,
    nodes: [source, sum],
  };
}

/** White noise through a bandpass filter whose center frequency plays the
    part an oscillator's frequency does. */
function startNoise(hz: number, start: number): Voice {
  const source = new Noise({type: 'white'});
  const band = new Filter({type: 'bandpass', frequency: hz, Q: NOISE_Q});
  source.connect(band);
  source.start(start);
  return {
    source,
    cost: 1,
    frequency: band.frequency,
    tail: band,
    nodes: [source, band],
  };
}

const liveCost = (): number =>
  [...live].reduce((sum, voice) => sum + voice.cost, 0);

const clampHz = (hz: number) =>
  Math.min(FILTER_MAX_HZ, Math.max(FILTER_MIN_HZ, hz));

function endVoice(voice: Voice): void {
  live.delete(voice);
  voice.nodes.forEach(node => node.dispose());
}

function schedule(notes: Note[]): void {
  const cost = notes.reduce(
    (sum, note) => sum + (note.type === 'noise' ? 1 : note.unison ?? 1),
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
    const voice =
      note.type === 'noise'
        ? startNoise(hz, start)
        : startOscillator(note.type, hz, start, note.unison ?? 1);
    const {frequency} = voice;
    const top = Math.max(
      hz,
      (note.slideTo ?? 0) * nudge,
      hz * Math.max(0, ...(note.arpeggio ?? []))
    );
    const filter = new Filter({
      type: 'lowpass',
      frequency: clampHz(hz * FILTER_OPEN_RATIO),
    });
    filter.frequency
      .setValueAtTime(clampHz(hz * FILTER_OPEN_RATIO), start)
      .exponentialRampToValueAtTime(clampHz(top * FILTER_CLOSED_RATIO), end);
    const gain = new Gain(0);
    gain.gain
      .setValueAtTime(0, start)
      .linearRampToValueAtTime(note.volume, start + ATTACK_S)
      .exponentialRampToValueAtTime(SILENCE, end);
    voice.tail.chain(filter, gain, outputBus());
    voice.nodes.push(filter, gain);
    if (note.slideTo) {
      frequency
        .setValueAtTime(hz, start)
        .exponentialRampToValueAtTime(note.slideTo * nudge, end);
    }
    if (note.arpeggio?.length) {
      const ratios = note.arpeggio;
      const step = 1 / ARPEGGIO_RATE_HZ;
      for (let i = 0; start + i * step < end; i++) {
        frequency.setValueAtTime(
          hz * ratios[i % ratios.length],
          start + i * step
        );
      }
    }
    if (note.wobble) {
      const depth = hz * WOBBLE_DEPTH;
      const lfo = new LFO({frequency: WOBBLE_RATE_HZ, min: -depth, max: depth});
      lfo.amplitude
        .setValueAtTime(0, start)
        .linearRampToValueAtTime(
          1,
          start + Math.min(WOBBLE_ONSET_S, note.seconds / 2)
        );
      lfo.connect(frequency);
      lfo.start(start).stop(end);
      voice.lfo = lfo;
      voice.nodes.push(lfo);
    }
    voice.source.stop(end);
    voice.source.onstop = () => endVoice(voice);
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
  for (const voice of live) {
    voice.source.onstop = () => undefined;
    voice.source.stop();
    voice.lfo?.stop();
    voice.nodes.forEach(node => node.dispose());
  }
  live.clear();
}

export function playSoundEffect(effect: SoundEffect): void {
  playNotes(notesFor(effect));
}

export function playPreset(name: PresetName): void {
  playNotes(PRESETS[name]);
}
