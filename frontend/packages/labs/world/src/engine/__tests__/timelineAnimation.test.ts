// A kind's animations, played as timelines (specs/ANIMATION_PLAN.md, step 2).

import {describe, expect, it} from 'vitest';

import type {Timeline} from '../core/keyframes';
import {
  ActorBuilder,
  AnimationEndedEvent,
  AnimationProperty,
  AnimationRule,
  AppearanceTrait,
  DrawnOffsetProperty,
  DrawnTurnProperty,
  FrameChangedEvent,
  FrameProperty,
  OpacityProperty,
  PositionProperty,
  SpriteCellOriginProperty,
  SpriteCellSizeProperty,
  SpriteProperty,
  Vector,
  WorldBuilder,
  playAnimation,
  type AnimationDef,
} from '../index';

/** A coin's spin: three cells, a tenth of a second each, and its closing key. */
const SPIN: Timeline = {
  loop: true,
  tracks: {
    sprite: [0, 1, 2, 2].map((cell, at) => ({
      at: at / 10,
      value: {
        sprite: 'coin.png',
        cell: {x: cell * 16, y: 0, width: 16, height: 16},
      },
    })),
  },
};

/** A bob that runs once: up four pixels and back, and a turn. */
const HOP: Timeline = {
  tracks: {
    drawnOffset: [
      {at: 0, value: {x: 0, y: 0}},
      {at: 0.2, value: {x: 0, y: -4}},
      {at: 0.4, value: {x: 0, y: 0}},
    ],
    drawnTurn: [
      {at: 0, value: 0},
      {at: 0.4, value: 90},
    ],
  },
};

/** A glow that comes on part way, and a fade. */
const GLOW: Timeline = {
  tracks: {
    'effect:effects/glow': [
      {at: 0.1, value: true},
      {at: 0.3, value: false},
    ],
    opacity: [
      {at: 0, value: 1},
      {at: 0.3, value: 0.4},
    ],
  },
};

const GLOW_DOCUMENT = {name: 'Glow', parameters: [], nodes: []} as never;

/** A project-wide flipbook, called what the Coin calls one of its own. */
const FLIPBOOK: AnimationDef = {
  loop: true,
  frames: [{sprite: 'other.png'}],
};

function coinWorld(playing: string) {
  const builder = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([AnimationRule])
    .useAnimations({Spin: FLIPBOOK});
  const world = builder.getWorld();
  const actor = builder.addActor(
    new ActorBuilder({id: 'coin', name: 'Coin'})
      .useTraits([AppearanceTrait])
      .set(PositionProperty, new Vector(50, 50))
      .useAnimations(
        {Spin: SPIN, Hop: HOP, Glow: GLOW},
        {'effects/glow': {document: GLOW_DOCUMENT}},
      )
      .set(AnimationProperty, playing),
  );
  return {world, actor};
}

describe('a kind’s timeline animation', () => {
  it('is the kind’s own, over a project-wide flipbook of the same name', () => {
    const {world, actor} = coinWorld('Spin');
    world.tick(0.05);
    expect(actor.get(SpriteProperty)).toBe('coin.png');
    // …and it is drawn from that sprite, not from the flipbook.
    const drawn = world.renderSnapshot().find(state => state.actor === actor);
    expect(drawn?.frame?.sprite).toBe('coin.png');
  });

  it('holds each picture until the next, and says when the picture changes', () => {
    const {world, actor} = coinWorld('Spin');
    const frames: unknown[] = [];
    actor.on(FrameChangedEvent, (_world, _actor, frame) => frames.push(frame));
    world.tick(0.05);
    expect(actor.get(SpriteCellOriginProperty)).toEqual(new Vector(0, 0));
    expect(actor.get(SpriteCellSizeProperty)).toEqual(new Vector(16, 16));
    world.tick(0.1);
    expect(actor.get(SpriteCellOriginProperty)).toEqual(new Vector(16, 0));
    expect(actor.get(FrameProperty)).toBe(1);
    expect(frames).toEqual([1]);
  });

  it('loops at its last key, and does not end', () => {
    const {world, actor} = coinWorld('Spin');
    let ends = 0;
    actor.on(AnimationEndedEvent, () => ends++);
    // 0.35 seconds is 0.05 into the second time round.
    for (let i = 0; i < 7; i++) {
      world.tick(0.05);
    }
    expect(actor.get(SpriteCellOriginProperty)).toEqual(new Vector(0, 0));
    expect(ends).toBe(0);
  });

  it('moves and turns the picture, not the actor, and ends once', () => {
    const {world, actor} = coinWorld('Hop');
    let ends = 0;
    actor.on(AnimationEndedEvent, () => ends++);
    world.tick(0.1);
    expect(actor.get(DrawnOffsetProperty).y).toBeCloseTo(-2);
    expect(actor.get(DrawnTurnProperty)).toBeCloseTo(22.5);
    expect(actor.get(PositionProperty)).toEqual(new Vector(50, 50));
    // The driver is told where the picture is against the actor.
    const state = world.renderSnapshot().find(one => one.actor === actor);
    expect(state?.drawn).toMatchObject({x: 0, scale: 1});
    expect(state?.drawn?.y).toBeCloseTo(-2);
    expect(state?.x).toBe(50);
    for (let i = 0; i < 10; i++) {
      world.tick(0.1);
    }
    expect(actor.get(DrawnOffsetProperty)).toEqual(new Vector(0, 0));
    expect(actor.get(DrawnTurnProperty)).toBe(90);
    expect(ends).toBe(1);
  });

  it('plays again from the start when it is played again', () => {
    const {world, actor} = coinWorld('Hop');
    for (let i = 0; i < 6; i++) {
      world.tick(0.1);
    }
    playAnimation(actor, 'Hop');
    world.tick(0.1);
    expect(actor.get(DrawnTurnProperty)).toBeCloseTo(22.5);
  });

  it('switches an effect on and off, and fades', () => {
    const {world, actor} = coinWorld('Glow');
    world.tick(0.05);
    // Before the effect's first key the actor keeps what it had: none.
    expect(actor.effects()).toEqual([]);
    world.tick(0.1);
    expect(actor.effects().map(effect => effect.path)).toEqual([
      'effects/glow',
    ]);
    world.tick(0.2);
    expect(actor.effects()).toEqual([]);
    expect(actor.get(OpacityProperty)).toBeCloseTo(0.4);
  });

  it('is nobody else’s: a kind without one falls back to the flipbook', () => {
    const builder = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([AnimationRule])
      .useAnimations({Spin: FLIPBOOK});
    const world = builder.getWorld();
    const other = builder.addActor(
      new ActorBuilder({id: 'gem', name: 'Gem'})
        .useTraits([AppearanceTrait])
        .set(PositionProperty, new Vector(0, 0))
        .set(AnimationProperty, 'Spin'),
    );
    world.tick(0.05);
    const state = world.renderSnapshot().find(one => one.actor === other);
    expect(state?.frame?.sprite).toBe('other.png');
    expect(state?.drawn).toBeUndefined();
  });

  it('is inherited by a kind that acts like it, unless it has its own', () => {
    const coin = new ActorBuilder({id: 'coin', name: 'Coin'}).useAnimations({
      Spin: SPIN,
      Hop: HOP,
    });
    const gold = new ActorBuilder({id: 'gold', name: 'Gold'})
      .useAnimations({Hop: GLOW})
      .actsLike(coin);
    expect(Object.keys(gold.ownAnimations).sort()).toEqual(['Hop', 'Spin']);
    expect(gold.ownAnimations.Hop).toBe(GLOW);
  });
});
