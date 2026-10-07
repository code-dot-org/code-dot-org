// Each slot's color, on its words in the carousel, its dot and its chip in
// the sentence: one per slot, in carousel order, so a sentence of three
// words shows three colors.

import {Sentence, slotsToOffer} from './exploreSentences';

type Hue = 'blue' | 'yellow' | 'pink' | 'orange' | 'purple';

/** In carousel order; the required word takes the first. */
export const HUES: readonly Hue[] = [
  'blue',
  'yellow',
  'pink',
  'orange',
  'purple',
];

const bySentence = new WeakMap<Sentence, Record<string, Hue>>();

export function hueFor(sentence: Sentence, slotId: string): Hue {
  let hues = bySentence.get(sentence);
  if (!hues) {
    hues = Object.fromEntries(
      slotsToOffer(sentence).map((s, i) => [s.id, HUES[i % HUES.length]])
    );
    bySentence.set(sentence, hues);
  }
  return hues[slotId] ?? HUES[0];
}
