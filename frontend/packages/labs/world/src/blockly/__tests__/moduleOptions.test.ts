import {afterEach, describe, expect, it} from 'vitest';

import {actorOptions, setProjectActors} from '../moduleOptions';

// Registries are module state; reset between cases.
afterEach(() => {
  setProjectActors([]);
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

  it('falls back to a single (none) option when empty', () => {
    expect(actorOptions()).toEqual([['(none)', '']]);
  });
});
