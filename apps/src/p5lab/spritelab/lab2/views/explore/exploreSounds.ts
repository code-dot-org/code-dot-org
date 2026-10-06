// Short synthesized sounds for the explore level: a tick for a word, a
// chime for a finished sentence, a run up the scale for a picture.

import {
  startVoice,
  wake,
} from '@cdo/apps/p5lab/spritelab/lab2/audioFeedback/audioVoice';

type ExploreSound =
  | 'pick'
  | 'unpick'
  | 'flip'
  | 'complete'
  | 'go'
  | 'reveal'
  | 'shuffle'
  | 'cheer'
  | 'hmm';

interface Note {
  hz: number;
  /** Seconds after the sound starts. */
  at: number;
  seconds: number;
  type?: OscillatorType;
  volume?: number;
}

const VOLUME = 0.12;
// Long enough that a note doesn't start with a click.
const ATTACK_S = 0.01;
// Exponential ramps can't reach zero.
const SILENCE = 0.0001;

const SOUNDS: Record<ExploreSound, Note[]> = {
  pick: [{hz: 740, at: 0, seconds: 0.09}],
  unpick: [{hz: 440, at: 0, seconds: 0.09}],
  flip: [{hz: 520, at: 0, seconds: 0.05, volume: 0.05}],
  complete: [
    {hz: 659, at: 0, seconds: 0.12},
    {hz: 988, at: 0.1, seconds: 0.22},
  ],
  go: [
    {hz: 392, at: 0, seconds: 0.1},
    {hz: 494, at: 0.08, seconds: 0.1},
    {hz: 587, at: 0.16, seconds: 0.24},
  ],
  reveal: [
    {hz: 523, at: 0, seconds: 0.12},
    {hz: 659, at: 0.1, seconds: 0.12},
    {hz: 784, at: 0.2, seconds: 0.12},
    {hz: 1047, at: 0.3, seconds: 0.4},
  ],
  shuffle: [0, 1, 2, 3, 4].map(i => ({
    hz: 500 + i * 90,
    at: i * 0.05,
    seconds: 0.05,
    volume: 0.07,
  })),
  cheer: [
    {hz: 784, at: 0, seconds: 0.1},
    {hz: 1047, at: 0.09, seconds: 0.25},
  ],
  hmm: [
    {hz: 330, at: 0, seconds: 0.14, type: 'sine'},
    {hz: 262, at: 0.12, seconds: 0.28, type: 'sine'},
  ],
};

let context: AudioContext | null = null;

// ?quiet on the URL turns the sounds off.
const muted = (): boolean =>
  typeof window === 'undefined' ||
  typeof window.AudioContext !== 'function' ||
  new URLSearchParams(window.location.search).has('quiet');

export function playSound(name: ExploreSound): void {
  if (muted()) {
    return;
  }
  context ??= new AudioContext();
  wake(context);
  const now = context.currentTime;
  for (const note of SOUNDS[name]) {
    const {oscillator, gain} = startVoice(
      context,
      note.type ?? 'triangle',
      note.hz
    );
    const start = now + note.at;
    const end = start + note.seconds;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(note.volume ?? VOLUME, start + ATTACK_S);
    gain.gain.exponentialRampToValueAtTime(SILENCE, end);
    oscillator.stop(end);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
}
