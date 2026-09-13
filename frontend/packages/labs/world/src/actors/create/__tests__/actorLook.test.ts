// What an actor looks like, read off its file and changed in it.
//
// One row says it — `set sprite` or `play animation` — and the wizard both
// reads it (so the picture step opens on the answer a copied actor already
// gives) and writes it. The part that can go silently wrong is the writing: two
// rows both saying what an actor looks like is a file where the last one wins
// and nothing says so.

import {describe, expect, it} from 'vitest';

import {lookOf, withLook, withScale} from '../actorLook';

/** A `define actor` with the given rows chained under it. */
const actorWith = (...rows: Array<Record<string, unknown>>) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          fields: {NAME: 'Chaser'},
          ...(rows.length
            ? {
                next: {
                  block: rows.reduceRight((next, row) => ({
                    ...row,
                    next: {block: next},
                  })),
                },
              }
            : {}),
        },
      ],
    },
  });

const trait = (name: string) => ({
  type: 'world_use_trait',
  fields: {TRAIT: name},
});
const sprite = (file: string) => ({
  type: 'world_set_sprite',
  fields: {SPRITE: file},
});
const animation = (id: string) => ({
  type: 'world_play_animation',
  fields: {ANIMATION: id},
});

/** Every row under the definition, by type. */
const rowsIn = (contents: string): string[] => {
  const blocks = (JSON.parse(contents) as {blocks: {blocks: unknown[]}}).blocks
    .blocks;
  const out: string[] = [];
  for (
    let at = blocks[0] as {type: string; next?: {block: unknown}} | undefined;
    at;
    at = at.next?.block as never
  ) {
    out.push(at.type);
  }
  return out;
};

describe('reading a look', () => {
  it('finds a still picture', () => {
    expect(lookOf(actorWith(sprite('coin.png')))).toEqual({
      kind: 'sprite',
      value: 'coin.png',
    });
  });

  it('finds an animation', () => {
    expect(lookOf(actorWith(animation('coinSpin')))).toEqual({
      kind: 'animation',
      value: 'coinSpin',
    });
  });

  it('says nothing for an actor that paints itself', () => {
    // A real answer rather than a missing one: an interface actor draws its
    // own picture and must not carry one over the top (`specs/UI_ACTORS.md`).
    expect(lookOf(actorWith(trait('Writing#ShowsTextTrait')))).toBeUndefined();
    expect(lookOf(actorWith())).toBeUndefined();
  });
});

describe('changing a look', () => {
  it('adds one to an actor that had none', () => {
    const after = withLook(actorWith(trait('A#B')), {
      kind: 'sprite',
      value: 'coin.png',
    });

    expect(rowsIn(after)).toEqual([
      'world_actor',
      'world_use_trait',
      'world_set_sprite',
    ]);
  });

  it('REPLACES the one that was there, rather than adding a second', () => {
    // Two rows saying what an actor looks like is a file whose answers
    // disagree, and the one that wins is whichever is last.
    const after = withLook(actorWith(sprite('coin.png'), trait('A#B')), {
      kind: 'animation',
      value: 'coinSpin',
    });

    expect(rowsIn(after)).toEqual([
      'world_actor',
      'world_play_animation',
      'world_use_trait',
    ]);
    expect(lookOf(after)).toEqual({kind: 'animation', value: 'coinSpin'});
  });

  it('leaves it where it was in the chain', () => {
    // An actor whose picture was at the top should not find it moved to the
    // bottom for having been changed.
    const after = withLook(
      actorWith(trait('A#B'), sprite('coin.png'), trait('C#D')),
      {kind: 'sprite', value: 'crawler.png'},
    );

    expect(rowsIn(after)).toEqual([
      'world_actor',
      'world_use_trait',
      'world_set_sprite',
      'world_use_trait',
    ]);
    expect(lookOf(after)).toEqual({kind: 'sprite', value: 'crawler.png'});
  });

  it('leaves a file with no definition alone', () => {
    // A workspace with its `define actor` deleted is a project that does not
    // compile, and this is not the thing to notice it.
    const empty = JSON.stringify({blocks: {blocks: []}});

    expect(withLook(empty, {kind: 'sprite', value: 'coin.png'})).toBe(empty);
  });
});

/** The numbers the `set scale` row ended up carrying. */
const scaleIn = (contents: string): {x: number; y: number} | undefined => {
  const blocks = (JSON.parse(contents) as {blocks: {blocks: unknown[]}}).blocks
    .blocks;
  for (
    let at = blocks[0] as
      | {
          type: string;
          inputs?: Record<string, {block?: {fields?: {NUM?: number}}}>;
          next?: {block: unknown};
        }
      | undefined;
    at;
    at = at.next?.block as never
  ) {
    if (at.type === 'world_set_Space_ScaleProperty') {
      return {
        x: at.inputs?.X?.block?.fields?.NUM as number,
        y: at.inputs?.Y?.block?.fields?.NUM as number,
      };
    }
  }
  return undefined;
};

describe('how many tiles it fills', () => {
  it('writes nothing for the one tile every actor already is', () => {
    const same = actorWith(sprite('coin.png'));

    expect(withScale(same, {x: 1, y: 1})).toBe(same);
  });

  it('writes the shape itself for a square picture', () => {
    const out = withScale(
      actorWith(sprite('coin.png')),
      {x: 1, y: 2},
      {
        width: 512,
        height: 512,
      },
    );

    expect(scaleIn(out)).toEqual({x: 1, y: 2});
  });

  it('corrects for a picture that is not square', () => {
    // THE REPORTED GAPS. A provider offers 2:3 as its nearest shape to 1:2, so
    // an actor asked for one tile across and two up was drawn from a 1024 by
    // 1536 picture: fitted to a tile that is 21 by 32, and scaling by (1, 2)
    // drew it 21 wide. A row of them on a 32-pixel grid stood ten pixels
    // apart, with no trimming involved.
    const out = withScale(
      actorWith(sprite('totem.png')),
      {x: 1, y: 2},
      {
        width: 1024,
        height: 1536,
      },
    );

    // 1 x 1536/1024 across, 2 x 1536/1536 up — which draws it 32 by 64.
    expect(scaleIn(out)).toEqual({x: 1.5, y: 2});
  });

  it('corrects a wide picture the other way', () => {
    const out = withScale(
      actorWith(sprite('bar.png')),
      {x: 3, y: 2},
      {
        width: 1536,
        height: 1024,
      },
    );

    expect(scaleIn(out)).toEqual({x: 3, y: 3});
  });

  it('keeps the old arithmetic where nothing measured the picture', () => {
    // A picture chosen from the project's own grid is art the learner picked
    // rather than art composed to this shape.
    const out = withScale(actorWith(sprite('coin.png')), {x: 2, y: 3});

    expect(scaleIn(out)).toEqual({x: 2, y: 3});
  });

  it('replaces a row rather than adding a second', () => {
    // Two rows setting the scale is a file whose second answer silently wins.
    const once = withScale(actorWith(sprite('coin.png')), {x: 2, y: 2});
    const twice = withScale(once, {x: 1, y: 3});

    expect(rowsIn(twice).filter(one => one.endsWith('ScaleProperty'))).toEqual([
      'world_set_Space_ScaleProperty',
    ]);
    expect(scaleIn(twice)).toEqual({x: 1, y: 3});
  });
});
