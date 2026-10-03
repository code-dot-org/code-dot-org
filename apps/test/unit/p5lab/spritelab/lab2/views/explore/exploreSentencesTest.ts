import {
  CHARACTER_SENTENCE,
  chosenBodyPlan,
  isComplete,
  promptText,
  sentenceFor,
} from '@cdo/apps/p5lab/spritelab/lab2/views/explore/exploreSentences';

describe('exploreSentences', () => {
  it('needs only the creature', () => {
    expect(isComplete(CHARACTER_SENTENCE, {})).toBe(false);
    expect(isComplete(CHARACTER_SENTENCE, {adjective: 'brave'})).toBe(false);
    expect(isComplete(CHARACTER_SENTENCE, {creature: 'blob'})).toBe(true);
  });

  it('reads the simplest sentence without the empty slots', () => {
    expect(promptText(CHARACTER_SENTENCE, {creature: 'blob'})).toBe('A blob');
  });

  it('reads the full sentence with every slot filled', () => {
    expect(
      promptText(CHARACTER_SENTENCE, {
        adjective: 'sparkly',
        creature: 'wizard',
        clothing: 'crown',
        thing: 'lantern',
        detail: 'lots',
      })
    ).toBe(
      'A sparkly wizard wearing a crown holding a lantern, drawn with lots of detail'
    );
  });

  it('leaves out a phrase whose slot is empty, and its words', () => {
    expect(
      promptText(CHARACTER_SENTENCE, {creature: 'cat', thing: 'fish'})
    ).toBe('A cat holding a fish');
  });

  it('ignores a word the slot does not offer', () => {
    expect(promptText(CHARACTER_SENTENCE, {creature: 'unicorn'})).toBe('A');
    expect(isComplete(CHARACTER_SENTENCE, {creature: 'unicorn'})).toBe(false);
  });

  it("carries the creature's body plan", () => {
    expect(chosenBodyPlan(CHARACTER_SENTENCE, {creature: 'cat'})).toBe(
      'quadruped'
    );
    expect(
      chosenBodyPlan(CHARACTER_SENTENCE, {creature: 'wizard'})
    ).toBeUndefined();
  });

  it('picks a sentence by what the level makes', () => {
    expect(sentenceFor('sprite').id).toBe('character');
    expect(sentenceFor('sprite', 'object').id).toBe('object');
    expect(sentenceFor('block').id).toBe('object');
    expect(sentenceFor('background').id).toBe('place');
  });
});
