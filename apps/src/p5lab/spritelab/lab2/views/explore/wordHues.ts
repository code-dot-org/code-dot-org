// Each slot's color, on its words in the carousel, its dot and its chip in
// the sentence: one per slot, in carousel order, so a sentence of three
// words shows three colors.

import {Sentence, slotsToOffer} from './exploreSentences';

export type Hue = 'teal' | 'yellow' | 'purple' | 'orange' | 'blue';

const HUES: Hue[] = ['teal', 'yellow', 'purple', 'orange', 'blue'];

export function hueFor(sentence: Sentence, slotId: string): Hue {
  const at = slotsToOffer(sentence).findIndex(s => s.id === slotId);
  return HUES[Math.max(0, at) % HUES.length];
}
