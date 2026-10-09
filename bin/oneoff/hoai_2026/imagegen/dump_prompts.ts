// Prints one JSON line per image job: every choice combination a student
// can make on an image level, in each style, and, for characters, as an
// animated set. generate_images runs this with `npx tsx` and reads stdout.
//
// Two sources, because the lab has two image UIs:
//
//   adlib    the image dialog's sentence with dropdowns, from
//            imageAdlibManifest.json. Free play, and any level whose
//            level_mode.imageUi is not 'explore'.
//   explore  the explore layout's word chips, from exploreSentences.json.
//            The hoai2026-dev image levels, which set imageUi 'explore'.
//
// With --catalog it prints one line per sentence describing its slots and
// words instead, which is what generate_images --list-words shows.
//
// Only pure modules may be imported from apps/ (no @cdo aliases, no DOM).

import adlibManifest from '../../../../apps/static/spritelab_lab2/imageAdlibManifest.json';
import exploreManifest from '../../../../apps/static/spritelab_lab2/exploreSentences.json';
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

type Option = {id: string; text: string; bodyPlan?: string};

const STYLES: ImageStyle[] = ['pixel', 'smooth'];

/** The choice id an empty optional slot gets in a job's path. No word id is
    this word, and none holds a dot, so a dotted stem stays unambiguous. */
const NO_CHOICE = 'none';

interface Frame {
  /** null for a single image; the strip pose for a set's frame. */
  pose: string | null;
  /** What the lab sends: a key-color background it erases afterwards. */
  prompt: string;
  /** The same, asking for an alpha background; null for a background. */
  transparentPrompt: string | null;
  /** The pose whose image this frame's request sends as a reference. */
  reference: string | null;
}

/** What a job draws: one picture, or, when animated, a five-picture
    character set. The explore layout animates every character; the dialog
    offers it as a checkbox, so an adlib character is dumped both ways. */
interface Kind {
  imageType: ImageType;
  subject?: ImageSubject;
  animated: boolean;
}

function kindOf(
  imageType: ImageType,
  subject?: ImageSubject,
  animated = false,
): Kind {
  return {imageType, ...(subject && {subject}), animated};
}

/** Whether this kind can also be drawn as a character set. */
function canAnimate({imageType, subject}: Kind): boolean {
  return imageType === 'sprite' && subject === 'character';
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

/** Mirrors bodyPlanFor() in imageAdlibs.ts and chosenBodyPlan() in
    exploreSentences.ts: the creature choice's plan, else upright. */
function bodyPlanOf(creature: Option | undefined): BodyPlan {
  const plan = creature?.bodyPlan;
  return BODY_PLANS.includes(plan as BodyPlan) ? (plan as BodyPlan) : 'upright';
}

/** One slot a student fills, and the words it offers. */
interface SlotSpec {
  id: string;
  label: string;
  /** An optional slot can be left empty; see NO_CHOICE. */
  required: boolean;
  words: Option[];
}

/** One sentence a student can build, from either UI. */
interface Spec {
  source: 'adlib' | 'explore';
  jobId: string;
  kind: Kind;
  slots: SlotSpec[];
  /** The student-visible prompt for one set of choices. */
  prompt: (chosen: {[slot: string]: Option | undefined}) => string;
}

/** The frames one job asks for: one picture, or a set's base and poses. */
function framesFor(
  prompt: string,
  {imageType, subject, animated}: Kind,
  style: ImageStyle,
  bodyPlan: BodyPlan,
): {frames: Frame[]; keyColor?: string} {
  // As both views build them: a subject only on a sprite, and pixel style
  // at the type's default grid.
  const pixelBlock = pixelBlockFor(imageType);
  const options: PromptOptions = {
    imageType,
    ...(subject && {subject}),
    style,
    ...(style === 'pixel' && {pixelGrid: logicalGridFor(pixelBlock)}),
  };
  if (!animated) {
    return {
      frames: [
        {
          pose: null,
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
        pose: 'base',
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
        pose: frame.label,
        prompt: posePrompt(prompt, frame, style, key, pixelBlock),
        transparentPrompt: posePrompt(prompt, frame, style, null, pixelBlock),
        reference: 'base',
      })),
    ],
  };
}

function emit(
  {source, jobId}: Spec,
  kind: Kind,
  slots: string[],
  choiceIds: string[],
  prompt: string,
  style: ImageStyle,
  bodyPlan: BodyPlan,
): void {
  const {frames, keyColor} = framesFor(prompt, kind, style, bodyPlan);
  console.log(
    JSON.stringify({
      source,
      jobId,
      imageType: kind.imageType,
      subject: kind.subject ?? null,
      slots,
      choiceIds,
      prompt,
      style,
      transparent: canBeTransparent(kind.imageType),
      animated: kind.animated,
      pixelGrid:
        style === 'pixel'
          ? logicalGridFor(pixelBlockFor(kind.imageType))
          : null,
      ...(keyColor && {keyColor}),
      ...(kind.animated && {bodyPlan}),
      frames,
    }),
  );
}

// ---- adlib: the image dialog -----------------------------------------

type Adlib = {template: string; options: {[slot: string]: Option[]}};

// The inverse of imageAdlibId() in imageAdlibs.ts.
function adlibKind(adlibId: string): Kind {
  const [name] = adlibId.split('-');
  if (name === 'object') {
    return kindOf('sprite', 'object');
  }
  return kindOf(name as ImageType, name === 'sprite' ? 'character' : undefined);
}

// Mirrors Adlib.tsx: one replacement per slot, English text.
function fillTemplate(
  template: string,
  slots: string[],
  combo: Option[],
): string {
  return slots.reduce(
    (text, slot, i) => text.replace(`{${slot}}`, combo[i].text),
    template,
  );
}

