// Each slot's color, on its words in the carousel, its dot and its chip in
// the sentence: one per slot, in carousel order, so a sentence of three
// words shows three colors.

import {Sentence, slotsToOffer} from './sentences';

import styles from './word-menus.module.scss';

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

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/**
 * Each offered slot's line color as the stylesheet resolves it under
 * `within`'s theme, for drawing on a canvas; a slot whose color cannot be
 * read is left out.
 */
export function slotLineColors(sentence: Sentence, within: Element): string[] {
  const probe = document.createElement('span');
  within.appendChild(probe);
  const colors = slotsToOffer(sentence).map(s => {
    probe.className = styles[`hue_${hueFor(sentence, s.id)}`];
    return getComputedStyle(probe).getPropertyValue('--hue-line').trim();
  });
  probe.remove();
  return colors.filter(c => HEX_COLOR.test(c));
}
