// The sentences a student builds from word chips on an explore image
// level, and the prompt text a filled sentence becomes. A sentence is a
// row of segments: fixed text, a slot that takes one word, or a phrase
// whose words show only when its slot is filled. A required slot must be
// filled before the sentence can generate.

import {BodyPlan, ImageSubject, ImageType} from '../../ai/images/types';

export interface Word {
  id: string;
  text: string;
  /** Shown on the word's chip beside the text; decoration, not read aloud. */
  emoji?: string;
  /** How a creature is built, for the character-set poses. */
  bodyPlan?: BodyPlan;
}

export interface Slot {
  id: string;
  /** Shown in the empty slot, e.g. "creature". */
  label: string;
  words: Word[];
  required?: boolean;
}

export type Segment =
  | {text: string}
  | {slot: string}
  /** Fixed words around a slot that read as one phrase: dimmed while the
      slot is empty, left out of the prompt. */
  | {phrase: Segment[]};

export interface Sentence {
  id: string;
  segments: Segment[];
  slots: Record<string, Slot>;
}

/** The word chosen for each slot, by slot id. */
export type Choices = Record<string, string | undefined>;

/** The drag payload's type: a JSON {slot, word} carried from a word chip. */
export const WORD_DRAG_TYPE = 'application/x-spritelab2-word';

const CREATURES: Word[] = [
  {id: 'blob', text: 'blob', emoji: '🟢'},
  {id: 'robot', text: 'robot', emoji: '🤖'},
  {id: 'dragon', text: 'dragon', emoji: '🐉', bodyPlan: 'quadruped'},
  {id: 'cat', text: 'cat', emoji: '🐱', bodyPlan: 'quadruped'},
  {id: 'monster', text: 'monster', emoji: '👾'},
  {id: 'wizard', text: 'wizard', emoji: '🧙'},
  {id: 'penguin', text: 'penguin', emoji: '🐧', bodyPlan: 'bird'},
  {id: 'witch', text: 'witch', emoji: '🧹'},
];

const ADJECTIVES: Word[] = [
  {id: 'brave', text: 'brave', emoji: '💪'},
  {id: 'sparkly', text: 'sparkly', emoji: '✨'},
  {id: 'grumpy', text: 'grumpy', emoji: '😠'},
  {id: 'friendly', text: 'friendly', emoji: '😊'},
  {id: 'cute', text: 'cute', emoji: '🥰'},
  {id: 'sleepy', text: 'sleepy', emoji: '😴'},
  {id: 'tiny', text: 'tiny', emoji: '🐜'},
];

const CLOTHING: Word[] = [
  {id: 'hat', text: 'hat', emoji: '🎩'},
  {id: 'crown', text: 'crown', emoji: '👑'},
  {id: 'cape', text: 'cape', emoji: '🦸'},
  {id: 'scarf', text: 'scarf', emoji: '🧣'},
  {id: 'boots', text: 'boots', emoji: '👢'},
  {id: 'glasses', text: 'glasses', emoji: '👓'},
];

const THINGS: Word[] = [
  {id: 'wand', text: 'wand', emoji: '🪄'},
  {id: 'balloon', text: 'balloon', emoji: '🎈'},
  {id: 'flower', text: 'flower', emoji: '🌸'},
  {id: 'book', text: 'book', emoji: '📖'},
  {id: 'lantern', text: 'lantern', emoji: '🏮'},
  {id: 'fish', text: 'fish', emoji: '🐟'},
];

const DETAIL: Word[] = [
  {id: 'simple', text: 'simple shapes', emoji: '⬜'},
  {id: 'some', text: 'some detail', emoji: '✏️'},
  {id: 'lots', text: 'lots of detail', emoji: '🖼️'},
];

/** Level 2's character: a creature at least, dressed up as far as the
    student likes. */
export const CHARACTER_SENTENCE: Sentence = {
  id: 'character',
  segments: [
    {text: 'A '},
    {slot: 'adjective'},
    {text: ' '},
    {slot: 'creature'},
    {phrase: [{text: ' wearing a '}, {slot: 'clothing'}]},
    {phrase: [{text: ' holding a '}, {slot: 'thing'}]},
    {phrase: [{text: ', drawn with '}, {slot: 'detail'}]},
  ],
  slots: {
    adjective: {id: 'adjective', label: 'adjective', words: ADJECTIVES},
    creature: {
      id: 'creature',
      label: 'creature',
      words: CREATURES,
      required: true,
    },
    clothing: {id: 'clothing', label: 'clothing', words: CLOTHING},
    thing: {id: 'thing', label: 'thing', words: THINGS},
    detail: {id: 'detail', label: 'detail', words: DETAIL},
  },
};

