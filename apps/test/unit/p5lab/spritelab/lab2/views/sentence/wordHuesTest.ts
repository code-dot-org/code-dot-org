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
  });
});
