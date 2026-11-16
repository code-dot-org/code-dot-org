// The sentences a student builds from word chips, on an image level or in
// the New image dialog, and the prompt text a filled sentence becomes. A
// sentence is a row of segments: fixed text, a slot that takes one word,
// or a phrase whose words show only when its slot is filled. A required
// slot must be filled before the sentence can generate.

import {EMPTY_WORD_ID} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageCache';
import {
  BodyPlan,
  ImageGenerationMetadata,
  ImageSubject,
  ImageType,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import manifestJson from '@cdo/static/spritelab_lab2/sentences.json';

export interface Word {
  id: string;
  text: string;
  /** Sent to the model in place of `text`, for a detail the student did not
      choose and should not be told they wrote, e.g. the witch's green skin. */
  modelFacingText?: string;
  /** A Font Awesome icon shown beside the text; decoration, not read aloud. */
  icon?: string;
  /** A plain color, shown as a dot beside the text in place of an icon. */
  color?: string;
  /** How a creature is built, for the character-set poses. */
  bodyPlan?: BodyPlan;
}

export interface Slot {
  id: string;
  /** Shown in the empty slot, e.g. "creature". */
  label: string;
  /** The kind of word the slot takes, shown as a heading above its words,
      e.g. "Noun". No heading is shown when this is not set. */
  heading?: string;
  words: Word[];
  required?: boolean;
}

export type Segment =
  | {text: string}
  | {slot: string}
  /** Fixed words around a slot that form one phrase: dimmed while the
      slot is empty, left out of the prompt. */
  | {phrase: Segment[]};

export interface Sentence {
  id: string;
  segments: Segment[];
  slots: Record<string, Slot>;
}

/**
 * The segments with a verb put in front, for showing the sentence to the
 * student: with the lead "Generate", "A cat" reads "Generate a cat". This is
 * for display only. The prompt sent to the model is built from the
 * sentence's own segments and does not include the verb.
 */
export function withLead(segments: Segment[], lead: string): Segment[] {
  const [first, ...rest] = segments;
  if (!first || !('text' in first)) {
    return [{text: `${lead} `}, ...segments];
  }
  const lowered = first.text.charAt(0).toLowerCase() + first.text.slice(1);
  return [{text: `${lead} ${lowered}`}, ...rest];
}

/** The word chosen for each slot, by slot id. */
export type Choices = Record<string, string | undefined>;

/** The drag payload's type: a JSON {slot, word} carried from a word chip. */
export const WORD_DRAG_TYPE = 'application/x-spritelab2-word';

// The manifest: named word sets, and sentences whose slots name a set or
// carry their own words.
interface ManifestSlot {
  label: string;
  heading?: string;
  words: string | Word[];
  required?: boolean;
}

interface Manifest {
  wordSets: Record<string, Word[]>;
  sentences: Record<
    string,
    {segments: Segment[]; slots: Record<string, ManifestSlot>}
  >;
}

function loadSentences(manifest: Manifest): Record<string, Sentence> {
  return Object.fromEntries(
    Object.entries(manifest.sentences).map(([id, entry]) => [
      id,
      {
        id,
        segments: entry.segments,
        slots: Object.fromEntries(
          Object.entries(entry.slots).map(([slotId, slot]) => {
            const words =
              typeof slot.words === 'string'
                ? manifest.wordSets[slot.words]
                : slot.words;
            if (!words) {
              throw new Error(
                `sentences.json: sentence "${id}" slot "${slotId}" names an unknown word set "${slot.words}"`
              );
            }
            return [slotId, {...slot, id: slotId, words}];
          })
        ),
      },
    ])
  );
}

const SENTENCES = loadSentences(manifestJson as Manifest);
// The sentences sentenceFor returns; a missing one fails at load.
['character', 'object', 'place', 'block'].forEach(id => {
  if (!SENTENCES[id]) {
    throw new Error(`sentences.json: no "${id}" sentence`);
  }
});

/** The level's sentence by id, else the one for what the level makes. A
    level naming a sentence the manifest lacks gets that one too. */
export function sentenceFor(
  imageType: ImageType,
  subject?: ImageSubject,
  sentenceId?: string
): Sentence {
  if (sentenceId) {
    if (SENTENCES[sentenceId]) {
      return SENTENCES[sentenceId];
    }
    console.warn(`sentences.json has no "${sentenceId}" sentence`);
  }
  if (imageType === 'background') {
    return SENTENCES.place;
  }
  if (imageType === 'block') {
    return SENTENCES.block;
  }
  if (subject === 'object') {
    return SENTENCES.object;
  }
  return SENTENCES.character;
}

/** The slot ids in the order the sentence reads them, phrases included. */
export function sentenceSlotIds(sentence: Sentence): string[] {
  const ids: string[] = [];
  const walk = (segments: Segment[]) =>
    segments.forEach(segment => {
      if ('slot' in segment) {
        ids.push(segment.slot);
      } else if ('phrase' in segment) {
        walk(segment.phrase);
      }
    });
  walk(sentence.segments);
  return ids;
}

/** The slots in carousel order: the required ones first, then the rest,
    each group in the order the sentence reads them. */
export function slotsToOffer(sentence: Sentence): Slot[] {
  const slots = sentenceSlotIds(sentence).map(id => sentence.slots[id]);
  return [...slots.filter(s => s.required), ...slots.filter(s => !s.required)];
}

/** The chosen word ids in the sentence's slot order. An optional slot left
    empty, or one in a phrase that is not filled, gives EMPTY_WORD_ID, since
    its word is left out of the prompt either way. */
export function sentenceWordIds(
  sentence: Sentence,
  choices: Choices
): string[] {
  const unfilledPhrases = new Set<string>();
  const walk = (segments: Segment[]) =>
    segments.forEach(segment => {
      if ('phrase' in segment) {
        if (!phraseFilled(sentence, segment.phrase, choices)) {
          segment.phrase.forEach(inner => {
            if ('slot' in inner) {
              unfilledPhrases.add(inner.slot);
            }
          });
        }
        walk(segment.phrase);
      }
    });
  walk(sentence.segments);
  return sentenceSlotIds(sentence).map(id => {
    const word = unfilledPhrases.has(id)
      ? undefined
      : wordFor(sentence, id, choices[id]);
    return word ? word.id : EMPTY_WORD_ID;
  });
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

/** The slots inside phrases, in sentence order: they open one after another
    and clear from the back, so a sentence is always a prefix of its phrases. */
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
 * Returns the plain string prompt for the sentence. When
 * useModelFacingTextVariant is false (which it normally is), the string is
 * just the adlibs the student chose, joined by the sentence's fixed text,
 * e.g. "A cat wearing a crown". When useModelFacingTextVariant is true, we
 * sub in each chosen word's `modelFacingText` (special text to prompt the
 * model for something the student didn't ask for, currently only used for
 * the witch) to get "A green-skinned witch" instead of just "A witch" (the
 * adlib the student sees).
 */
export function promptText(
  sentence: Sentence,
  choices: Choices,
  {
    useModelFacingTextVariant = false,
  }: {useModelFacingTextVariant?: boolean} = {}
): string {
  const parts: string[] = [];
  const add = (segments: Segment[]) => {
    segments.forEach(segment => {
      if ('text' in segment) {
        parts.push(segment.text);
      } else if ('slot' in segment) {
        const word = wordFor(sentence, segment.slot, choices[segment.slot]);
        if (word) {
          parts.push(
            (useModelFacingTextVariant && word.modelFacingText) || word.text
          );
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

/** Choices saved on an image: the sentence they were made in, and the
    word per slot, as the image's generation record stores them. */
export type SavedChoices = Pick<ImageGenerationMetadata, 'sentenceId'> & {
  choices: NonNullable<ImageGenerationMetadata['choices']>;
};

/**
 * Saved choices as this sentence can hold them now: a slot the sentence no
 * longer has, or a word its slot no longer offers, is dropped, and a
 * phrase's slots after a dropped one go with it, as clearing them would.
 * The sentence id is not checked: slots and words are matched by their
 * own ids, so a word set shared between sentences carries over.
 */
export function restoreChoices(
  sentence: Sentence,
  saved: SavedChoices | undefined
): Choices {
  if (!saved) {
    return {};
  }
  const restored: Choices = {};
  Object.entries(saved.choices).forEach(([slotId, wordId]) => {
    if (wordFor(sentence, slotId, wordId)) {
      restored[slotId] = wordId;
    }
  });
  const chained = chainedSlotIds(sentence);
  const firstMissing = chained.findIndex(id => !restored[id]);
  if (firstMissing >= 0) {
    chained.slice(firstMissing).forEach(id => {
      delete restored[id];
    });
  }
  return restored;
}

/**
 * Every generated image saves the text actually sent to the model, and
 * since the witch has a modelFacingText, that isn't always the ad lib the
 * student saw. This recreates the ad lib from the image's saved choices.
 * If those choices don't rebuild the saved text exactly (a typed prompt,
 * or a word list that's changed since), we fall back to the saved text.
 */
export function promptTextFromImage(
  generation: ImageGenerationMetadata
): string {
  const {sentenceId, choices, imageType, subject, prompt} = generation;
  if (!choices) {
    return prompt;
  }
  const sentence = sentenceFor(imageType, subject, sentenceId);
  const restored = restoreChoices(sentence, {sentenceId, choices});
  const sent = promptText(sentence, restored, {
    useModelFacingTextVariant: true,
  });
  return sent === prompt ? promptText(sentence, restored) : prompt;
}

/** The body plan of the chosen creature, when the sentence has one. */
export function chosenBodyPlan(
  sentence: Sentence,
  choices: Choices
): BodyPlan | undefined {
  return wordFor(sentence, 'creature', choices.creature)?.bodyPlan;
}
