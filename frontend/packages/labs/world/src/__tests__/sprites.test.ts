import {existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

// The Node generator that writes the PNGs keeps its own copies of these lists;
// they must not drift — the driver preloads the TS names/specs, the files come
// from the mjs.
// @ts-expect-error - plain JS build script, no declaration file.
import * as generator from '../../scripts/generate-sprites.mjs';
import {
  ANIMATIONS,
  ANIMATION_NAMES,
  SPRITE_NAMES,
  SPRITE_SIZE,
} from '../sprites';

const here = dirname(fileURLToPath(import.meta.url));
const vendorSprites = join(here, '..', '..', 'public', 'vendor', 'sprites');

describe('built-in sprites and animations', () => {
  it('the TS lists and the generator lists agree', () => {
    expect([...SPRITE_NAMES]).toEqual([...generator.SPRITE_NAMES]);
    expect(ANIMATION_NAMES).toEqual(Object.keys(generator.ANIMATION_SPECS));
    expect(ANIMATIONS).toEqual(generator.ANIMATION_SPECS);
    expect(SPRITE_SIZE).toBe(generator.SPRITE_SIZE);
  });

  it('every named sprite and animation has a generated PNG (run `yarn setup:world`)', () => {
    for (const name of [...SPRITE_NAMES, ...ANIMATION_NAMES]) {
      expect(existsSync(join(vendorSprites, `${name}.png`))).toBe(true);
    }
  });
});
