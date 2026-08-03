// Two pools of images, told apart by their folder.
//
// A sky is not something to dress an actor in, and an actor's costume is not
// something to stretch across the viewport (BACKGROUNDS.md §5). The folder is
// the whole of the rule, which means the only way it can break is silently: a
// dropdown that quietly starts offering the other pool's contents still works,
// it just offers nonsense.

import {describe, expect, it} from 'vitest';

import {
  projectBackgroundOptions,
  projectSpriteOptions,
} from '../projectModules';

/** Paths as the editor passes them — folder and all (projectImagePaths). */
const PROJECT = [
  'sprites/player.png',
  'sprites/coin.png',
  'backgrounds/cave.png',
  'backgrounds/city.png',
];

describe('the background dropdown', () => {
  it('offers what is under backgrounds/, by file name', () => {
    // The VALUE is the bare name: that is what the block stores, what the
    // engine is told, and what the driver keys a texture by.
    expect(projectBackgroundOptions({}, PROJECT)).toEqual([
      ['cave', 'cave.png'],
      ['city', 'city.png'],
    ]);
  });

  it('offers whole images, never cells', () => {
    // `coinSpin.png` is a six-cell sheet to the sprite dropdown. A backdrop is
    // stretched over the viewport, so a grid of one means nothing — and a
    // `.sheet` is never written beside one anyway.
    expect(projectBackgroundOptions({}, ['backgrounds/coinSpin.png'])).toEqual([
      ['coinSpin', 'coinSpin.png'],
    ]);
  });

  it('is empty when the project has no backdrops', () => {
    // Empty, not "(none)" — the fallback row belongs to the dropdown that shows
    // it (moduleOptions.orNone), so a caller can still tell there are none.
    expect(projectBackgroundOptions({}, ['sprites/player.png'])).toEqual([]);
  });
});

describe('the sprite dropdown', () => {
  it('leaves the backdrops out', () => {
    expect(projectSpriteOptions({}, PROJECT)).toEqual([
      ['coin', 'coin.png'],
      ['player', 'player.png'],
    ]);
  });

  it('still offers an image that is in no folder at all', () => {
    // An upload need not land anywhere in particular; only `backgrounds/` is
    // special, and everything else is a sprite.
    expect(projectSpriteOptions({}, ['loose.png'])).toEqual([
      ['loose', 'loose.png'],
    ]);
  });
});
