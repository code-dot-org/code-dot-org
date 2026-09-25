// Prints one JSON line per image job: every combo of every adlib in the
// Sprite Lab image manifest, in each style, and, for characters, as an
// animated set. generate_images runs this with `npx tsx` and reads stdout.
//
// Only pure modules may be imported from apps/ (no @cdo aliases, no DOM).

import manifest from '../../../../apps/static/spritelab_lab2/imageAdlibManifest.json';
import {
  basePrompt,
  posedFrames,
  posePrompt,
} from '../../../../apps/src/p5lab/spritelab/lab2/ai/images/characterSetPrompts';
import {
  fullPromptFor,
  logicalGridFor,
  pixelBlockFor,
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
type Adlib = {template: string; options: {[slot: string]: Option[]}};

const STYLES: ImageStyle[] = ['pixel', 'smooth'];

interface Frame {
  /** null for a single image; the strip pose for a set's frame. */
  pose: string | null;
  prompt: string;
  /** The pose whose image this frame's request sends as a reference. */
  reference: string | null;
}

// The inverse of imageAdlibId() in imageAdlibs.ts.
function kindOf(adlibId: string): {
  imageType: ImageType;
  subject: ImageSubject | null;
  set: string;
} {
  const [kind, set] = adlibId.split('-');
  if (kind === 'object') {
    return {imageType: 'sprite', subject: 'object', set};
  }
  return {
    imageType: kind as ImageType,
    subject: kind === 'sprite' ? 'character' : null,
    set,
  };
}

function* product(lists: Option[][]): Generator<Option[]> {
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

// Mirrors Adlib.tsx: one replacement per slot, English text.
function fill(template: string, slots: string[], combo: Option[]): string {
  return slots.reduce(
    (text, slot, i) => text.replace(`{${slot}}`, combo[i].text),
    template
  );
}

// Mirrors bodyPlanFor() in imageAdlibs.ts: the creature choice's plan, if
// it names a known one, else upright.
function bodyPlanOf(slots: string[], combo: Option[]): BodyPlan {
  const plan = combo[slots.indexOf('creature')]?.bodyPlan;
  return BODY_PLANS.includes(plan as BodyPlan) ? (plan as BodyPlan) : 'upright';
}

const adlibs = (manifest as {adlibs: {[id: string]: Adlib}}).adlibs;

for (const [adlibId, adlib] of Object.entries(adlibs)) {
  const {imageType, subject, set} = kindOf(adlibId);
  const slots = Object.keys(adlib.options);
  for (const combo of product(slots.map(slot => adlib.options[slot]))) {
    const prompt = fill(adlib.template, slots, combo);
    for (const style of STYLES) {
      const record = {
        adlibId,
        set,
        imageType,
        subject,
        slots,
        choiceIds: combo.map(option => option.id),
        prompt,
        style,
      };
      const pixelBlock = pixelBlockFor(imageType);
      const single: Frame[] = [
        {
          pose: null,
          prompt: fullPromptFor(prompt, {
            imageType,
            ...(subject && {subject}),
            style,
          }),
          reference: null,
        },
      ];
      console.log(
        JSON.stringify({
          ...record,
          animated: false,
          pixelGrid: style === 'pixel' ? logicalGridFor(pixelBlock) : null,
          frames: single,
        })
      );

      if (subject !== 'character') {
        continue;
      }
      // generateCharacterSet() always asks for the sprite default grid.
      const setBlock = pixelBlockFor('sprite');
      const key = chooseKeyColor(prompt);
      const bodyPlan = bodyPlanOf(slots, combo);
      const frames: Frame[] = [
        {
          pose: 'base',
          prompt: basePrompt(prompt, style, key, setBlock, bodyPlan),
          reference: null,
        },
        ...posedFrames(bodyPlan).map(frame => ({
          pose: frame.label,
          prompt: posePrompt(prompt, frame, style, key, setBlock),
          reference: 'base',
        })),
      ];
      console.log(
        JSON.stringify({
          ...record,
          animated: true,
          pixelGrid: style === 'pixel' ? logicalGridFor(setBlock) : null,
          keyColor: key.hex,
          bodyPlan,
          frames,
        })
      );
    }
  }
}
