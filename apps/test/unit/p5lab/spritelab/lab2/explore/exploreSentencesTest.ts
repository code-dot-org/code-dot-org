import {EMPTY_WORD_ID} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageCache';
import {
  promptText,
  sentenceFor,
  sentenceSlotIds,
  sentenceWordIds,
  slotsToOffer,
} from '@cdo/apps/p5lab/spritelab/lab2/views/explore/exploreSentences';

// The manifest's own sentences: an optional slot before the required one,
// and a phrase whose slot shows only once filled.
describe('exploreSentences word ids', () => {
  const placeTime = sentenceFor('background', undefined, 'place-time');

  it('reads the slots in sentence order, phrases included', () => {
    expect(sentenceSlotIds(placeTime)).toEqual(['adjective', 'place', 'time']);
    expect(slotsToOffer(placeTime).map(s => s.id)).toEqual([
      'place',
      'adjective',
      'time',
    ]);
  });

  it('names a filled sentence by its word ids in slot order', () => {
    const choices = {place: 'forest', adjective: 'sunny', time: 'night'};
    expect(sentenceWordIds(placeTime, choices)).toEqual([
      'sunny',
      'forest',
      'night',
    ]);
  });

  it('marks an empty optional slot, as the prompt leaves its word out', () => {
    const choices = {place: 'forest'};
    expect(sentenceWordIds(placeTime, choices)).toEqual([
      EMPTY_WORD_ID,
      'forest',
      EMPTY_WORD_ID,
    ]);
    expect(promptText(placeTime, choices)).not.toContain('at');
  });

  it('ignores a word that is not in its slot', () => {
    expect(
      sentenceWordIds(placeTime, {place: 'forest', time: 'dragon'})
    ).toEqual([EMPTY_WORD_ID, 'forest', EMPTY_WORD_ID]);
  });
});
