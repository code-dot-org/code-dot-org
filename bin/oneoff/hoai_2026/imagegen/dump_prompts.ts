// Prints one JSON line per image job: every way a student can fill each
// sentence the lab offers, and the prompts the lab would send for it.
// generate_images runs this with `npx tsx` and reads stdout.
//
// The words come from the sentences.json beside this script, a pinned copy
// of the lab's apps/static/spritelab_lab2/sentences.json: a cached image's
// path is its word ids, so the words the cache was drawn from must not move
// under it. A copy that differs from the lab's is reported on stderr.
//
// With --catalog it prints one line per sentence describing its slots and
// words instead; with --safety, the safety judges' instructions.
//
// Only pure modules may be imported from apps/ (no @cdo aliases, no DOM).

import * as fs from 'fs';
import * as path from 'path';

import {
  IMAGE_SAFETY_PROMPT,
  TEXT_SAFETY_PROMPT,
} from '../../../../apps/src/aichat/api/client/helpers/safetyPrompts';
import {
  basePrompt,
  posedFrames,
  posePrompt,
} from '../../../../apps/src/p5lab/spritelab/lab2/ai/images/characterSetPrompts';
import {
  canBeTransparent,
  fullPromptFor,
  logicalGridFor,
  pixelBlockFor,
  PromptOptions,
} from '../../../../apps/src/p5lab/spritelab/lab2/ai/images/imagePrompts';
import {chooseKeyColor} from '../../../../apps/src/p5lab/spritelab/lab2/ai/images/keyColor';
import {
  BODY_PLANS,
  BodyPlan,
  ImageStyle,
  ImageSubject,
  ImageType,
} from '../../../../apps/src/p5lab/spritelab/lab2/ai/images/types';

const LAB_SENTENCES = path.join(
  __dirname,
  '../../../../apps/static/spritelab_lab2/sentences.json',
);

// Every picture the sentence layout makes is pixel art (STYLE in
// SentenceScene.tsx).
const STYLES: ImageStyle[] = ['pixel'];

/** Stands in a path for a slot whose word the prompt leaves out, as
    EMPTY_WORD_ID does in imageCache.ts. */
const EMPTY_WORD_ID = '_';

/** What a sentence makes. The lab picks a sentence by the image it is
    making (sentenceFor in sentences.ts), so these four are the ones a
    student can reach; any other sentence in the file is unused. */
interface Kind {
  imageType: ImageType;
  subject?: ImageSubject;
  /** A character set of five pictures; SentenceScene animates every
      character. */
  animated: boolean;
}

const SENTENCE_KINDS: {[sentenceId: string]: Kind} = {
  character: {imageType: 'sprite', subject: 'character', animated: true},
  object: {imageType: 'sprite', subject: 'object', animated: false},
  place: {imageType: 'background', animated: false},
  block: {imageType: 'block', animated: false},
};

type Word = {id: string; text: string; bodyPlan?: string};
type Segment = {text: string} | {slot: string} | {phrase: Segment[]};
type ManifestSlot = {label: string; words: string | Word[]; required?: boolean};
type Manifest = {
  wordSets: {[name: string]: Word[]};
  sentences: {
    [id: string]: {segments: Segment[]; slots: {[id: string]: ManifestSlot}};
  };
};

interface Slot {
  id: string;
  label: string;
  required: boolean;
  words: Word[];
}

interface Sentence {
  id: string;
  kind: Kind;
  segments: Segment[];
  /** In the order the sentence reads them (sentenceSlotIds). */
  slots: Slot[];
}

/** One request: a single picture, or one frame of a set. */
interface Frame {
  /** 'single' for one picture; 'base' or a pose label in a set, as
      CachedFrame names them in imageCache.ts. */
  name: string;
  /** What the lab sends: a key-colour background it erases afterwards. */
  prompt: string;
  /** The same, asking for an alpha background; null for a background. */
  transparentPrompt: string | null;
  /** The frame whose image this frame's request sends as a reference. */
  reference: string | null;
}

type Chosen = {[slot: string]: Word | undefined};

function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

// A word id is a folder in every cached picture's path, so it is lowercase
// letters and digits only: "outer space" is outerspace.
const WORD_ID = /^[a-z0-9]+$/;

