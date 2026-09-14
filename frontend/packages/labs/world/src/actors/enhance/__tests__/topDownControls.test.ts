// Moving in four directions — as edits, and then as a game.
//
// The shelf's only movement row was a platformer's: walking, jumping, gravity.
// Everything a side-on game needs and nothing at all for one seen from above,
// where there is no floor and up is a direction rather than a leap.
//
// What reading cannot tell is whether the traits it writes actually make a
// thing move, so the second half builds a room, holds a key and looks.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty, type World} from '../../../engine';
import {keyName} from '../../../engine/core/keys';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {platformerControlsEnhancement} from '../platformerControls';
import {topDownControlsEnhancement} from '../topDownControls';

const COIN = {kind: 'actor' as const, path: 'actors/coin', name: 'Coin'};

type Source = typeof WORLD_SCENARIOS.empty.source;

const withActors = (...ids: string[]): Source => {
  let source: Source = WORLD_SCENARIOS.empty.source;
  for (const id of ids) {
    source = importStockActor(source, stockActorById(id)!).source;
  }
  return source;
};

const at = (source: Source, path: string) => {
  const id = fileIdAt(source, path);
  return id ? source.files[id].contents : undefined;
};

describe('moving in all four directions', () => {
  it('elects both axes and brings the rules', () => {
    const after = topDownControlsEnhancement.apply(withActors('coin'), COIN);
    const actor = at(after, 'actors/coin.actor')!;

    expect(actor).toContain('Arrow Keys#MovesAcrossTrait');
    expect(actor).toContain('Arrow Keys#MovesDownTrait');
    expect(actor).toContain('Input#TakesKeyboardInputTrait');
    expect(at(after, 'rules/arrows.rule')).toBeTruthy();
    expect(at(after, 'rules/input.rule')).toBeTruthy();
  });

  it('pulls the actor nowhere', () => {
    // An actor that both walks up and falls down is one that walks up and is
    // dragged back. The row for falling already exists for whoever wants it.
    const actor = at(
      topDownControlsEnhancement.apply(withActors('coin'), COIN),
      'actors/coin.actor',
    )!;

    expect(actor).not.toContain('AffectedByGravityTrait');
    expect(actor).not.toContain('Jumping#JumpsTrait');
  });

  it('is not the platformer row wearing a different name', () => {
    // The same rule read two ways. What tells them apart is the vertical: one
    // leaves it to gravity and a jump key, the other drives it.
    const top = at(
      topDownControlsEnhancement.apply(withActors('coin'), COIN),
      'actors/coin.actor',
    )!;
    const side = at(
      platformerControlsEnhancement.apply(withActors('coin'), COIN),
      'actors/coin.actor',
    )!;

    expect(top).toContain('MovesDownTrait');
    expect(side).not.toContain('MovesDownTrait');
  });

  it('does nothing the second time', () => {
    const once = topDownControlsEnhancement.apply(withActors('coin'), COIN);
    expect(topDownControlsEnhancement.applied(once, COIN)).toBe(true);
    expect(
      at(topDownControlsEnhancement.apply(once, COIN), 'actors/coin.actor'),
    ).toBe(at(once, 'actors/coin.actor'));
  });

  it('says it is not applied when only one axis is worn', () => {
    // Which is what an actor that already had the platformer's controls looks
    // like: across and the keyboard, and nothing driving the vertical.
    const side = platformerControlsEnhancement.apply(withActors('coin'), COIN);

    expect(topDownControlsEnhancement.applied(side, COIN)).toBe(false);
  });
});

/** `add actor ⟨path⟩` at a place — the shape the other enhancement tests use. */
const place = (path: string, x: number, y: number) => ({
  type: 'world_add_actor',
  fields: {ACTOR: path},
  inputs: {
    DO: {
      block: {
        type: 'world_set_position',
        inputs: {
          ACTOR: {block: {type: 'world_this_actor'}},
          X: {block: {type: 'math_number', fields: {NUM: x}}},
          Y: {block: {type: 'math_number', fields: {NUM: y}}},
        },
      },
    },
  },
});

const roomOf = (
  source: Source,
  placements: Array<[string, number, number]>,
): Source => {
  const world = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
  const rows = placements.map(([path, x, y]) => place(path, x, y));
  const chain = rows.reduceRight((next, row) => ({
    ...row,
    next: {block: next},
  }));
  return {
    ...source,
    files: {
      ...source.files,
      [world.id]: {
        ...world,
        contents: JSON.stringify({
          blocks: {
            blocks: [
              {
                type: 'world_world',
                x: 20,
                y: 20,
                fields: {NAME: 'My World'},
                next: {block: chain},
              },
            ],
          },
        }),
      },
    },
  };
};

/**
 * Tick for `seconds`, holding `keys` throughout.
 *
 * The keys are the BROWSER's names, translated at the door by `keyName` — the
 * road a real press travels. A test that fed the lab's own names would be
 * testing a control scheme nobody at a keyboard can reach
 * (`enhance/__tests__/platformerControls` says the same).
 */
const play = (world: World, seconds: number, keys: string[] = []) => {
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) {
    world.setInput(keys.map(keyName));
    world.tick(1 / 60);
  }
};

const placedAt = (world: World, x: number, y: number) =>
  [...world.actors].find(
    actor =>
      actor.get(PositionProperty).x === x &&
      actor.get(PositionProperty).y === y,
  )!;

describe('moving in all four directions, played', () => {
  /** A coin with the row applied, alone in a room, at a known spot. */
  const room = async () => {
    const source = roomOf(
      topDownControlsEnhancement.apply(withActors('coin'), COIN),
      [['actors/coin', 160, 160]],
    );
    const {world} = await compileProject(projectFiles(source));
    return {world, coin: placedAt(world, 160, 160)};
  };

  it('walks down the screen on the down arrow', async () => {
    // THE WHOLE POINT OF THE ROW. A platformer's controls answer the down
    // arrow with nothing at all.
    const {world, coin} = await room();
    play(world, 0.5, ['ArrowDown']);

    expect(coin.get(PositionProperty).y).toBeGreaterThan(160);
  });

  it('walks across on the right arrow, the way the platformer row does', async () => {
    const {world, coin} = await room();
    play(world, 0.5, ['ArrowRight']);

    expect(coin.get(PositionProperty).x).toBeGreaterThan(160);
  });

  it('stays where it is put, with nothing held', async () => {
    // No gravity: an actor seen from above is not falling anywhere.
    const {world, coin} = await room();
    play(world, 1);

    expect(coin.get(PositionProperty).y).toBe(160);
    expect(coin.get(PositionProperty).x).toBe(160);
  });
});
