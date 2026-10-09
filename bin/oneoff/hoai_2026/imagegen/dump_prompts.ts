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
  source: 'adlib' | 'explore',
  jobId: string,
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

function dumpAdlibs(): void {
  const adlibs = (adlibManifest as {adlibs: {[id: string]: Adlib}}).adlibs;
  for (const [adlibId, adlib] of Object.entries(adlibs)) {
    const kind = adlibKind(adlibId);
    const slots = Object.keys(adlib.options);
    for (const combo of product(slots.map(slot => adlib.options[slot]))) {
      const prompt = fillTemplate(adlib.template, slots, combo);
      const bodyPlan = bodyPlanOf(combo[slots.indexOf('creature')]);
      // The dialog's animation checkbox: a character is offered both ways.
      const kinds = canAnimate(kind)
        ? [kind, {...kind, animated: true}]
        : [kind];
      for (const style of STYLES) {
        for (const each of kinds) {
          emit(
            'adlib',
            adlibId,
            each,
            slots,
            combo.map(option => option.id),
            prompt,
            style,
            bodyPlan,
          );
        }
      }
    }
  }
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

function dumpExploreSentences(): void {
  const manifest = exploreManifest as ExploreManifest;
  for (const [sentenceId, sentence] of Object.entries(manifest.sentences)) {
    const kind = SENTENCE_KINDS[sentenceId];
    if (!kind) {
      throw new Error(
        `exploreSentences.json has a "${sentenceId}" sentence this script has no kind for`,
      );
    }
    const slots = Object.keys(sentence.slots);
    // Every slot's words, and for an optional slot the empty choice too: a
    // student can generate without filling it.
    const choices = slots.map(id => {
      const slot = sentence.slots[id];
      const words =
        typeof slot.words === 'string'
          ? manifest.wordSets[slot.words]
          : slot.words;
      if (!words) {
        throw new Error(
          `exploreSentences.json: sentence "${sentenceId}" slot "${id}" names an unknown word set "${slot.words}"`,
        );
      }
      return slot.required ? words : [undefined, ...words];
    });
    for (const combo of product(choices)) {
      const chosen: {[slot: string]: Option | undefined} = {};
      slots.forEach((id, i) => (chosen[id] = combo[i]));
      const prompt = sentencePrompt(sentence.segments, chosen);
      const bodyPlan = bodyPlanOf(chosen.creature);
      for (const style of STYLES) {
        emit(
          'explore',
          sentenceId,
          kind,
          slots,
          combo.map(option => option?.id ?? NO_CHOICE),
          prompt,
          style,
          bodyPlan,
        );
      }
    }
  }
}

dumpAdlibs();
dumpExploreSentences();
