// The enemy's gun — as edits, and then as a room with somebody in it to hit.
//
// The row writes the same two blocks the player's does, answered the other
// way: an `each frame` that asks to zap and a handler that aims. What reading
// cannot tell is whether a shot actually leaves, and leaves toward the
// target, so the second half places a shooter and a player and watches the
// distance close.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty, type World} from '../../../engine';
import {keyName} from '../../../engine/core/keys';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {shootsAtEnhancement as shootsAt} from '../shootsAt';

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

const project = () => withActors('coin', 'player', 'ground');
/** The Coin, turned into a turret aimed at the Player. */
const armed = () => shootsAt.apply(project(), COIN, 'actors/player');

describe('the shoots-at row, as edits', () => {
  it('writes the firing and the aiming, and brings the rule and the Shot', () => {
    const after = armed();
    const coin = at(after, 'actors/coin.actor')!;

    expect(coin).toContain('Zapping#ZapsTrait');
    expect(coin).toContain('world_set_Zapping_RechargeTimeProperty');
    expect(coin).toContain('world_do_Zapping_MakeZapAction');
    expect(coin).toContain('world_on_Zapping_ZapsEvent');
    expect(coin).toContain('world_for_each');
    expect(coin).toContain('"ACTOR": "actors/player"');
    expect(coin).toContain('"ACTOR": "actors/shot"');
    expect(at(after, 'rules/zaps.rule')).toBeTruthy();
    expect(at(after, 'actors/shot.actor')).toBeTruthy();
  });

  it('names the aim and the shot, and declares both names', () => {
    const coin = JSON.parse(at(armed(), 'actors/coin.actor')!) as {
      variables?: Array<{id: string}>;
    };
    const declared = (coin.variables ?? []).map(one => one.id);
    expect(declared).toContain('shootsAt_aim');
    expect(declared).toContain('shootsAt_shot');
  });

  it('does nothing the second time', () => {
    const once = armed();
    expect(shootsAt.applied(once, COIN, 'actors/player')).toBe(true);
    expect(
      at(shootsAt.apply(once, COIN, 'actors/player'), 'actors/coin.actor'),
    ).toBe(at(once, 'actors/coin.actor'));
  });

  it('re-aims when asked again, rather than adding a second gun', () => {
    const again = shootsAt.apply(armed(), COIN, 'actors/ground');
    const coin = at(again, 'actors/coin.actor')!;

    expect(coin.match(/world_on_Zapping_ZapsEvent/g)).toHaveLength(1);
    expect(coin).toContain('"ACTOR": "actors/ground"');
    expect(coin).not.toContain('"ACTOR": "actors/player"');
    expect(shootsAt.applied(again, COIN, 'actors/player')).toBe(false);
    expect(shootsAt.applied(again, COIN, 'actors/ground')).toBe(true);
  });

  it('is not applied while nobody has said whom', () => {
    expect(shootsAt.applied(armed(), COIN)).toBe(false);
    const unasked = project();
    expect(shootsAt.apply(unasked, COIN)).toBe(unasked);
  });

  it('refuses the Shot itself', () => {
    const source = withActors('shot');
    expect(
      shootsAt.refuse!(source, {
        kind: 'actor',
        path: 'actors/shot',
        name: 'Shot',
      }),
    ).toMatch(/does not shoot/);
    expect(shootsAt.refuse!(source, COIN)).toBeUndefined();
  });
});

/** `add actor ⟨path⟩ do: set position ⟨x, y⟩`. */
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

/** The project with its world replaced by one that places these. */
const roomOf = (
  source: Source,
  placements: Array<[string, number, number]>,
): Source => {
  const world = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
  const rows = placements.map(([path, x, y]) => place(path, x, y));
  const chain = rows.reduceRight(
    (next, row) => ({...row, ...(next ? {next: {block: next}} : {})}),
    undefined as object | undefined,
  );
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
                fields: {NAME: 'Room'},
                next: {block: chain},
              },
            ],
          },
        }),
      },
    },
  };
};

/** How far a shot may have travelled in the first frames before it is read. */
const SPEED_SLACK = 40;

const play = (world: World, seconds: number, keys: string[] = []) => {
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) {
    world.setInput(keys.map(keyName));
    world.tick(1 / 60);
  }
};

describe('the shoots-at row, played', () => {
  // The shooter floats at the left — a Coin has no gravity — and the player
  // stands on a floor to the right, so a shot has somewhere to go.
  const room = async (source: Source) =>
    (
      await compileProject(
        projectFiles(
          roomOf(source, [
            ['actors/ground', 240, 300],
            ['actors/player', 240, 100],
            ['actors/coin', 40, 150],
          ]),
        ),
      )
    ).world;

  const shots = (world: World) =>
    [...world.actors].filter(actor => actor.type === 'actors/shot');
  const one = (world: World, type: string) =>
    [...world.actors].find(actor => actor.type === type)!;
  const distance = (world: World, shot: ReturnType<typeof one>) => {
    const a = shot.get(PositionProperty);
    const b = one(world, 'actors/player').get(PositionProperty);
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  it('fires a shot at the player without being told to, and it closes in', async () => {
    const world = await room(armed());
    play(world, 0.1);

    const [shot] = shots(world);
    expect(shot).toBeDefined();
    const coin = one(world, 'actors/coin');
    expect(
      Math.abs(shot.get(PositionProperty).x - coin.get(PositionProperty).x),
    ).toBeLessThan(SPEED_SLACK);

    const before = distance(world, shot);
    play(world, 0.3);
    expect(distance(world, shot)).toBeLessThan(before - 20);
  });

  it('fires again once it has recharged, and not before', async () => {
    const world = await room(armed());
    play(world, 0.5);
    expect(shots(world)).toHaveLength(1);

    play(world, 1.2);
    expect(shots(world)).toHaveLength(2);
  });

  it('fires at nobody when there is nobody', async () => {
    const world = (
      await compileProject(
        projectFiles(
          roomOf(armed(), [
            ['actors/ground', 240, 300],
            ['actors/coin', 40, 150],
          ]),
        ),
      )
    ).world;
    play(world, 0.5);

    expect(shots(world)).toHaveLength(0);
  });

  it('does nothing at all without the row', async () => {
    const world = await room(project());
    play(world, 1);

    expect(shots(world)).toHaveLength(0);
  });
});
