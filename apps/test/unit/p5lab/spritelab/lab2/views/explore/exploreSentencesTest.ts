import {
  chainedSlotIds,
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

  it('builds every sentence in the manifest with its words resolved', () => {
    for (const imageType of ['sprite', 'block', 'background'] as const) {
      const sentence = sentenceFor(imageType);
      for (const [slotId, slot] of Object.entries(sentence.slots)) {
        expect(slot.id).toBe(slotId);
        expect(slot.words.length).toBeGreaterThan(0);
      }
    }
    expect(sentenceFor('sprite', 'object').id).toBe('object');
  });

  it('chains the slots inside phrases, in sentence order', () => {
    expect(chainedSlotIds(CHARACTER_SENTENCE)).toEqual([
      'clothing',
      'thing',
      'detail',
    ]);
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

  it('a level names its sentence; an unknown name falls back', () => {
    expect(sentenceFor('block', undefined, 'block').id).toBe('block');
    expect(sentenceFor('background', undefined, 'place-time').id).toBe(
      'place-time'
    );
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(sentenceFor('background', undefined, 'nope').id).toBe('place');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("the progression's sentences read as expected when full", () => {
    const full = (id: string, choices: Record<string, string>) =>
      promptText(sentenceFor('sprite', undefined, id), choices);
    expect(
      full('friend', {adjective: 'sleepy', creature: 'cat', expression: 'shy'})
    ).toBe('A sleepy cat looking shy');
    expect(
      full('place-time', {adjective: 'spooky', place: 'castle', time: 'night'})
    ).toBe('A spooky castle at night');
    expect(
      full('place-detail', {place: 'forest', detail: 'glowing-mushrooms'})
    ).toBe('A forest with glowing mushrooms');
    expect(full('block', {material: 'ice'})).toBe('A block of ice');
    expect(full('block', {material: 'stone', detail: 'tiny-gems'})).toBe(
      'A block of stone with tiny gems'
    );
    expect(
      full('treasure', {look: 'golden', treasure: 'key', detail: 'a-ribbon'})
    ).toBe('A golden key with a ribbon');
  });

  it("every sentence's optional slots are the ones inside phrases", () => {
    for (const [id, chained] of [
      ['friend', ['expression']],
      ['place-time', ['time']],
      ['place-detail', ['detail']],
      ['block', ['detail']],
      ['treasure', ['detail']],
    ] as const) {
      expect(chainedSlotIds(sentenceFor('sprite', undefined, id))).toEqual(
        chained
      );
    }
  });
});
