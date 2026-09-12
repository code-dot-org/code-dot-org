// What an actor looks like, read off its file and changed in it.
//
// One row says it — `set sprite` or `play animation` — and the wizard both
// reads it (so the picture step opens on the answer a copied actor already
// gives) and writes it. The part that can go silently wrong is the writing: two
// rows both saying what an actor looks like is a file where the last one wins
// and nothing says so.

import {describe, expect, it} from 'vitest';

import {lookOf, withLook} from '../actorLook';

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
