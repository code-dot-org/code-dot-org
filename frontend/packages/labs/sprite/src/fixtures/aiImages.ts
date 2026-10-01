import type {CannedImageRule} from '@code-dot-org/core/api/mocks';

import {
  BACKGROUND_PROMPT_CLAUSE,
  BLOCK_PROMPT_CLAUSE,
  PIXEL_PROMPT,
  SPRITE_PROMPT_CLAUSE,
} from '../ai/images/promptClauses';

import backgroundNight from './aiImages/background-night.png?inline';
import backgroundPixel from './aiImages/background-pixel.png?inline';
import background from './aiImages/background.png?inline';
import blockPixel from './aiImages/block-pixel.png?inline';
import block from './aiImages/block.png?inline';
import sprite from './aiImages/sprite.png?inline';

// What the mock AI gateway draws for the lab's prompts, told apart by the
// wording the lab adds to each kind of image. First match wins; a prompt
// none matches (a pixel sprite, a character set's first frame) gets core's
// canned character, and a pose frame gets back the frame it edits.

const has =
  (...clauses: string[]) =>
  (prompt: string) =>
    clauses.every(clause => prompt.includes(clause));

const pixel = (prompt: string) => prompt.includes(PIXEL_PROMPT);

export const SPRITE_AI_IMAGES: CannedImageRule[] = [
  {
    match: prompt =>
      has(BACKGROUND_PROMPT_CLAUSE)(prompt) && /\bnight\b/i.test(prompt),
    image: backgroundNight,
  },
  {match: has(BACKGROUND_PROMPT_CLAUSE, PIXEL_PROMPT), image: backgroundPixel},
  {match: has(BACKGROUND_PROMPT_CLAUSE), image: background},
  {match: has(BLOCK_PROMPT_CLAUSE, PIXEL_PROMPT), image: blockPixel},
  {match: has(BLOCK_PROMPT_CLAUSE), image: block},
  {
    match: prompt => has(SPRITE_PROMPT_CLAUSE)(prompt) && !pixel(prompt),
    image: sprite,
  },
];
