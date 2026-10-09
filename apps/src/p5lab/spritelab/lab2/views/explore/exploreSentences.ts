// The sentences a student builds from word chips on an explore image
// level, and the prompt text a filled sentence becomes. A sentence is a
// row of segments: fixed text, a slot that takes one word, or a phrase
// whose words show only when its slot is filled. A required slot must be
// filled before the sentence can generate.

import {
  BodyPlan,
  ImageSubject,
  ImageType,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import manifestJson from '@cdo/static/spritelab_lab2/exploreSentences.json';

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
  /** Fixed words around a slot that form one phrase: dimmed while the
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

// The manifest: named word sets, and sentences whose slots name a set or
// carry their own words. Separate from the image dialog's adlib manifest.
interface ManifestSlot {
  label: string;
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
                `exploreSentences.json: sentence "${id}" slot "${slotId}" names an unknown word set "${slot.words}"`
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
['character', 'object', 'place'].forEach(id => {
  if (!SENTENCES[id]) {
    throw new Error(`exploreSentences.json: no "${id}" sentence`);
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
    console.warn(`exploreSentences.json has no "${sentenceId}" sentence`);
  }
  if (imageType === 'background') {
    return SENTENCES.place;
  }
  if (imageType === 'block' || imageType === 'ladder' || subject === 'object') {
    return SENTENCES.object;
  }
  return SENTENCES.character;
}

/** The slots in carousel order: the required ones first, then the rest,
    each group in the order the sentence reads them. */
export function slotsToOffer(sentence: Sentence): Slot[] {
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
  const slots = ids.map(id => sentence.slots[id]);
  return [...slots.filter(s => s.required), ...slots.filter(s => !s.required)];
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
 * The prompt text for the sentence: empty optional slots and unfilled
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
