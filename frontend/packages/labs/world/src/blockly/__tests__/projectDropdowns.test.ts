// What a generator run will read besides the file it is given.
//
// The registries here are dropdown options AND generator input: a `define
// world` emits `world.useRules` from the project's rule modules and
// `world.useImageSizes` from what has been measured. Neither is written in any
// file, so the generated-file cache has to key on them — and the two things it
// needs from this signature are that it MOVES when one of them arrives and
// HOLDS STILL when it has not.

import {beforeEach, describe, expect, it} from 'vitest';

import {soundImportOptions} from '../moduleOptions';
import {
  generationEnvironment,
  refreshProjectDropdowns,
} from '../projectDropdowns';
import {forgetImageSizes} from '../spriteCells';

const FILES = {
  'worlds/main.world': '{}',
  'actors/player.actor': '{}',
};

describe('the generation environment', () => {
  beforeEach(() => {
    // Measurements accumulate on purpose (`spriteCells`), so a test that did
    // not clear them would inherit the previous one's.
    forgetImageSizes();
  });

  it('moves when an image is measured', () => {
    // The bug this signature exists for: an image served from the assets
    // backend is measured only once it has decoded, in a render where no file
    // changed. Without this the recompile that arrival triggers was a cache hit
    // and the world kept a module that never learnt how big its pictures were.
    refreshProjectDropdowns(FILES, ['ground.png'], {}, []);
    const before = generationEnvironment();

    refreshProjectDropdowns(
      FILES,
      ['ground.png'],
      {'ground.png': {width: 64, height: 16}},
      [],
    );

    expect(generationEnvironment()).not.toBe(before);
  });

  it('holds still when the project is refreshed unchanged', () => {
    // The other half. This is part of every generated file's cache key, so a
    // signature that moved on its own would regenerate the whole project on
    // every keystroke — the cost the cache exists to avoid.
    refreshProjectDropdowns(
      FILES,
      ['ground.png'],
      {'ground.png': {width: 64, height: 16}},
      [],
    );
    const before = generationEnvironment();

    refreshProjectDropdowns(
      {...FILES},
      ['ground.png'],
      {'ground.png': {width: 64, height: 16}},
      [],
    );

    expect(generationEnvironment()).toBe(before);
  });

  it('moves when the project gains a rule', () => {
    // `use rule` is emitted from the rule modules the project holds, not from
    // anything the world file says — so a world generated before the import
    // landed is a world with that rule missing.
    refreshProjectDropdowns(FILES, [], {}, []);
    const before = generationEnvironment();

    refreshProjectDropdowns({...FILES, 'rules/gravity.rule': '{}'}, [], {}, []);

    expect(generationEnvironment()).not.toBe(before);
  });
});

describe('the sound registry', () => {
  it('offers the sounds the project holds', () => {
    refreshProjectDropdowns(FILES, [], {}, ['sounds/coin.mp3']);

    expect(soundImportOptions()[0]).toEqual(['coin', 'coin.mp3']);
  });

  it('survives a second refresh from the other caller', () => {
    // The bug this exists for, and it shipped. TWO places refresh these
    // registries from the same project — the compile path and the visible
    // editor — and an omitted list does not leave a registry alone, it replaces
    // it with nothing. `soundPaths` arrived with a default of `[]` and only one
    // of the two callers was updated, so the editor populated the sound list
    // and the provider wiped it a moment later: an imported sound never
    // appeared in a dropdown, and nothing said why.
    //
    // The parameters are required now, so the compiler catches the omission —
    // and this catches a caller that passes the wrong thing rather than
    // nothing.
    refreshProjectDropdowns(FILES, [], {}, ['sounds/coin.mp3']);
    refreshProjectDropdowns(FILES, [], {}, ['sounds/coin.mp3']);

    expect(soundImportOptions()[0]).toEqual(['coin', 'coin.mp3']);
  });

  it('forgets a sound the project no longer holds', () => {
    // The other half: replacing IS the contract, and a deleted sound has to
    // leave the dropdown.
    refreshProjectDropdowns(FILES, [], {}, ['sounds/coin.mp3']);

    refreshProjectDropdowns(FILES, [], {}, []);

    expect(soundImportOptions()[0]).toEqual(['(none)', '']);
  });
});
