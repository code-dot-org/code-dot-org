// Which traits each trait dropdown offers.
//
// A trait belongs to whatever takes it (`TraitMeta.subject`). Offering every
// trait to an actor would put "Follows" on one, which reads correctly and does
// nothing — so `add trait` narrows to the subject it is about, and `has trait`,
// which asks about a value, offers all of them.

import {beforeEach, describe, expect, it} from 'vitest';

import {
  actorTraitOptions,
  anyTraitOptions,
  cameraTraitOptions,
  setProjectRuleMeta,
  setProjectRules,
  traitSubjectOfValue,
} from '../traitOptions';

describe('which traits each dropdown offers', () => {
  // A `.rule` giving an actor trait and a camera trait, in play.
  const rule = {
    id: 'follow',
    name: 'Camera Follow',
    ability: 'Follows',
    modulePath: 'rules/follow',
    source: 'project' as const,
    ref: {
      source: 'project' as const,
      exportName: 'CameraFollowRule',
      ruleName: 'Camera Follow',
      modulePath: 'rules/follow',
    },
    requires: [],
    traits: [
      {
        id: 'follows',
        name: 'Follows',
        subject: 'camera' as const,
        requires: [],
        ref: {
          source: 'project' as const,
          exportName: 'FollowsTrait',
          ruleName: 'Camera Follow',
          modulePath: 'rules/follow',
        },
      },
      {
        id: 'watched',
        name: 'Watched',
        subject: 'actor' as const,
        requires: [],
        ref: {
          source: 'project' as const,
          exportName: 'WatchedTrait',
          ruleName: 'Camera Follow',
          modulePath: 'rules/follow',
        },
      },
    ],
    properties: [],
    actions: [],
    queries: [],
    events: [],
    steps: [],
  };

  beforeEach(() => {
    setProjectRuleMeta([rule as never]);
    setProjectRules(['rules/follow']);
  });

  const names = (rows: Array<[string, string]>) => rows.map(([label]) => label);

  it('offers each subject only what it can take', () => {
    expect(names(actorTraitOptions())).toEqual(['Watched']);
    expect(names(cameraTraitOptions())).toEqual(['Follows']);
  });

  it('says which kind of thing a trait reference names', () => {
    // What the generator asks of an actor's traits: a camera trait elected on
    // a kind compiles to `useCameraTraits`, an actor's to `useTraits`.
    expect(traitSubjectOfValue('Camera Follow#FollowsTrait')).toBe('camera');
    expect(traitSubjectOfValue('Camera Follow#WatchedTrait')).toBe('actor');
    expect(traitSubjectOfValue('Nobody#NothingTrait')).toBeUndefined();
  });

  it('offers `has trait` every trait, wherever it sits', () => {
    // Inside `for each actor` walking `all cameras`, the subject is a value
    // the editor cannot read, and a filtered list hid every camera trait from
    // the one loop that needed them.
    expect(names(anyTraitOptions())).toEqual(['Follows', 'Watched']);
  });
});
