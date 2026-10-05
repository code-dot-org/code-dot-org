import {
  sentenceFor,
  slotsToOffer,
} from '@cdo/apps/p5lab/spritelab/lab2/views/explore/exploreSentences';
import {hueFor} from '@cdo/apps/p5lab/spritelab/lab2/views/explore/wordHues';

const CHARACTER_SENTENCE = sentenceFor('sprite');

describe('wordHues', () => {
  it('gives every slot of a sentence its own color, the required one first', () => {
    const hues = slotsToOffer(CHARACTER_SENTENCE).map(s =>
      hueFor(CHARACTER_SENTENCE, s.id)
    );
    expect(hues).toEqual(['teal', 'yellow', 'purple']);
    expect(new Set(hues).size).toBe(hues.length);
  });

  it('colours by position, so one word set differs between sentences', () => {
    const treasure = sentenceFor('sprite', 'object', 'treasure');
    expect(hueFor(treasure, 'treasure')).toBe('teal');
    expect(hueFor(treasure, 'look')).toBe('yellow');
    expect(hueFor(treasure, 'detail')).toBe('purple');
  });
});
