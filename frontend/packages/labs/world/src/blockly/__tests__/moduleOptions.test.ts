import {afterEach, describe, expect, it} from 'vitest';

import {
  actorOptions,
  setProjectActors,
  setProjectWorlds,
  worldOptions,
} from '../moduleOptions';

// Registries are module state; reset between cases.
afterEach(() => {
  setProjectActors([]);
  setProjectWorlds([]);
});

describe('moduleOptions', () => {
  it('returns the actor options it was given', () => {
    setProjectActors([
      ['Player', 'actors/player'],
      ['Ground', 'actors/ground'],
    ]);
    expect(actorOptions()).toEqual([
      ['Player', 'actors/player'],
      ['Ground', 'actors/ground'],
    ]);
  });

  it('returns the world options it was given', () => {
    setProjectWorlds([['Platform World', 'worlds/platform']]);
    expect(worldOptions()).toEqual([['Platform World', 'worlds/platform']]);
  });

  it('falls back to a single (none) option when empty', () => {
    expect(actorOptions()).toEqual([['(none)', '']]);
    expect(worldOptions()).toEqual([['(none)', '']]);
  });
});
