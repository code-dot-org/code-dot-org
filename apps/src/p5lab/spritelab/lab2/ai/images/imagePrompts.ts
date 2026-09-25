// The text a generation sends the image model, kept free of browser and
// bundler dependencies: bin/oneoff/hoai_2026/imagegen imports this file
// under tsx to batch-generate the adlib combos with the same prompts.
// Relative imports only.

import {ImageGenerationMetadata, ImageStyle, ImageType} from './types';

// Image-model output policy; modelHelpers re-exports it beside the model id
// so a model swap forces these into view. The image model emits roughly
// MODEL_OUTPUT_PX-square images; the pixel-art prompt asks for
// ASSUMED_BLOCK-px blocks, and grid detection falls back to the same value
// — what we ask for and what we assume can't drift apart.
export const MODEL_OUTPUT_PX = 1024;
// Backgrounds carry a whole scene, so they get a finer grid than sprites
// and blocks; finer still would sit at detection's 4px floor.
export const ASSUMED_BLOCK: Record<ImageType, number> = {
  sprite: 16,
  block: 16,
  background: 8,
};

const SMOOTH_PROMPT = 'Render as a smooth, cleanly-shaded illustration.';

/** Block size (physical px per art pixel) a generation asks for: the chosen
 * logical grid when given, else the type's default. */
export function pixelBlockFor(imageType: ImageType, pixelGrid?: number) {
  return pixelGrid ? MODEL_OUTPUT_PX / pixelGrid : ASSUMED_BLOCK[imageType];
}

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

// A still character faces the way an animated one does
// (characterSetPrompts.ts), so a story's right-lane mirror turns it toward
// the others.
const CHARACTER_FACING_CLAUSE = 'The character faces to the right.';

// On every prompt the lab sends, the character set's own included: the
// model puts captions on backgrounds and labels on things.
export const NO_WRITING_CLAUSE =
  'No writing anywhere in the image: no letters, words, numbers, signs or logos.';

// The model likes to dress a background's margins: painted frames, fake
// transparency strips, title bars. Positive instruction first, and the
// decorations go unnamed — named things get drawn (see BLOCK_PROMPT_CLAUSE).
// The place is empty because the student's characters go on top; a
// background with its own people is a crowd.
const BACKGROUND_PROMPT_CLAUSE =
  'The place is deserted: scenery only, with nobody in it, no people, characters, creatures or figures of any kind. The scene itself fills the entire image, reaching all four edges. Do not frame the picture: no border and no margin, and nothing along the edges that is not part of the scene.';

// The square is ground in a platform game, and the prompt says so: without
// the game's meaning, "a block of gold" comes back as a picture of a gold
// cube. Name no separate object ("block", "tile", "cube") — the model draws
// it inside the square — describe the ground's face instead.
const BLOCK_GROUND_CLAUSE =
  'This is one square of solid ground in a side-view platform game: the terrain a character stands on and walks across. Show the material as the surface of that ground, with a flat level top edge and a texture that continues across the square, not as a single object or item sitting inside the square. Compose the artwork to completely fill one large centered square region, edge to edge, so that copies placed side by side connect seamlessly.';
const BLOCK_PROMPT_CLAUSE = `${BLOCK_GROUND_CLAUSE} Leave a clear margin around all four sides of that square in one plain solid flat color that contrasts strongly with the artwork and appears nowhere in it, extending to the image edges. No background scene — just the artwork on that flat color.`;

// For a model that can emit an alpha channel (OpenAI's background:
// 'transparent'), in place of the key color the lab erases afterwards.
// A background fills its frame, so it has none.
const TRANSPARENT_CLAUSES: {[type in ImageType]?: string} = {
  sprite:
    'Draw only the subject on a fully transparent background. Do not include any scenery, ground, sky, shadow, or other background elements.',
  block: `${BLOCK_GROUND_CLAUSE} Leave everything around that square fully transparent. No background scene.`,
};

export function canBeTransparent(imageType: ImageType): boolean {
  return imageType in TRANSPARENT_CLAUSES;
}

/** What a prompt depends on; GenerateImageOptions is a superset of all
    but transparent, which asks for an alpha background instead of a key
    color where the type allows one. */
export type PromptOptions = Partial<
  Pick<ImageGenerationMetadata, 'imageType' | 'subject' | 'style' | 'pixelGrid'>
> & {transparent?: boolean};

/**
 * The prompt as sent: the student's words as a sentence, then the style,
 * then the clauses for the kind of image.
 */
export function fullPromptFor(
  prompt: string,
  options: PromptOptions = {}
): string {
  const {imageType = 'sprite', style = 'smooth'} = options;
  const pixelBlock = pixelBlockFor(imageType, options.pixelGrid);
  // Read the prompt as a sentence before the clauses, without doubling the
  // punctuation a prompt may already end with.
  const sentence = /[.!?]$/.test(prompt) ? prompt : `${prompt}.`;
  let fullPrompt = `${sentence} ${styleClause(style, pixelBlock)}`;
  const transparentClause = options.transparent
    ? TRANSPARENT_CLAUSES[imageType]
    : undefined;
  if (imageType === 'sprite') {
    if (options.subject === 'character') {
      fullPrompt = `${fullPrompt} ${CHARACTER_FACING_CLAUSE}`;
    }
    fullPrompt = `${fullPrompt} ${transparentClause ?? SPRITE_PROMPT_CLAUSE}`;
  } else if (imageType === 'block') {
    fullPrompt = `${fullPrompt} ${transparentClause ?? BLOCK_PROMPT_CLAUSE}`;
  } else if (imageType === 'background') {
    fullPrompt = `${fullPrompt} ${BACKGROUND_PROMPT_CLAUSE}`;
  }
  return `${fullPrompt} ${NO_WRITING_CLAUSE}`;
}
