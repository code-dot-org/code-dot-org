// Short synthesized sound effects, built from four choices: the wave, how
// high, how long, and how the pitch moves. The play-sound-effect block
// plays one; playNotes is the layer under it for any scripted sound.

import {startVoice, wake} from './audioFeedback/audioVoice';

export const WAVES = ['sine', 'triangle', 'square', 'sawtooth'] as const;
export const PITCHES = ['low', 'middle', 'high'] as const;
export const LENGTHS = ['short', 'medium', 'long'] as const;
export const PATTERNS = [
  'steady',
  'slide up',
  'slide down',
  'run up',
  'run down',
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
// A major arpeggio, the steps of a run.
const RUN_RATIOS = [1, 5 / 4, 3 / 2, 2];
const RUN_NOTES: Record<Length, number> = {short: 2, medium: 3, long: 4};
// Each note of a run rings past the next one's start.
const RUN_OVERLAP = 1.5;

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
    case 'run up':
    case 'run down': {
      const ratios = RUN_RATIOS.slice(0, RUN_NOTES[effect.length]);
      if (effect.pattern === 'run down') {
        ratios.reverse();
      }
      const step = seconds / ratios.length;
      return ratios.map((ratio, i) => ({
        ...voice,
        hz: hz * ratio,
        at: i * step,
        seconds: step * RUN_OVERLAP,
      }));
    }
  }
}

// Long enough that a note doesn't start with a click.
const ATTACK_S = 0.01;
// Exponential ramps can't reach zero.
const SILENCE = 0.0001;

let context: AudioContext | null = null;

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
  wake(context);
  return context;
}

// ?quiet on the URL turns the sounds off.
const muted = (): boolean =>
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('quiet');

export function playNotes(notes: Note[]): void {
  const ctx = muted() ? null : audioContext();
  if (!ctx) {
    return;
  }
  const now = ctx.currentTime;
  for (const note of notes) {
    const {oscillator, gain} = startVoice(ctx, note.type, note.hz);
    const start = now + note.at;
    const end = start + note.seconds;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(note.volume, start + ATTACK_S);
    gain.gain.exponentialRampToValueAtTime(SILENCE, end);
    if (note.slideTo) {
      oscillator.frequency.setValueAtTime(note.hz, start);
      oscillator.frequency.exponentialRampToValueAtTime(note.slideTo, end);
    }
    oscillator.stop(end);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
}

export function playSoundEffect(effect: SoundEffect): void {
  playNotes(notesFor(effect));
}