/** Mirrors sentenceSlotIds() in sentences.ts. */
function slotIdsInOrder(segments: Segment[]): string[] {
  const ids: string[] = [];
  const walk = (list: Segment[]) =>
    list.forEach(segment => {
      if ('slot' in segment) {
        ids.push(segment.slot);
      } else if ('phrase' in segment) {
        walk(segment.phrase);
      }
    });
  walk(segments);
  return ids;
}

function sentencesFrom(manifest: Manifest): Sentence[] {
  return Object.entries(SENTENCE_KINDS).map(([id, kind]) => {
    const entry = manifest.sentences[id];
    if (!entry) {
      throw new Error(`sentences.json has no "${id}" sentence`);
    }
    return {
      id,
      kind,
      segments: entry.segments,
      slots: slotIdsInOrder(entry.segments).map(slotId => {
        const slot = entry.slots[slotId];
        const words =
          typeof slot?.words === 'string'
            ? manifest.wordSets[slot.words]
            : slot?.words;
        if (!words) {
          throw new Error(
            `sentences.json: sentence "${id}" slot "${slotId}" has no words`,
          );
        }
        const bad = words.filter(word => !WORD_ID.test(word.id));
        if (bad.length) {
          throw new Error(
            `sentences.json: sentence "${id}" slot "${slotId}" has word ids ` +
              `that are not lowercase letters and digits: ` +
              bad.map(word => JSON.stringify(word.id)).join(', '),
          );
        }
        return {
          id: slotId,
          label: slot.label,
          required: !!slot.required,
          words,
        };
      }),
    };
  });
}

function phraseFilled(phrase: Segment[], chosen: Chosen): boolean {
  return phrase.every(
    segment => !('slot' in segment) || !!chosen[segment.slot],
  );
}

/** Mirrors promptText() in sentences.ts: an empty optional slot and the
    phrase around it drop out, and the gaps they leave close up. */
function promptText(segments: Segment[], chosen: Chosen): string {
  const parts: string[] = [];
  const add = (list: Segment[]) =>
    list.forEach(segment => {
      if ('text' in segment) {
        parts.push(segment.text);
      } else if ('slot' in segment) {
        const word = chosen[segment.slot];
        if (word) {
          parts.push(word.text);
        }
      } else if (phraseFilled(segment.phrase, chosen)) {
        add(segment.phrase);
      }
    });
  add(segments);
  return parts
    .join('')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.])/g, '$1')
    .trim();
}

/** Mirrors sentenceWordIds() in sentences.ts: a slot whose word the prompt
    leaves out, empty or in an unfilled phrase, is EMPTY_WORD_ID. */
function wordIds(sentence: Sentence, chosen: Chosen): string[] {
  const unfilled = new Set<string>();
  const walk = (list: Segment[]) =>
    list.forEach(segment => {
      if ('phrase' in segment) {
        if (!phraseFilled(segment.phrase, chosen)) {
          segment.phrase.forEach(inner => {
            if ('slot' in inner) {
              unfilled.add(inner.slot);
            }
          });
        }
        walk(segment.phrase);
      }
    });
  walk(sentence.segments);
  return sentence.slots.map(slot =>
    !unfilled.has(slot.id) && chosen[slot.id]
      ? (chosen[slot.id] as Word).id
      : EMPTY_WORD_ID,
  );
}

function* product<T>(lists: T[][]): Generator<T[]> {
  if (lists.length === 0) {
    yield [];
    return;
  }
  const [first, ...rest] = lists;
  for (const option of first) {
    for (const tail of product(rest)) {
      yield [option, ...tail];
    }
  }
}

/** Mirrors chosenBodyPlan() in sentences.ts, with generateCharacterSet()'s
    default of upright for a creature that names none. */
function bodyPlanOf(chosen: Chosen): BodyPlan {
  const plan = chosen.creature?.bodyPlan;
  return BODY_PLANS.includes(plan as BodyPlan) ? (plan as BodyPlan) : 'upright';
}

/** The requests one filled sentence makes, as SentenceScene makes them: a
    subject only on a sprite, and pixel style at the type's default grid. */