const OBJECT_SENTENCE: Sentence = {
  id: 'object',
  segments: [{text: 'A '}, {slot: 'adjective'}, {text: ' '}, {slot: 'thing'}],
  slots: {
    adjective: {id: 'adjective', label: 'adjective', words: ADJECTIVES},
    thing: {
      id: 'thing',
      label: 'thing',
      words: [
        {id: 'key', text: 'key', emoji: '🔑'},
        {id: 'gem', text: 'gem', emoji: '💎'},
        {id: 'coin', text: 'coin', emoji: '🪙'},
        {id: 'apple', text: 'apple', emoji: '🍎'},
        {id: 'star', text: 'star', emoji: '⭐'},
        {id: 'potion', text: 'potion', emoji: '🧪'},
      ],
      required: true,
    },
  },
};

const PLACE_SENTENCE: Sentence = {
  id: 'place',
  segments: [{text: 'A '}, {slot: 'adjective'}, {text: ' '}, {slot: 'place'}],
  slots: {
    adjective: {
      id: 'adjective',
      label: 'adjective',
      words: [
        {id: 'sunny', text: 'sunny', emoji: '☀️'},
        {id: 'misty', text: 'misty', emoji: '🌫️'},
        {id: 'frozen', text: 'frozen', emoji: '❄️'},
        {id: 'spooky', text: 'spooky', emoji: '👻'},
        {id: 'peaceful', text: 'peaceful', emoji: '🕊️'},
      ],
    },
    place: {
      id: 'place',
      label: 'place',
      words: [
        {id: 'forest', text: 'forest', emoji: '🌲'},
        {id: 'cave', text: 'cave', emoji: '🕳️'},
        {id: 'beach', text: 'beach', emoji: '🏖️'},
        {id: 'castle', text: 'castle', emoji: '🏰'},
        {id: 'city', text: 'city', emoji: '🏙️'},
        {id: 'space', text: 'space station', emoji: '🛰️'},
      ],
      required: true,
    },
  },
};

/** The sentence for what the level makes. */
export function sentenceFor(
  imageType: ImageType,
  subject?: ImageSubject
): Sentence {
  if (imageType === 'background') {
    return PLACE_SENTENCE;
  }
  if (imageType === 'block' || subject === 'object') {
    return OBJECT_SENTENCE;
  }
  return CHARACTER_SENTENCE;
}

export function wordFor(
  sentence: Sentence,
  slotId: string,
  wordId: string | undefined
): Word | undefined {
  return wordId
    ? sentence.slots[slotId]?.words.find(w => w.id === wordId)
    : undefined;
}

/** Whether every required slot has a word. */
export function isComplete(sentence: Sentence, choices: Choices): boolean {
  return Object.values(sentence.slots).every(
    slot => !slot.required || !!wordFor(sentence, slot.id, choices[slot.id])
  );
}

/**
 * The slots that live inside phrases, in sentence order. They unlock one
 * after another and clear together from the back, so a sentence is always
 * a prefix of its phrases: a handful of shapes to translate, not every mix.
 */
export function chainedSlotIds(sentence: Sentence): string[] {
  const ids: string[] = [];
  const walk = (segments: Segment[], inPhrase: boolean) =>
    segments.forEach(segment => {
      if ('slot' in segment) {
        if (inPhrase) {
          ids.push(segment.slot);
        }
      } else if ('phrase' in segment) {
        walk(segment.phrase, true);
      }
    });
  walk(sentence.segments, false);
  return ids;
}

/** Whether a phrase's slots are all filled, so its words show and count. */
export function phraseFilled(
  sentence: Sentence,
  phrase: Segment[],
  choices: Choices
): boolean {
  return phrase.every(
    segment =>
      !('slot' in segment) ||
      !!wordFor(sentence, segment.slot, choices[segment.slot])
  );
}

/**
 * The prompt the sentence reads as: empty optional slots and unfilled
 * phrases are left out, and the spaces they leave are closed up.
 */
export function promptText(sentence: Sentence, choices: Choices): string {
  const parts: string[] = [];
  const add = (segments: Segment[]) => {
    segments.forEach(segment => {
      if ('text' in segment) {
        parts.push(segment.text);
      } else if ('slot' in segment) {
        const word = wordFor(sentence, segment.slot, choices[segment.slot]);
        if (word) {
          parts.push(word.text);
        }
      } else if (phraseFilled(sentence, segment.phrase, choices)) {
        add(segment.phrase);
      }
    });
  };
  add(sentence.segments);
  return parts
    .join('')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.])/g, '$1')
    .trim();
}

/** The body plan of the chosen creature, when the sentence has one. */
export function chosenBodyPlan(
  sentence: Sentence,
  choices: Choices
): BodyPlan | undefined {
  return wordFor(sentence, 'creature', choices.creature)?.bodyPlan;
}
