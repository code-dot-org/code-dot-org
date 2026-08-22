// `add trait ⟨…⟩ to ⟨…⟩`, twice: once for an actor and once for a camera.
//
// One block offering every trait put "Follows" and "Aimed" in front of somebody
// wiring up an actor, and a camera trait elected on an actor reads correctly
// and does nothing at all — the failure says nothing, because nothing is wrong
// with the sentence. Narrowing each list stops the mistake being available,
// which beats catching it afterwards.
//
// The two read alike on purpose. The sentence is the same sentence; what
// differs is what it is about, and the socket's own shadow says that.

import {describe, expect, it, beforeEach, afterEach} from 'vitest';

import {cameraRule} from '../../rules/stock/camera';
import {cameraFollowRule} from '../../rules/stock/cameraFollow';
import {gravityRule} from '../../rules/stock/gravity';
import {refreshProjectDropdowns} from '../projectDropdowns';
import {actorTraitOptions, cameraTraitOptions} from '../traitOptions';

const labels = (options: Array<[string, string]>) => options.map(([l]) => l);

describe('the traits each block offers', () => {
  beforeEach(() => {
    refreshProjectDropdowns(
      {
        'rules/camera.rule': cameraRule,
        'rules/cameraFollow.rule': cameraFollowRule,
        'rules/gravity.rule': gravityRule,
      },
      [],
      {},
      [],
    );
  });

  afterEach(() => refreshProjectDropdowns({}, [], {}, []));

  it('keeps a camera’s traits out of the actor list', () => {
    const offered = labels(actorTraitOptions());

    expect(offered).not.toContain('Follows');
    expect(offered).not.toContain('Aimed');
  });

  it('keeps an actor’s traits out of the camera list', () => {
    const offered = labels(cameraTraitOptions());

    expect(offered).not.toContain('Affected by Gravity');
    expect(offered).not.toContain('Acts as Ground');
  });

  it('offers each subject its own', () => {
    expect(labels(actorTraitOptions())).toContain('Affected by Gravity');
    expect(labels(cameraTraitOptions())).toEqual(
      expect.arrayContaining(['Aimed', 'Follows']),
    );
  });

  it('between them offers everything, so nothing is unreachable', () => {
    // Two narrowed lists must still cover what one wide one did, or a trait
    // exists that no block can name.
    const both = new Set([
      ...labels(actorTraitOptions()),
      ...labels(cameraTraitOptions()),
    ]);

    for (const wanted of ['Affected by Gravity', 'Aimed', 'Follows']) {
      expect([...both]).toContain(wanted);
    }
  });
});
