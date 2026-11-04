import {
  sentenceFor,
  slotsToOffer,
} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/sentences';
import {hueFor} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/wordHues';

const CHARACTER_SENTENCE = sentenceFor('sprite');

describe('wordHues', () => {
  it('gives every slot of a sentence its own color, the required one first', () => {
    const hues = slotsToOffer(CHARACTER_SENTENCE).map(s =>
      hueFor(CHARACTER_SENTENCE, s.id)
    );
    expect(hues).toEqual(['blue', 'yellow', 'pink']);
    expect(new Set(hues).size).toBe(hues.length);
  });

  it('colors by position, so the required word is blue in every sentence', () => {
    const place = sentenceFor('background');
    expect(hueFor(place, 'place')).toBe('blue');
    expect(hueFor(place, 'adjective')).toBe('yellow');
    expect(hueFor(place, 'from')).toBe('pink');
    // Read second, but picked first.
    const block = sentenceFor('block');
    expect(hueFor(block, 'material')).toBe('blue');
    expect(hueFor(block, 'adjective')).toBe('yellow');
    for (const sentence of [
      sentenceFor('sprite'),
      sentenceFor('sprite', 'object'),
      place,
      block,
    ]) {
      const required = Object.values(sentence.slots).find(s => s.required)!;
      expect(hueFor(sentence, required.id)).toBe('blue');
    }
  });
});
