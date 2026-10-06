// Short synthesized sounds. The play-sound-effect block builds one from
// four choices: the wave, how high, how long, and how the pitch moves. A
// preset is a named sequence of notes.

import {startVoice, Voice, wake} from './audioFeedback/audioVoice';

export const WAVES = ['sine', 'triangle', 'square', 'sawtooth'] as const;
export const PITCHES = ['low', 'middle', 'high'] as const;
export const LENGTHS = ['short', 'medium', 'long'] as const;
export const PATTERNS = [
  'steady',
  'slide up',
  'slide down',
  'run up',
  'run down',
  'wobble',
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
  type: OscillatorType;
  /** Peak gain, 0 to 1. */
  volume: number;
  /** The frequency reached as the note ends, for a slide. */
  slideTo?: number;
  /** Vibrato. */
  wobble?: boolean;
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
};
// A major arpeggio, the steps of a run. A run up starts at the root, a run
// down at the octave.
const RUN_RATIOS = [1, 5 / 4, 3 / 2, 2];
const RUN_NOTES: Record<Length, number> = {short: 2, medium: 3, long: 4};
// Each note of a run rings past the next one's start.
const RUN_OVERLAP = 1.5;
const WOBBLE_RATE_HZ = 8;
// About a semitone either side.
const WOBBLE_DEPTH = 0.06;

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
  const voice = {type: effect.wave, volume: VOLUME[effect.wave]};
  switch (effect.pattern) {
    case 'steady':
      return [{...voice, hz, at: 0, seconds}];
    case 'slide up':
      return [{...voice, hz, at: 0, seconds, slideTo: hz * 2}];
    case 'slide down':
      return [{...voice, hz, at: 0, seconds, slideTo: hz / 2}];
    case 'wobble':
      return [{...voice, hz, at: 0, seconds, wobble: true}];
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
const CUE = {type: 'triangle', volume: 0.12} as const;
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
  coin: [
    {...CUE, type: 'square', volume: 0.06, hz: 988, at: 0, seconds: 0.08},
    {...CUE, type: 'square', volume: 0.06, hz: 1319, at: 0.07, seconds: 0.3},
  ],
  laser: notesFor({
    wave: 'sawtooth',
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
} satisfies Record<string, Note[]>;

export type PresetName = keyof typeof PRESETS;

// Long enough that a note doesn't start with a click.
const ATTACK_S = 0.01;
// Exponential ramps can't reach zero.
const SILENCE = 0.0001;
// A sound asked for while the context was suspended plays once it runs,
// unless this long has passed; an older request was a live preview, not a
// student's click.
const STALE_MS = 1000;
// A block fired every frame could pile up voices; past this many, a new
// sound is dropped. Each voice costs the audio thread one oscillator.
const MAX_LIVE_VOICES = 32;

let context: AudioContext | null = null;
const live = new Set<Voice>();
let pending: {notes: Note[]; askedAt: number} | null = null;

function audioContext(): AudioContext | null {
  if (
    typeof window === 'undefined' ||
    typeof window.AudioContext !== 'function'
  ) {
    return null;
  }
  try {
    context ??= new window.AudioContext();
  } catch {
    // Chrome caps the contexts a page may hold.
    return null;
  }
  return context;
}

// ?quiet on the URL turns the sounds off.
const muted = (): boolean =>
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('quiet');

function schedule(ctx: AudioContext, notes: Note[]): void {
  if (live.size + notes.length > MAX_LIVE_VOICES) {
    return;
  }
  const now = ctx.currentTime;
  for (const note of notes) {
    const voice = startVoice(ctx, note.type, note.hz);
    const {oscillator, gain} = voice;
    const start = now + note.at;
    const end = start + note.seconds;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(note.volume, start + ATTACK_S);
    gain.gain.exponentialRampToValueAtTime(SILENCE, end);
    if (note.slideTo) {
      oscillator.frequency.setValueAtTime(note.hz, start);
      oscillator.frequency.exponentialRampToValueAtTime(note.slideTo, end);
    }
    if (note.wobble) {
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = WOBBLE_RATE_HZ;
      depth.gain.value = note.hz * WOBBLE_DEPTH;
      lfo.connect(depth);
      depth.connect(oscillator.frequency);
      lfo.start(start);
      lfo.stop(end);
    }
    oscillator.stop(end);
    live.add(voice);
    oscillator.onended = () => {
      live.delete(voice);
      oscillator.disconnect();
      gain.disconnect();
    };
  }
}

/**
 * Plays the notes now. A context the browser still holds suspended (no
 * user gesture yet) gets only the latest request, and only once it runs.
 */
export function playNotes(notes: Note[]): void {
  const ctx = muted() ? null : audioContext();
  if (!ctx) {
    return;
  }
  if (ctx.state === 'running') {
    schedule(ctx, notes);
    return;
  }
  const first = pending === null;
  pending = {notes, askedAt: Date.now()};
  wake(ctx);
  if (first) {
    ctx.resume().then(
      () => {
        const request = pending;
        pending = null;
        if (
          request &&
          ctx.state === 'running' &&
          Date.now() - request.askedAt < STALE_MS
        ) {
          schedule(ctx, request.notes);
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
    voice.oscillator.onended = null;
    voice.gain.gain.cancelScheduledValues(0);
    voice.gain.gain.value = 0;
    voice.oscillator.stop();
    voice.oscillator.disconnect();
    voice.gain.disconnect();
  }
  live.clear();
}

export function playSoundEffect(effect: SoundEffect): void {
  playNotes(notesFor(effect));
}

export function playPreset(name: PresetName): void {
  playNotes(PRESETS[name]);
}
