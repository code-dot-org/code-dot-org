// Which subject a block's `ACTOR` socket is about, by where the block sits.
//
// Seeding at creation was not enough. A block made in the palette and dragged
// INTO a `define camera` kept the `this actor` it was born with, so it read as
// being about an actor that is not there — and the learner had to know to swap
// in `this camera` by hand. These pin the decision; the shadow actually
// changing on connect is `reseedShadow`, checked in the browser.

import {describe, expect, it} from 'vitest';

import {inCameraBody, subjectShadow} from '../actorInput';

/** A stand-in for the containment chain the predicate walks. */
interface FakeBlock {
  type: string;
  around?: FakeBlock;
}

const within = (...types: string[]): never => {
  const blocks: FakeBlock[] = types.map(type => ({type}));
  blocks.forEach((block, index) => {
    block.around = blocks[index + 1];
  });
  const wrap = (block: FakeBlock): never =>
    ({
      type: block.type,
      getSurroundParent: () => (block.around ? wrap(block.around) : null),
    }) as never;
  return wrap(blocks[0]);
};

describe('the subject a block is about', () => {
  it('is the actor on its own', () => {
    expect(subjectShadow(within('world_get_Space_PositionProperty'))).toBe(
      'world_this_actor',
    );
  });

  it('is the camera inside a `define camera`', () => {
    // The bug. `this camera` outputs `Actor`, so it fits the same socket, and a
    // camera carries the foundation traits these blocks read.
    expect(
      subjectShadow(
        within('world_get_Space_PositionProperty', 'world_define_camera'),
      ),
    ).toBe('world_this_camera');
  });

  it('reads containment, not what it is merely chained below', () => {
    // `define camera` has a `do` mouth, so `getSurroundParent` is the question —
    // the reason `layerOf` gives for the same choice. A block sitting after the
    // camera in a stack is beside it, not in it, and a chain walk would sweep
    // the rest of the file into the camera.
    const beside = {
      type: 'world_get_Space_PositionProperty',
      getSurroundParent: () => null,
    } as never;

    expect(inCameraBody(beside)).toBe(false);
  });

  it('stops at a handler, which rebinds the subject', () => {
    // A handler inside a camera body is its own scope; a block in one is not
    // the camera's, however far up the camera is.
    expect(
      inCameraBody(
        within(
          'world_get_Space_PositionProperty',
          'world_on_Input_KeyPressedEvent',
          'world_define_camera',
        ),
      ),
    ).toBe(false);
  });

  it('sees a camera further out than the nearest wrapper', () => {
    expect(
      inCameraBody(
        within(
          'world_get_Space_PositionProperty',
          'controls_if',
          'world_define_camera',
        ),
      ),
    ).toBe(true);
  });
});
