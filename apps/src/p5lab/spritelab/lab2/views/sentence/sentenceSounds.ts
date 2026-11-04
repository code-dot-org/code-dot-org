// The sentence scene's cues: a tick for a word, a chime for a finished
// sentence, a run up the scale for a picture. They are synth presets, so
// they share its context and bus with the game's sounds.

import {playPreset} from '@cdo/apps/p5lab/spritelab/lab2/soundEffects';

export type SentenceSound =
  | 'pick'
  | 'unpick'
  | 'flip'
  | 'complete'
  | 'go'
  | 'reveal'
  | 'cheer'
  | 'hmm';

export function playSound(name: SentenceSound): void {
  playPreset(name);
}
