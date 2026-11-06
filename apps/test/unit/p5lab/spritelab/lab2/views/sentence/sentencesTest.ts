import {EMPTY_WORD_ID} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageCache';
import {
  chainedSlotIds,
  chosenBodyPlan,
  isComplete,
  promptText,
  restoreChoices,
  sentenceFor,
  sentenceSlotIds,
  sentenceWordIds,
  slotsToOffer,
} from '@cdo/apps/p5lab/spritelab/lab2/views/sentence/sentences';
import manifest from '@cdo/static/spritelab_lab2/sentences.json';

const CHARACTER_SENTENCE = sentenceFor('sprite');

describe('sentences', () => {
  it('needs only the creature', () => {
    expect(isComplete(CHARACTER_SENTENCE, {})).toBe(false);
    expect(isComplete(CHARACTER_SENTENCE, {adjective: 'cute'})).toBe(false);
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

  it('offers the required slot first, then the rest in sentence order', () => {
    expect(slotsToOffer(CHARACTER_SENTENCE).map(s => s.id)).toEqual([
      'creature',
      'adjective',
      'clothing',
    ]);
    expect(slotsToOffer(sentenceFor('background')).map(s => s.id)).toEqual([
      'place',
      'adjective',
      'from',
    ]);
  });

  it('chains the slots inside phrases, in sentence order', () => {
    expect(chainedSlotIds(CHARACTER_SENTENCE)).toEqual(['clothing']);
  });

  it('reads the simplest sentence without the empty slots', () => {
    expect(promptText(CHARACTER_SENTENCE, {creature: 'blob'})).toBe('A blob');
  });

  it('reads the full sentence with every slot filled', () => {
    expect(
      promptText(CHARACTER_SENTENCE, {
        adjective: 'cute',
        creature: 'witch',
        clothing: 'crown',
      })
    ).toBe('A cute witch wearing a crown');
  });

  it('leaves out a phrase whose slot is empty, and its words', () => {
    expect(
      promptText(CHARACTER_SENTENCE, {creature: 'cat', adjective: 'grumpy'})
    ).toBe('A grumpy cat');
  });

  it('ignores a word the slot does not offer', () => {
    expect(promptText(CHARACTER_SENTENCE, {creature: 'wizard'})).toBe('A');
    expect(isComplete(CHARACTER_SENTENCE, {creature: 'wizard'})).toBe(false);
  });

  it("carries the creature's body plan", () => {
    expect(chosenBodyPlan(CHARACTER_SENTENCE, {creature: 'cat'})).toBe(
      'quadruped'
    );
    expect(
      chosenBodyPlan(CHARACTER_SENTENCE, {creature: 'witch'})
    ).toBeUndefined();
  });

  it('picks a sentence by what the level makes', () => {
    expect(sentenceFor('sprite').id).toBe('character');
    expect(sentenceFor('sprite', 'object').id).toBe('object');
    expect(sentenceFor('block').id).toBe('block');
    expect(sentenceFor('background').id).toBe('place');
  });

  it('a level names its sentence; an unknown name falls back', () => {
    expect(sentenceFor('block', undefined, 'block').id).toBe('block');
    expect(sentenceFor('background', undefined, 'object').id).toBe('object');
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(sentenceFor('background', undefined, 'nope').id).toBe('place');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('reads each sentence as expected, full and at its least', () => {
    const full = (id: string, choices: Record<string, string>) =>
      promptText(sentenceFor('sprite', undefined, id), choices);
    expect(full('object', {adjective: 'glowing', thing: 'ice-cream'})).toBe(
      'A glowing ice cream'
    );
    expect(full('object', {thing: 'door'})).toBe('A door');
    expect(
      full('place', {
        adjective: 'outer-space',
        place: 'planet',
        from: 'far-away',
      })
    ).toBe('A outer space planet from far away');
    expect(full('place', {adjective: 'spooky', place: 'castle'})).toBe(
      'A spooky castle'
    );
    expect(full('place', {place: 'room', from: 'inside'})).toBe(
      'A room from inside'
    );
    expect(full('block', {material: 'jelly'})).toBe('A block of jelly');
    expect(full('block', {adjective: 'slimy', material: 'jelly'})).toBe(
      'A block of slimy jelly'
    );
  });

  it('word ids are lowercase words: each is a folder in the cache', () => {
    const words = [
      ...Object.values(manifest.wordSets).flat(),
      ...Object.values(manifest.sentences).flatMap(sentence =>
        Object.values(sentence.slots).flatMap(slot =>
          typeof slot.words === 'string' ? [] : slot.words
        )
      ),
    ];
    expect(words.length).toBeGreaterThan(0);
    words.forEach(word => expect(word.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/));
  });

  it("every sentence's optional slots are the ones inside phrases", () => {
    for (const [id, chained] of [
      ['character', ['clothing']],
      ['object', []],
      ['place', ['from']],
      ['block', []],
    ] as const) {
      expect(chainedSlotIds(sentenceFor('sprite', undefined, id))).toEqual(
        chained
      );
    }
  });

  it('puts saved words back, dropping what the sentence no longer holds', () => {
    expect(
      restoreChoices(CHARACTER_SENTENCE, {
        sentenceId: 'character',
        choices: {creature: 'cat', adjective: 'cute', clothing: 'hat'},
      })
    ).toEqual({creature: 'cat', adjective: 'cute', clothing: 'hat'});
    // A word or a slot that is gone is left out; the rest survive.
    expect(
      restoreChoices(CHARACTER_SENTENCE, {
        sentenceId: 'character-v1',
        choices: {creature: 'cat', adjective: 'gigantic', mood: 'happy'},
      })
    ).toEqual({creature: 'cat'});
    expect(restoreChoices(CHARACTER_SENTENCE, undefined)).toEqual({});
  });

  it('drops a phrase chain from the first word it cannot put back', () => {
    const chained = {
      ...CHARACTER_SENTENCE,
      id: 'chained',
      segments: [
        ...CHARACTER_SENTENCE.segments,
        {phrase: [{text: ' holding a '}, {slot: 'thing'}]},
      ],
      slots: {
        ...CHARACTER_SENTENCE.slots,
        thing: {
          id: 'thing',
          label: 'thing',
          words: [{id: 'wand', text: 'wand'}],
        },
      },
    };
    expect(
      restoreChoices(chained, {
        choices: {creature: 'cat', clothing: 'gone', thing: 'wand'},
      })
    ).toEqual({creature: 'cat'});
  });
});

// The manifest's own sentences: an optional slot before the required one,
// and a phrase whose slot shows only once filled.
describe('sentences word ids', () => {
  const place = sentenceFor('background', undefined, 'place');

  it('reads the slots in sentence order, phrases included', () => {
    expect(sentenceSlotIds(place)).toEqual(['adjective', 'place', 'from']);
    expect(slotsToOffer(place).map(s => s.id)).toEqual([
      'place',
      'adjective',
      'from',
    ]);
  });

  it('names a filled sentence by its word ids in slot order', () => {
    const choices = {place: 'forest', adjective: 'spooky', from: 'inside'};
    expect(sentenceWordIds(place, choices)).toEqual([
      'spooky',
      'forest',
      'inside',
    ]);
  });

  it('marks an empty optional slot, as the prompt leaves its word out', () => {
    const choices = {place: 'forest'};
    expect(sentenceWordIds(place, choices)).toEqual([
      EMPTY_WORD_ID,
      'forest',
      EMPTY_WORD_ID,
    ]);
    expect(promptText(place, choices)).not.toContain('from');
  });

  it('ignores a word that is not in its slot', () => {
    expect(sentenceWordIds(place, {place: 'forest', from: 'dragon'})).toEqual([
      EMPTY_WORD_ID,
      'forest',
      EMPTY_WORD_ID,
    ]);
  });
});
