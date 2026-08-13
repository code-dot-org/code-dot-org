// An actor that makes its own picture (specs/DRAWING.md).
//
// What these pin is the lever the whole design turns on: a picture is IDENTIFIED
// BY WHAT IT DESCRIBES. The routine runs every frame because running it is a few
// array pushes; everything expensive downstream is keyed on the commands, so the
// two properties that make it affordable — one texture for nine identical
// actors, one rasterization for a picture that never changes — are consequences
// of the key rather than optimizations anybody wrote.

import {describe, expect, it} from 'vitest';

import type {Actor} from '../core/Actor';
import type {Pen} from '../core/drawing';
import {
  ActorBuilder,
  IntrinsicSizeProperty,
  PositionProperty,
  SpriteProperty,
  Vector,
  WorldBuilder,
} from '../index';

/** A world holding one kind, drawn by `draw`, with `count` of them placed. */
function drawnWorld(
  draw: (actor: Actor, pen: Pen) => void,
  {width = 64, height = 16, count = 1} = {},
) {
  const builder = new WorldBuilder({id: 'w', name: 'W'});
  const world = builder.getWorld();
  const actors = Array.from({length: count}, (_unused, index) =>
    builder.addActor(
      new ActorBuilder({id: `a${index}`, name: 'A'})
        .set(PositionProperty, new Vector(0, 0))
        .defineDrawing(width, height, draw),
      `a${index}`,
      // One TYPE for all of them: a drawing belongs to a kind, and the kind is
      // what `any ⟨Label⟩` means everywhere else.
      'label',
    ),
  );
  return {world, actors};
}

describe('a kind that draws itself', () => {
  it('puts its commands in the render snapshot', () => {
    const {world} = drawnWorld((_actor, pen) => {
      pen.fill('#e04040');
      pen.rectangle(0, 0, 64, 16);
    });

    const [state] = world.renderSnapshot();
    expect(state.drawing?.width).toBe(64);
    expect(state.drawing?.commands).toEqual([
      {
        op: 'rectangle',
        x: 0,
        y: 0,
        width: 64,
        height: 16,
        fill: '#e04040',
        strokeWidth: 1,
      },
    ]);
  });

  it('is the size it declared, without measuring anything', () => {
    // The payoff for a DECLARED canvas. Everything that asks how big an actor
    // is reads this — the click box (rules/mouse), the collision box, "Stays in
    // the Map" — so a drawn button is clickable over the picture it draws, and
    // nothing had to look at a pixel to find out.
    const {actors} = drawnWorld(() => {}, {width: 96, height: 32});

    expect(actors[0].get(IntrinsicSizeProperty).equals({x: 96, y: 32})).toBe(
      true,
    );
  });

  it('gives the same picture the same key, however many actors draw it', () => {
    // Nine coins, one texture. The cache the driver keeps is keyed on this, so
    // sharing is what the key MEANS rather than something added later.
    const {world} = drawnWorld((_actor, pen) => pen.rectangle(0, 0, 8, 8), {
      count: 9,
    });

    const keys = new Set(
      world.renderSnapshot().map(state => state.drawing?.key),
    );
    expect(world.renderSnapshot()).toHaveLength(9);
    expect(keys.size).toBe(1);
  });

  it('gives a different picture a different key, and the same one the same', () => {
    // The whole of when-to-rasterize: the driver compares this and nothing
    // else, so a routine reading a property that has not changed produces a
    // key that has not changed, and nothing is redrawn.
    let width = 10;
    const {world} = drawnWorld((_actor, pen) => pen.rectangle(0, 0, width, 8));

    const first = world.renderSnapshot()[0].drawing!.key;
    expect(world.renderSnapshot()[0].drawing!.key).toBe(first);
    width = 20;
    expect(world.renderSnapshot()[0].drawing!.key).not.toBe(first);
  });

  it('keys the size in, so one picture on two canvases is two pictures', () => {
    const commands = (_actor: Actor, pen: Pen) => pen.rectangle(0, 0, 4, 4);
    const small = drawnWorld(commands, {width: 8, height: 8});
    const large = drawnWorld(commands, {width: 64, height: 64});

    expect(small.world.renderSnapshot()[0].drawing!.key).not.toBe(
      large.world.renderSnapshot()[0].drawing!.key,
    );
  });
});

describe('the pen', () => {
  it('is ambient while the routine runs and settled on every shape', () => {
    // The one place this project takes ambient context. The author writes the
    // sequence every drawing language is written in; the DRIVER receives
    // commands that need no state to draw, because each carries the pen it was
    // drawn with.
    const {world} = drawnWorld((_actor, pen) => {
      pen.fill('#111111');
      pen.rectangle(0, 0, 1, 1);
      pen.fill('#222222');
      pen.outline('#333333', 2);
      pen.rectangle(1, 1, 1, 1);
    });

    const [first, second] = world.renderSnapshot()[0].drawing!.commands;
    expect(first).toMatchObject({fill: '#111111', strokeWidth: 1});
    expect(first).not.toHaveProperty('stroke');
    expect(second).toMatchObject({
      fill: '#222222',
      stroke: '#333333',
      strokeWidth: 2,
    });
  });

  it('says absence rather than leaving a socket empty', () => {
    const {world} = drawnWorld((_actor, pen) => {
      pen.outline('#333333', 1);
      pen.noFill();
      pen.circle(4, 4, 4);
    });

    const [circle] = world.renderSnapshot()[0].drawing!.commands;
    expect(circle).not.toHaveProperty('fill');
    expect(circle).toMatchObject({stroke: '#333333'});
  });

  it('draws a line in the fill colour when there is no outline', () => {
    // The trap this exists to remove: `draw line` with the pen untouched is the
    // first drawing anybody writes, and a line has no interior — so without the
    // fallback it produces nothing at all and no way to find out why.
    const {world} = drawnWorld((_actor, pen) => {
      pen.fill('#00ff00');
      pen.line(0, 0, 8, 8);
    });

    expect(world.renderSnapshot()[0].drawing!.commands[0]).toMatchObject({
      op: 'line',
      stroke: '#00ff00',
    });
  });
});

describe('the appearance chain', () => {
  it('lets a drawing win over a sprite', () => {
    // Two things said about one actor; the more specific is the routine in its
    // own file. Both are reported and the driver prefers the drawing, so a
    // world that sets a sprite later has not lost it.
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    const world = builder.getWorld();
    builder.addActor(
      new ActorBuilder({id: 'a', name: 'A'})
        .set(PositionProperty, new Vector(0, 0))
        .set(SpriteProperty, 'coin.png')
        .defineDrawing(8, 8, (_actor, pen) => pen.rectangle(0, 0, 8, 8)),
    );

    const [state] = world.renderSnapshot();
    expect(state.drawing).toBeDefined();
    expect(state.frame?.sprite).toBe('coin.png');
  });

  it('leaves an actor that declared none alone', () => {
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    const world = builder.getWorld();
    builder.addActor(
      new ActorBuilder({id: 'a', name: 'A'}).set(
        PositionProperty,
        new Vector(0, 0),
      ),
    );

    expect(world.renderSnapshot()[0].drawing).toBeUndefined();
  });
});
