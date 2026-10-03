// The sentences a student builds from word chips on an explore image
// level, and the prompt text a filled sentence becomes. A sentence is a
// row of segments: fixed text, a slot that takes one word, or a phrase
// whose words show only when its slot is filled. A required slot must be
// filled before the sentence can generate.

import {BodyPlan, ImageSubject, ImageType} from '../../ai/images/types';

export interface Word {
  id: string;
  text: string;
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

const CREATURES: Word[] = [
  {id: 'blob', text: 'blob'},
  {id: 'robot', text: 'robot'},
  {id: 'dragon', text: 'dragon', bodyPlan: 'quadruped'},
  {id: 'cat', text: 'cat', bodyPlan: 'quadruped'},
  {id: 'monster', text: 'monster'},
  {id: 'wizard', text: 'wizard'},
  {id: 'penguin', text: 'penguin', bodyPlan: 'bird'},
  {id: 'witch', text: 'witch'},
];

const ADJECTIVES: Word[] = [
  {id: 'brave', text: 'brave'},
  {id: 'sparkly', text: 'sparkly'},
  {id: 'grumpy', text: 'grumpy'},
  {id: 'friendly', text: 'friendly'},
  {id: 'cute', text: 'cute'},
  {id: 'sleepy', text: 'sleepy'},
  {id: 'tiny', text: 'tiny'},
];

const CLOTHING: Word[] = [
  {id: 'hat', text: 'hat'},
  {id: 'crown', text: 'crown'},
  {id: 'cape', text: 'cape'},
  {id: 'scarf', text: 'scarf'},
  {id: 'boots', text: 'boots'},
  {id: 'glasses', text: 'glasses'},
];

const THINGS: Word[] = [
  {id: 'wand', text: 'wand'},
  {id: 'balloon', text: 'balloon'},
  {id: 'flower', text: 'flower'},
  {id: 'book', text: 'book'},
  {id: 'lantern', text: 'lantern'},
  {id: 'fish', text: 'fish'},
];

const DETAIL: Word[] = [
  {id: 'simple', text: 'simple shapes'},
  {id: 'some', text: 'some detail'},
  {id: 'lots', text: 'lots of detail'},
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
        {id: 'key', text: 'key'},
        {id: 'gem', text: 'gem'},
        {id: 'coin', text: 'coin'},
        {id: 'apple', text: 'apple'},
        {id: 'star', text: 'star'},
        {id: 'potion', text: 'potion'},
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
        {id: 'sunny', text: 'sunny'},
        {id: 'misty', text: 'misty'},
        {id: 'frozen', text: 'frozen'},
        {id: 'spooky', text: 'spooky'},
        {id: 'peaceful', text: 'peaceful'},
      ],
    },
    place: {
      id: 'place',
      label: 'place',
      words: [
        {id: 'forest', text: 'forest'},
        {id: 'cave', text: 'cave'},
        {id: 'beach', text: 'beach'},
        {id: 'castle', text: 'castle'},
        {id: 'city', text: 'city'},
        {id: 'space', text: 'space station'},
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