/** Every adlib set in the manifest. Each slot is a dropdown the student
    must pick from, so none is optional. */
function adlibSpecs(): Spec[] {
  const adlibs = (adlibManifest as {adlibs: {[id: string]: Adlib}}).adlibs;
  return Object.entries(adlibs).map(([adlibId, adlib]) => {
    const slotIds = Object.keys(adlib.options);
    return {
      source: 'adlib',
      jobId: adlibId,
      kind: adlibKind(adlibId),
      slots: slotIds.map(id => ({
        id,
        label: id,
        required: true,
        words: adlib.options[id],
      })),
      prompt: chosen =>
        fillTemplate(
          adlib.template,
          slotIds,
          slotIds.map(id => chosen[id] as Option),
        ),
    };
  });
}

// ---- explore: the word-chip sentence ---------------------------------

type Segment = {text: string} | {slot: string} | {phrase: Segment[]};
type ManifestSlot = {
  label: string;
  words: string | Option[];
  required?: boolean;
};
type ExploreManifest = {
  wordSets: {[name: string]: Option[]};
  sentences: {
    [id: string]: {segments: Segment[]; slots: {[id: string]: ManifestSlot}};
  };
};

// What each sentence makes. The hoai2026-dev explore levels name the first
// six in level_mode.sentence; sentenceFor() in exploreSentences.ts falls
// back to 'object' and 'place' by image type, so both are reachable too.
const SENTENCE_KINDS: {[id: string]: Kind} = {
  character: kindOf('sprite', 'character', true),
  friend: kindOf('sprite', 'character', true),
  treasure: kindOf('sprite', 'object'),
  block: kindOf('block'),
  'place-time': kindOf('background'),
  'place-detail': kindOf('background'),
  object: kindOf('sprite', 'object'),
  place: kindOf('background'),
};

/** Mirrors promptText() in exploreSentences.ts: an empty optional slot and
    the phrase around it drop out, and the gaps they leave close up. */
function sentencePrompt(
  segments: Segment[],
  chosen: {[slot: string]: Option | undefined},
): string {
  const parts: string[] = [];
  const phraseFilled = (phrase: Segment[]): boolean =>
    phrase.every(segment => !('slot' in segment) || !!chosen[segment.slot]);
  const add = (list: Segment[]) =>
    list.forEach(segment => {
      if ('text' in segment) {
        parts.push(segment.text);
      } else if ('slot' in segment) {
        const word = chosen[segment.slot];
        if (word) {
          parts.push(word.text);
        }
      } else if (phraseFilled(segment.phrase)) {
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

/** Every sentence in the explore manifest. */
function exploreSpecs(): Spec[] {
  const manifest = exploreManifest as ExploreManifest;
  return Object.entries(manifest.sentences).map(([sentenceId, sentence]) => {
    const kind = SENTENCE_KINDS[sentenceId];
    if (!kind) {
      throw new Error(
        `exploreSentences.json has a "${sentenceId}" sentence this script has no kind for`,
      );
    }
    return {
      source: 'explore',
      jobId: sentenceId,
      kind,
      slots: Object.entries(sentence.slots).map(([id, slot]) => {
        const words =
          typeof slot.words === 'string'
            ? manifest.wordSets[slot.words]
            : slot.words;
        if (!words) {
          throw new Error(
            `exploreSentences.json: sentence "${sentenceId}" slot "${id}" names an unknown word set "${slot.words}"`,
          );
        }
        return {id, label: slot.label, required: !!slot.required, words};
      }),
      prompt: chosen => sentencePrompt(sentence.segments, chosen),
    };
  });
}

// ---- output ----------------------------------------------------------

function dumpJobs(spec: Spec): void {
  const slotIds = spec.slots.map(slot => slot.id);
  // An optional slot's words, and the empty choice too: a student can
  // generate without filling it.
  const choices = spec.slots.map(slot =>
    slot.required ? slot.words : [undefined, ...slot.words],
  );
  for (const combo of product(choices)) {
    const chosen: {[slot: string]: Option | undefined} = {};
    slotIds.forEach((id, i) => (chosen[id] = combo[i]));
    const prompt = spec.prompt(chosen);
    const bodyPlan = bodyPlanOf(chosen.creature);
    // The dialog's animation checkbox: a character is offered both ways.
    // An explore character is already animated, so this adds nothing.
    const kinds =
      canAnimate(spec.kind) && !spec.kind.animated
        ? [spec.kind, {...spec.kind, animated: true}]
        : [spec.kind];
    for (const style of STYLES) {
      for (const kind of kinds) {
        emit(
          spec,
          kind,
          slotIds,
          combo.map(option => option?.id ?? NO_CHOICE),
          prompt,
          style,
          bodyPlan,
        );
      }
    }
  }
}

/** One line per sentence: its slots and the words each offers. */
function dumpCatalog(spec: Spec): void {
  console.log(
    JSON.stringify({
      source: spec.source,
      jobId: spec.jobId,
      imageType: spec.kind.imageType,
      subject: spec.kind.subject ?? null,
      animated: spec.kind.animated,
      example: spec.prompt(
        Object.fromEntries(spec.slots.map(slot => [slot.id, slot.words[0]])),
      ),
      slots: spec.slots.map(slot => ({
        id: slot.id,
        label: slot.label,
        required: slot.required,
        words: slot.words.map(word => ({id: word.id, text: word.text})),
      })),
    }),
  );
}

const specs = [...adlibSpecs(), ...exploreSpecs()];
const dump = process.argv.includes('--catalog') ? dumpCatalog : dumpJobs;
specs.forEach(dump);
