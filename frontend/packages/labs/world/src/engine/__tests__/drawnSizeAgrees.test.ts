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
import {
  IntrinsicSizeProperty,
  PositionProperty,
  ScaleProperty,
} from '../rules/spatial';

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

describe('what the editors are told', () => {
  it('answers how big an actor is, in the units a map is drawn in', () => {
    // `World.sizeOf` is the one question the map editor asks of every kind,
    // and the reason it can: a drawing's declared canvas and a sprite's
    // picture fitted to a tile both land in the same property, so the editor
    // asks the size rather than what sort of actor it is looking at.
    const {world, actor} = drawing(64, 16);

    expect(world.sizeOf(actor)).toEqual({
      width: TILE_SIZE,
      height: TILE_SIZE / 4,
    });
  });

  it('leaves the scale out of it, so a reader cannot count it twice', () => {
    // THE SIZE IS THE BOX BEFORE THE TRANSFORM. Every reader draws this
    // through the actor's own transform, and that already carries the scale —
    // folding it in here doubled it the moment a placement overrode `scale`.
    const {world, actor} = drawing(32, 32);
    actor.set(ScaleProperty, new Vector(1, 2));

    expect(world.sizeOf(actor)).toEqual({
      width: TILE_SIZE,
      height: TILE_SIZE,
    });
  });

  it('says what the kind scales itself by, which nothing could ask before', () => {
    // THE REPORTED BUG. `set scale of this to x 1 y 2` is true of the actor
    // from the moment it is defined, and the map editor filled in a scale of
    // one for every kind because it had no way to ask. A two-tile actor came
    // out square there: right in the game, square in the editor, with nothing
    // on screen to say which was lying.
    const {world, actor} = drawing(32, 32);
    actor.set(ScaleProperty, new Vector(1, 2));

    expect(world.scaleOf(actor)).toEqual({x: 1, y: 2});
  });

  it('keeps a flip signed, which a reader drawing through a transform wants', () => {
    // `rules/spatial.halfExtent` takes the magnitude because it is measuring
    // an extent; a canvas asked to scale by -1 is being asked for the flip.
    const {world, actor} = drawing(32, 32);
    actor.set(ScaleProperty, new Vector(-2, 1));

    expect(world.scaleOf(actor)).toEqual({x: -2, y: 1});
  });

  it('says nothing for an actor nobody measured', () => {
    // No appearance, or a picture the project never stated a size for. The
    // editors fall back to the nominal tile there, as they always did.
    const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([
      AnimationRule,
    ]);
    const world = builder.getWorld();
    const bare = builder.addActor(
      new ActorBuilder({id: 'b', name: 'B'})
        .useTraits([AppearanceTrait])
        .set(PositionProperty, new Vector(0, 0)),
    );
    world.tick(0.01);

    expect(world.sizeOf(bare)).toBeUndefined();
  });

  it('has an answer from a world that was never played', () => {
    // WHAT THE THUMBNAIL PASS RELIES ON. It builds a throwaway world, reads it
    // once and discards it — it never ticks — and a reader told nothing draws
    // every kind at one nominal tile, which is exactly what the map editor
    // used to do (`sandbox/worldPreviewWorkerManager`).
    //
    // The first cut made the pass tick by zero seconds to make the Animation
    // rule's step run. That also ran every other rule's step, and the coins in
    // the map editor came out as green rectangles: a world built to be looked
    // at is not a world that has been played, and playing it for a moment is
    // not free. So the snapshot publishes the size itself.
    const builder = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([AnimationRule])
      .useImageSizes({'picture.png': {width: 256, height: 64}});
    const world = builder.getWorld();
    const actor = builder.addActor(
      new ActorBuilder({id: 'a', name: 'A'})
        .useTraits([AppearanceTrait])
        .set(PositionProperty, new Vector(0, 0))
        .set(SpriteProperty, 'picture.png'),
    );

    expect(world.sizeOf(actor)).toBeUndefined();
    world.renderSnapshot();
    expect(world.sizeOf(actor)).toEqual({
      width: TILE_SIZE,
      height: TILE_SIZE / 4,
    });
  });

  it('knows the scale of a world that was never played either', () => {
    // THE PATH THE MAP EDITOR IS ON. `set scale` is a row in the actor's own
    // definition, so it has run by the time the actor exists — the same as the
    // `set sprite` row whose picture the thumbnails already show. Nothing here
    // has to be played, which is the only reason the editor can ask at all.
    const builder = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([AnimationRule])
      .useImageSizes({'picture.png': {width: 32, height: 32}});
    const world = builder.getWorld();
    const actor = builder.addActor(
      new ActorBuilder({id: 'a', name: 'A'})
        .useTraits([AppearanceTrait])
        .set(PositionProperty, new Vector(0, 0))
        .set(SpriteProperty, 'picture.png')
        .set(ScaleProperty, new Vector(1, 2)),
    );

    world.renderSnapshot();
    expect(world.sizeOf(actor)).toEqual({
      width: TILE_SIZE,
      height: TILE_SIZE,
    });
    expect(world.scaleOf(actor)).toEqual({x: 1, y: 2});
  });
});
