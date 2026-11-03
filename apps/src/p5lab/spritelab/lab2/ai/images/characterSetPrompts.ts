// The text a character set sends the image model, kept free of browser and
// bundler dependencies like imagePrompts.ts, for the same batch script.

import {NO_WRITING_CLAUSE, styleClause} from './imagePrompts';
import {KeyColor} from './keyColor';
import {BodyPlan, ImageStyle} from './types';

/** One frame of the strip after the base: its label and pose description. */
export interface PosedFrame {
  label: string;
  pose: string;
}

// The base picture's stance, by body plan. An animal described only by
// its name comes back standing like a person; the stance says otherwise.
const STANCE: Record<BodyPlan, string> = {
  upright:
    'Arms hanging relaxed at the sides, hands open and empty. Feet near ' +
    'the bottom of the image, nothing cut off.',
  quadruped:
    'A real animal on all four legs, the whole body in side profile with ' +
    'the head toward the right. Not a person and not person-shaped: it ' +
    'does not stand upright and has no arms or hands. Paws near the ' +
    'bottom of the image, nothing cut off.',
  bird:
    'A real bird standing on its two legs with its wings held at its ' +
    'sides, seen from the side with the beak toward the right. No arms or ' +
    'hands. Feet near the bottom of the image, nothing cut off.',
};

const IDLE_FRAME: PosedFrame = {
  label: 'idling',
  pose:
    'a second idle frame: the very same standing pose with only a subtle ' +
    'change — a small breath, the head or shoulders shifted a touch. The ' +
    'feet do not move',
};

// The frames drawn from the base, by body plan. Each pose text is sent as
// an edit request together with the base picture, so it describes only
// what changes from the base. List order is strip order, except that the
// base itself is inserted after the first entry (CHARACTER_STRIP_POSES).
// Every plan has the same four frames, so the strip's layout is one.
const POSED_FRAMES: Record<BodyPlan, PosedFrame[]> = {
  upright: [
    IDLE_FRAME,
    {
      label: 'walking',
      pose:
        'halfway through a walking stride, seen from the side — mainly the ' +
        'legs moving, one leg forward and one back, the arms swinging ' +
        'slightly',
    },
    {
      label: 'jumping',
      pose:
        'the rising frame of a jump: knees bent and tucked, body springing ' +
        'upward',
    },
    {
      label: 'landing',
      pose:
        'the falling frame of a jump: body upright in the air, legs loose ' +
        'beneath it, coming down',
    },
  ],
  quadruped: [
    IDLE_FRAME,
    {
      label: 'walking',
      pose:
        'halfway through a walking stride on all four legs, seen from the ' +
        'side — the front and back legs in motion, one of each pair forward ' +
        'and one back, the body still on four legs',
    },
    {
      label: 'jumping',
      pose:
        'the rising frame of a leap on four legs: hind legs pushing off, ' +
        'front legs reaching forward, body springing upward',
    },
    {
      label: 'landing',
      pose:
        'the falling frame of a leap: body level in the air on four legs, ' +
        'legs reaching down toward the ground, coming down',
    },
  ],
  bird: [
    IDLE_FRAME,
    {
      label: 'walking',
      pose:
        'halfway through a waddling step, seen from the side — one foot ' +
        'forward and one back, the wings held at its sides',
    },
    {
      label: 'jumping',
      pose:
        'the rising frame of a hop: legs tucked, wings lifted a little, ' +
        'body springing upward',
    },
    {
      label: 'landing',
      pose:
        'the falling frame of a hop: body upright in the air, legs ' +
        'reaching down, wings out a little, coming down',
    },
  ],
};

/** How many pictures a set costs: the base and each posed frame. */
export const CHARACTER_SET_PICTURE_COUNT = 1 + POSED_FRAMES.upright.length;

// Each frame is drawn on its own, so a companion or prop the model adds to
// one frame has no reason to recur in the next.
const ONLY_THIS_CHARACTER =
  'Only this one character, alone: no other creatures, people, pets, objects or companions, and nothing added that is not part of the character itself.';

// For a model that can emit an alpha channel, in place of a key colour.
const TRANSPARENT_CLAUSE =
  'Use a fully transparent background — no scenery, no ground, and no shadow under the character. Only the character.';

/** The one flat colour every frame is drawn on, keyed out afterwards; null
    asks for a transparent background instead. */
function keyClause(key: KeyColor | null): string {
  if (!key) {
    return TRANSPARENT_CLAUSE;
  }
  return `Use a plain, solid, flat background of exactly one color, ${key.name} (${key.hex}), filling the image to every edge — no gradient, no scenery, no ground, and no shadow under the character. Only the character on that flat ${key.name}. The character itself must contain no ${key.name} or anything close to it anywhere — not on clothes, hat, hair, skin or accessories; choose other colors for those.`;
}

/**
 * The prompt for the base frame: the whole character, standing, facing
 * right — the picture every other frame is drawn from.
 */
export function basePrompt(
  prompt: string,
  style: ImageStyle,
  key: KeyColor | null,
  pixelBlock: number,
  bodyPlan: BodyPlan = 'upright'
): string {
  return (
    `${prompt}. Show the whole character standing, facing right: its face ` +
    `and body point toward the right side of the image. ${STANCE[bodyPlan]} ` +
    `${ONLY_THIS_CHARACTER} ${styleClause(style, pixelBlock)} ${keyClause(
      key
    )} ` +
    NO_WRITING_CLAUSE
  );
}

/** The posed frames a set of this body plan draws, in strip order. */
export function posedFrames(bodyPlan: BodyPlan = 'upright'): PosedFrame[] {
  return POSED_FRAMES[bodyPlan];
}

/**
 * The prompt for one posed frame, drawn as an edit of the base picture.
 * The same-size-and-position clause is what keeps the frames registered:
 * they play in place, so a character that drifts or rescales between
 * frames reads as jitter.
 */
export function posePrompt(
  prompt: string,
  frame: PosedFrame,
  style: ImageStyle,
  key: KeyColor | null,
  pixelBlock: number
): string {
  return (
    `The provided image shows this character: ${prompt}. Redraw the same ` +
    `character as ${frame.pose}. Keep everything else exactly as in the ` +
    'provided image: the same design, colors, proportions, outfit and art ' +
    'style, facing right, and the character at exactly the same size and ' +
    'position in the frame. ' +
    `${ONLY_THIS_CHARACTER} ${keyClause(key)} ${styleClause(
      style,
      pixelBlock
    )} ` +
    NO_WRITING_CLAUSE
  );
}