function framesFor(
  prompt: string,
  {imageType, subject, animated}: Kind,
  style: ImageStyle,
  bodyPlan: BodyPlan,
): {frames: Frame[]; keyColor?: string} {
  const pixelBlock = pixelBlockFor(imageType);
  const options: PromptOptions = {
    imageType,
    ...(imageType === 'sprite' && {subject: subject ?? 'character'}),
    style,
    ...(style === 'pixel' && {pixelGrid: logicalGridFor(pixelBlock)}),
  };
  if (!animated) {
    return {
      frames: [
        {
          name: 'single',
          prompt: fullPromptFor(prompt, options),
          transparentPrompt: canBeTransparent(imageType)
            ? fullPromptFor(prompt, {...options, transparent: true})
            : null,
          reference: null,
        },
      ],
    };
  }
  const key = chooseKeyColor(prompt);
  return {
    keyColor: key.hex,
    frames: [
      {
        name: 'base',
        prompt: basePrompt(prompt, style, key, pixelBlock, bodyPlan),
        transparentPrompt: basePrompt(
          prompt,
          style,
          null,
          pixelBlock,
          bodyPlan,
        ),
        reference: null,
      },
      ...posedFrames(bodyPlan).map(frame => ({
        name: frame.label,
        prompt: posePrompt(prompt, frame, style, key, pixelBlock),
        transparentPrompt: posePrompt(prompt, frame, style, null, pixelBlock),
        reference: 'base',
      })),
    ],
  };
}

function dumpJobs(sentence: Sentence): void {
  // Two fillings that leave out the same words are one path and one prompt.
  const seen = new Set<string>();
  const choices = sentence.slots.map(slot =>
    slot.required ? slot.words : [undefined, ...slot.words],
  );
  for (const combo of product<Word | undefined>(choices)) {
    const chosen: Chosen = {};
    sentence.slots.forEach((slot, i) => (chosen[slot.id] = combo[i]));
    const ids = wordIds(sentence, chosen);
    if (seen.has(ids.join('/'))) {
      continue;
    }
    seen.add(ids.join('/'));
    const prompt = promptText(sentence.segments, chosen);
    const bodyPlan = bodyPlanOf(chosen);
    for (const style of STYLES) {
      const {frames, keyColor} = framesFor(
        prompt,
        sentence.kind,
        style,
        bodyPlan,
      );
      console.log(
        JSON.stringify({
          sentenceId: sentence.id,
          imageType: sentence.kind.imageType,
          subject: sentence.kind.subject ?? null,
          animated: sentence.kind.animated,
          slots: sentence.slots.map(slot => slot.id),
          wordIds: ids,
          prompt,
          style,
          transparent: canBeTransparent(sentence.kind.imageType),
          pixelGrid:
            style === 'pixel'
              ? logicalGridFor(pixelBlockFor(sentence.kind.imageType))
              : null,
          ...(keyColor && {keyColor}),
          ...(sentence.kind.animated && {bodyPlan}),
          frames,
        }),
      );
    }
  }
}

/** One line per sentence: its slots and the words each offers. */
function dumpCatalog(sentence: Sentence): void {
  console.log(
    JSON.stringify({
      sentenceId: sentence.id,
      imageType: sentence.kind.imageType,
      subject: sentence.kind.subject ?? null,
      animated: sentence.kind.animated,
      example: promptText(
        sentence.segments,
        Object.fromEntries(
          sentence.slots.map(slot => [slot.id, slot.words[0]]),
        ),
      ),
      slots: sentence.slots.map(slot => ({
        id: slot.id,
        label: slot.label,
        required: slot.required,
        words: slot.words.map(word => ({id: word.id, text: word.text})),
      })),
    }),
  );
}

if (process.argv.includes('--safety')) {
  console.log(
    JSON.stringify({text: TEXT_SAFETY_PROMPT, image: IMAGE_SAFETY_PROMPT}),
  );
  process.exit(0);
}

const sentencesFile =
  argValue('--sentences') ?? path.join(__dirname, 'sentences.json');
const manifest = JSON.parse(fs.readFileSync(sentencesFile, 'utf8'));
if (
  fs.existsSync(LAB_SENTENCES) &&
  JSON.stringify(manifest) !==
    JSON.stringify(JSON.parse(fs.readFileSync(LAB_SENTENCES, 'utf8')))
) {
  console.error(
    `Note: ${path.basename(sentencesFile)} differs from the lab's ` +
      `sentences.json; cache paths follow ${path.basename(sentencesFile)}.`,
  );
}

const dump = process.argv.includes('--catalog') ? dumpCatalog : dumpJobs;
sentencesFrom(manifest as Manifest).forEach(dump);
