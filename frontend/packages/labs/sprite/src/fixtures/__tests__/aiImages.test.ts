import {describe, expect, it} from 'vitest';

import {
  CANNED_IMAGE_PNG_BASE64,
  cannedImageFor,
} from '@code-dot-org/core/api/mocks';

import {basePrompt} from '../../ai/images/characterSet';
import {fullPromptFor} from '../../ai/images/imageGeneration';
import type {GenerateImageOptions} from '../../ai/images/imageGeneration';
import {chooseKeyColor} from '../../ai/images/keyColor';
import {SPRITE_AI_IMAGES} from '../aiImages';
import backgroundNight from '../aiImages/background-night.png?inline';
import backgroundPixel from '../aiImages/background-pixel.png?inline';
import background from '../aiImages/background.png?inline';
import blockPixel from '../aiImages/block-pixel.png?inline';
import block from '../aiImages/block.png?inline';
import sprite from '../aiImages/sprite.png?inline';

// The rules run against the prompts the lab really sends, so rewording a
// clause cannot leave them matching nothing.
const drawn = (text: string) =>
  cannedImageFor({messages: [{role: 'user', content: text}]}, SPRITE_AI_IMAGES)
    .base64;

const base64 = (dataUrl: string) => dataUrl.split(',')[1];

const cases: [string, string, GenerateImageOptions, string][] = [
  ['a smooth background', 'a meadow', {imageType: 'background'}, background],
  [
    'a pixel background',
    'a meadow',
    {imageType: 'background', style: 'pixel'},
    backgroundPixel,
  ],
  [
    'a background at night',
    'a forest at night',
    {imageType: 'background', style: 'pixel'},
    backgroundNight,
  ],
  ['a smooth block', 'gold', {imageType: 'block'}, block],
  ['a pixel block', 'gold', {imageType: 'block', style: 'pixel'}, blockPixel],
  ['a smooth sprite', 'a cat', {imageType: 'sprite'}, sprite],
  [
    'a smooth character',
    'a cat',
    {imageType: 'sprite', subject: 'character'},
    sprite,
  ],
];

describe('the mock gateway under Sprite Lab rules', () => {
  for (const [name, prompt, options, image] of cases) {
    it(`draws ${name}`, () => {
      expect(drawn(fullPromptFor(prompt, options))).toBe(base64(image));
    });
  }

  it('draws the canned character for a pixel sprite', () => {
    expect(
      drawn(fullPromptFor('a cat', {imageType: 'sprite', style: 'pixel'})),
    ).toBe(CANNED_IMAGE_PNG_BASE64);
  });

  it("draws the canned character for a character set's first frame", () => {
    expect(
      drawn(basePrompt('a cat', 'smooth', chooseKeyColor('a cat'), 16)),
    ).toBe(CANNED_IMAGE_PNG_BASE64);
  });

  it('inlines every image as a PNG data URL', () => {
    for (const {image} of SPRITE_AI_IMAGES) {
      expect(image).toMatch(/^data:image\/png;base64,iVBORw0KGgo/);
    }
  });
});
