import {describe, expect, it} from 'vitest';

import {inWorldContext} from '../worldContext';

// `inWorldContext` walks a block's ancestry (`getParent`) for the two blocks that
// bind `world`: a `world_on_*` event handler or the `world_world` root. Fake the
// chain — the real Block only needs `type` + `getParent` for this.
type FakeBlock = {type: string; getParent(): FakeBlock | null};
const chain = (...types: string[]): FakeBlock => {
  let parent: FakeBlock | null = null;
  // Build bottom-up so the first type is the leaf whose ancestry we test.
  for (const type of [...types].reverse()) {
    const p: FakeBlock | null = parent;
    parent = {type, getParent: () => p};
  }
  return parent as FakeBlock;
};

describe('inWorldContext', () => {
  it('is true inside an event handler', () => {
    // e.g. set-world-strength chained under a "when starts falling" hat.
    const block = chain('world_set_StrengthProperty', 'world_on_startsFalling');
    expect(inWorldContext(block as never)).toBe(true);
  });

  it('is true inside a world file (under the world_world root)', () => {
    const block = chain('world_set_StrengthProperty', 'world_world');
    expect(inWorldContext(block as never)).toBe(true);
  });

  it('is true when nested deeper (loop inside an event)', () => {
    const block = chain(
      'world_do_InvertAction',
      'world_for_each_touching',
      'world_on_keyPressed',
    );
    expect(inWorldContext(block as never)).toBe(true);
  });

  it('is false in an actor setup body (bound to `actor`, not `world`)', () => {
    const block = chain(
      'world_do_InvertAction',
      'world_use_trait',
      'world_actor',
    );
    expect(inWorldContext(block as never)).toBe(false);
  });

  it('is false when floating with no parent', () => {
    expect(
      inWorldContext({
        type: 'world_do_InvertAction',
        getParent: () => null,
      } as never),
    ).toBe(false);
  });
});
