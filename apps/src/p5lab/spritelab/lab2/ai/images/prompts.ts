// The words sent to the image model, for single images and for character
// sets. Pure text: no DOM, no network. The browser pipeline
// (imageGeneration.ts, characterSet.ts) and the cache generator
// (apps/script/spritelabCachedImages) both build their prompts here, so a
// cached image was asked for in exactly the words a live one is.

import {KeyColor} from './keyColor';
import {MODEL_OUTPUT_PX} from './modelHelpers';
import {ImageStyle, ImageType} from './types';

const SMOOTH_PROMPT = 'Render as a smooth, cleanly-shaded illustration.';

/** The logical grid a block size asks of the model, as recorded in
 * generation metadata (pixelBlockFor's inverse). */
export function logicalGridFor(blockSize: number): number {
  return MODEL_OUTPUT_PX / blockSize;
}

// Tacked onto the prompt so the generated image matches the chosen style.
// Kept here (not inline) so the sprite and background prompts stay in sync.
// Callers pass the pixelBlockFor block they also normalize against, so what
// we ask for and what we assume can't drift apart.
export function styleClause(style: ImageStyle, blockSize: number): string {
  if (style !== 'pixel') {
    return SMOOTH_PROMPT;
  }
  const logical = logicalGridFor(blockSize);
  return (
    'Render as crisp pixel art with a small, limited color palette and ' +
    'hard-edged pixels — no anti-aliasing, gradients, or soft shading. ' +
    `Draw on a strict ${logical}x${logical} pixel grid: every logical ` +
    `pixel is a uniform ${blockSize}x${blockSize} block, perfectly ` +
    'aligned to the image edges.'
  );
}

// Asks for the flat key color a costume is keyed out against afterwards
// (removeBackground flood-fills it from the corners). The character-set
// generator asks for a NAMED key color in its own prompts instead.
const SPRITE_PROMPT_CLAUSE =
  'Use a plain solid background of one single flat color that contrasts strongly with the subject and appears nowhere on the subject, extending to all edges. Do not include any scenery, ground, sky, or other background elements — only the subject on that flat background.';

// The model likes to dress a background's margins: painted frames, fake
// transparency strips, title bars. Positive instruction first, and the
// decorations go unnamed — named things get drawn (see BLOCK_PROMPT_CLAUSE).
const BACKGROUND_PROMPT_CLAUSE =
  'The scene itself fills the entire image, reaching all four edges. Do not frame the picture: no border and no margin, and nothing along the edges that is not part of the scene.';

// Name no drawable object here ("block", "tile") — the model adds it to the
// picture. Describe only the square-and-margin layout.
const BLOCK_PROMPT_CLAUSE =
  'Compose the artwork to completely fill one large centered square region, edge to edge, so that copies placed side by side connect seamlessly. Leave a clear margin around all four sides of that square in one plain solid flat color that contrasts strongly with the artwork and appears nowhere in it, extending to the image edges. No background scene — just the artwork on that flat color.';

const TYPE_CLAUSES: Record<ImageType, string> = {
  sprite: SPRITE_PROMPT_CLAUSE,
  background: BACKGROUND_PROMPT_CLAUSE,
  block: BLOCK_PROMPT_CLAUSE,
};

/**
 * The full prompt for one single image: the student's sentence, then the
 * style, then what the type needs of the layout.
 */
export function singleImagePrompt(
  prompt: string,
  imageType: ImageType,
  style: ImageStyle,
  pixelBlock: number
): string {
  // Read the prompt as a sentence before the clauses, without doubling the
  // punctuation a prompt may already end with.
  const sentence = /[.!?]$/.test(prompt) ? prompt : `${prompt}.`;
  return `${sentence} ${styleClause(style, pixelBlock)} ${
    TYPE_CLAUSES[imageType]
  }`;
}

/** One frame of a character set after the base: its label and pose
 * description. */
export interface PosedFrame {
  label: string;
  pose: string;
}

// The frames drawn from the base. Each pose text is sent as an edit
// request together with the base picture, so it describes only what
// changes from the base. List order is strip order, except that the base
// itself is inserted after the first entry (CHARACTER_STRIP_POSES).
export const POSED_FRAMES: PosedFrame[] = [
  {
    label: 'idling',
    pose:
      'a second idle frame: the very same standing pose with only a subtle ' +
      'change — a small breath, the head or shoulders shifted a touch. The ' +
      'feet do not move',
  },
  {
    label: 'walking',
    pose:
      'halfway through a walking stride, seen from the side — mainly the ' +
      'legs moving, one leg forward and one back, the arms swinging slightly',
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
];

/** How many pictures a set costs: the base and each posed frame. */
export const CHARACTER_SET_PICTURE_COUNT = 1 + POSED_FRAMES.length;

// Each frame is drawn on its own, so a companion or prop the model adds to
// one frame has no reason to recur in the next.
const ONLY_THIS_CHARACTER =
  'Only this one character, alone: no other creatures, people, pets, objects or companions, and nothing added that is not part of the character itself.';

/** The one flat colour every frame is drawn on, keyed out afterwards. */
function keyClause(key: KeyColor): string {
  return `Use a plain, solid, flat background of exactly one color, ${key.name} (${key.hex}), filling the image to every edge — no gradient, no scenery, no ground, and no shadow under the character. Only the character on that flat ${key.name}. The character itself must contain no ${key.name} or anything close to it anywhere — not on clothes, hat, hair, skin or accessories; choose other colors for those.`;
}

/**
 * The prompt for the base frame: the whole character, standing, facing
 * right — the picture every other frame is drawn from.
 */
export function basePrompt(
  prompt: string,
  style: ImageStyle,
  key: KeyColor,
  pixelBlock: number
): string {
  return (
    `${prompt}. Show the whole character standing, facing right: its face ` +
    'and body point toward the right side of the image. Arms hanging ' +
    'relaxed at the sides, hands open and empty. Feet near the bottom of ' +
    'the image, nothing cut off. ' +
    `${ONLY_THIS_CHARACTER} ${styleClause(style, pixelBlock)} ${keyClause(key)}`
  );
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
  key: KeyColor,
  pixelBlock: number
): string {
  return (
    `The provided image shows this character: ${prompt}. Redraw the same ` +
    `character as ${frame.pose}. Keep everything else exactly as in the ` +
    'provided image: the same design, colors, proportions, outfit and art ' +
    'style, facing right, and the character at exactly the same size and ' +
    'position in the frame. ' +
    `${ONLY_THIS_CHARACTER} ${keyClause(key)} ${styleClause(style, pixelBlock)}`
  );
}
