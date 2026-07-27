import {existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

// The Node generator that writes the PNGs keeps its own copy of the list; these
// must not drift — the driver preloads the TS names, the files come from the mjs.
// @ts-expect-error - plain JS build script, no declaration file.
import {SPRITE_NAMES as GENERATED} from '../../scripts/generate-sprites.mjs';
import {SPRITE_NAMES} from '../sprites';

const here = dirname(fileURLToPath(import.meta.url));
const vendorSprites = join(here, '..', '..', 'public', 'vendor', 'sprites');

describe('built-in sprites', () => {
  it('the TS list and the generator list agree', () => {
    expect([...SPRITE_NAMES]).toEqual([...GENERATED]);
  });

  it('every named sprite has a generated PNG (run `yarn setup:world`)', () => {
    for (const name of SPRITE_NAMES) {
      expect(existsSync(join(vendorSprites, `${name}.png`))).toBe(true);
    }
  });
});
