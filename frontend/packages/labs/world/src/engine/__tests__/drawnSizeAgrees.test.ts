// What is drawn and what is hit are the same box.
//
// THE FAILURE THIS EXISTS FOR IS INVISIBLE. An actor's drawn size and its
// collision box are worked out in different places from different sources —
// the renderer multiplies the TEXTURE's own pixels by `FrameState.scale`, and
// everything that asks how big an actor is reads `IntrinsicSizeProperty` — and
// they agreed, before any of this, only by coincidence of both being "the
// picture's pixels" (specs/ACTOR_SIZE.md).
//
// Fitting a picture to a tile had to be done to both. Done to one, an actor is
// drawn a tile wide with a box eight tiles wide, and NOTHING SHOWS IT: the
// preview looks right, the map editor looks right, and bumping into it happens
// somewhere near it. So this asserts the two against each other rather than
// either against a number.

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import {Vector} from '../core/Vector';
import {TILE_SIZE} from '../core/viewport';
import {
  AnimationRule,
  AppearanceTrait,
  SpriteProperty,
} from '../rules/animation';
import {IntrinsicSizeProperty, PositionProperty} from '../rules/spatial';

/** One actor drawing one picture of the given size, after a tick. */
const drawing = (width: number, height: number) => {
  const builder = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([AnimationRule])
    .useImageSizes({'picture.png': {width, height}});
  const world = builder.getWorld();
  const actor = builder.addActor(
    new ActorBuilder({id: 'a', name: 'A'})
      .useTraits([AppearanceTrait])
      .set(PositionProperty, new Vector(0, 0))
      .set(SpriteProperty, 'picture.png'),
  );
  world.tick(0.01);
  return {world, actor};
};

/** How big the RENDERER will draw it: the texture's pixels times its scale. */
const drawnSize = (
  world: ReturnType<typeof drawing>['world'],
  actor: ReturnType<typeof drawing>['actor'],
  picture: {width: number; height: number},
) => {
  const state = world.renderSnapshot().find(one => one.actor === actor);
  const scale = state?.frame?.scale ?? 1;
  return {width: picture.width * scale, height: picture.height * scale};
};

describe('the drawn size and the box', () => {
  it.each([
    [32, 32],
    [64, 16],
    [256, 256],
    [1024, 512],
    [16, 16],
  ])('agree for a %i by %i picture', (width, height) => {
    const {world, actor} = drawing(width, height);

    const drawn = drawnSize(world, actor, {width, height});
    const box = actor.get(IntrinsicSizeProperty);

    expect(drawn.width).toBeCloseTo(box.x, 6);
    expect(drawn.height).toBeCloseTo(box.y, 6);
  });

  it.each([
    [256, 256],
    [1024, 512],
    [64, 16],
  ])('draws a %i by %i picture no wider than a tile', (width, height) => {
    const {world, actor} = drawing(width, height);

    const drawn = drawnSize(world, actor, {width, height});

    expect(Math.max(drawn.width, drawn.height)).toBeCloseTo(TILE_SIZE, 6);
    // …and keeps its shape while doing it.
    expect(drawn.width / drawn.height).toBeCloseTo(width / height, 6);
  });

  it('leaves a picture the size of a tile completely alone', () => {
    // The shipped library, every sprite of it.
    const {world, actor} = drawing(TILE_SIZE, TILE_SIZE);

    expect(
      drawnSize(world, actor, {width: TILE_SIZE, height: TILE_SIZE}),
    ).toEqual({
      width: TILE_SIZE,
      height: TILE_SIZE,
    });
    expect(actor.get(IntrinsicSizeProperty).equals({x: 32, y: 32})).toBe(true);
  });
});
