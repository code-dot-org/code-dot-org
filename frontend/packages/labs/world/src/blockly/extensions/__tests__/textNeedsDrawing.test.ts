// Electing words, and whether anything paints them.
//
// The silent failure this is about: "Shows Text" has no steps and paints
// nothing, so an actor can hold the trait, hold the right string, and be drawn
// as the plain box the driver falls back to. Everything a learner can see is
// correct (specs/DRAWING.md). The starter's scoreboard shipped that way.
//
// Stubs rather than a live workspace, like `actorContext.test` beside it: what
// is being decided is a walk over blocks, and a walk over blocks needs blocks
// and not a renderer.

import type {Block} from 'blockly';
import {describe, expect, it} from 'vitest';

import {somethingDrawsIt, wordsGoUndrawn} from '../textNeedsDrawing';

const SHOWS_TEXT = 'Writing#ShowsTextTrait';

/** A stub block, with only what the walk asks of one. */
const node = (type: string, extra: Partial<Block> = {}): Block =>
  ({type, getParent: () => null, ...extra}) as unknown as Block;

/**
 * A `use trait` inside an actor, in a workspace of the given kind.
 *
 * `world` decides which scope the answer comes from: a world's drawing is a
 * row inside the `define actor` that owns it, an `.actor` file's is a root of
 * its own beside the definition.
 */
function useTrait({
  trait = SHOWS_TEXT,
  world = false,
  inActor = [] as string[],
  elsewhere = [] as string[],
  orphan = false,
}): Block {
  const actorRoot = node('world_actor', {
    getDescendants: () => [
      node('world_actor'),
      ...inActor.map(type => node(type)),
    ],
  } as Partial<Block>);
  const all = [
    actorRoot,
    ...inActor.map(type => node(type)),
    ...elsewhere.map(type => node(type)),
  ];
  const workspace = {
    getTopBlocks: () => (world ? [node('world_world')] : [actorRoot]),
    getAllBlocks: () => all,
  };
  return node('world_use_trait', {
    getFieldValue: () => trait,
    getParent: () => (orphan ? null : actorRoot),
    workspace,
  } as unknown as Partial<Block>);
}

describe('an actor that elects Shows Text', () => {
  it('is warned about when nothing draws its words', () => {
    expect(wordsGoUndrawn(useTrait({}))).toBe(true);
  });

  it('is left alone once a draw text appears in its own file', () => {
    // An `.actor` file: the drawing is a root beside the definition, so the
    // whole workspace is the scope and the block is not inside the actor.
    expect(wordsGoUndrawn(useTrait({elsewhere: ['world_draw_text']}))).toBe(
      false,
    );
  });

  it('is left alone once a draw text appears in its own rows, in a world', () => {
    expect(
      wordsGoUndrawn(useTrait({world: true, inActor: ['world_draw_text']})),
    ).toBe(false);
  });

  it('is still warned about when ANOTHER actor in the world draws text', () => {
    // The reason the scope narrows in a world. A second local actor having a
    // picture says nothing about this one, and the warning that fired for
    // everybody or nobody would be worth less than none.
    expect(
      wordsGoUndrawn(useTrait({world: true, elsewhere: ['world_draw_text']})),
    ).toBe(true);
  });

  it('says nothing about a trait that is not this one', () => {
    // Every `use trait` block carries this extension, and all but one of them
    // is about something with no pictures in it at all.
    expect(
      wordsGoUndrawn(useTrait({trait: 'Gravity#AffectedByGravityTrait'})),
    ).toBe(false);
  });

  it('says nothing about a row with no actor around it', () => {
    // A `use trait` floating in a world belongs to nobody, and `traitContext`
    // is the warning that complains about that. Two warnings for one mistake
    // is one too many.
    expect(wordsGoUndrawn(useTrait({world: true, orphan: true}))).toBe(false);
    expect(somethingDrawsIt(useTrait({world: true, orphan: true}))).toBe(true);
  });
});
