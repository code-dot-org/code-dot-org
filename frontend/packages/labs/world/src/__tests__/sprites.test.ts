import {existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

// The Node generator that writes the PNGs keeps its own copies of these lists;
// the driver manifest, the generator, and the engine's stock animations must all
// agree — a mismatch means an actor references a texture that was never drawn.
import * as generator from '../../scripts/generate-sprites.mjs';
import {AnimationRule} from '../engine';
import {SPRITESHEET_NAMES, SPRITE_NAMES, SPRITE_SIZE} from '../sprites';

const here = dirname(fileURLToPath(import.meta.url));
const vendorSprites = join(here, '..', '..', 'public', 'vendor', 'sprites');

describe('built-in sprites and animations', () => {
  it('the driver manifest, the generator, and the engine stock agree', () => {
    expect([...SPRITE_NAMES]).toEqual([...generator.SPRITE_NAMES]);
    expect(SPRITE_SIZE).toBe(generator.SPRITE_SIZE);

    const generatorAnimations = Object.keys(generator.ANIMATION_SPECS);
    const stockAnimations = Object.keys(AnimationRule.animations);
    expect([...SPRITESHEET_NAMES]).toEqual(generatorAnimations);
    expect(stockAnimations.sort()).toEqual(generatorAnimations.sort());

    // Each stock animation's frame count matches the generated spritesheet.
    for (const name of stockAnimations) {
      expect(AnimationRule.animations[name].frames.length).toBe(
        generator.ANIMATION_SPECS[name].frames,
      );
    }
  });

  it('every named sprite and spritesheet has a generated PNG (run `yarn setup:world`)', () => {
    for (const name of [...SPRITE_NAMES, ...SPRITESHEET_NAMES]) {
      expect(existsSync(join(vendorSprites, `${name}.png`))).toBe(true);
    }
  });
});
