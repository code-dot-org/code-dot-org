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

  it('colors by position, so one word set differs between sentences', () => {
    const treasure = sentenceFor('sprite', 'object', 'treasure');
    expect(hueFor(treasure, 'treasure')).toBe('blue');
    expect(hueFor(treasure, 'look')).toBe('yellow');
    expect(hueFor(treasure, 'detail')).toBe('pink');
  });
});
