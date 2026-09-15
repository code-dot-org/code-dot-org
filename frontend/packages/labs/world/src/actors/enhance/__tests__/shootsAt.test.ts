// The enemy's gun — as edits, and then as a room where it fires unbidden.
//
// The row writes the player's sending and its own asking: an `each frame`
// that asks to zap and lets the recharge answer. What reading cannot tell is
// whether a shot actually leaves, and keeps leaving at the rate, so the
// second half places a shooter and watches.

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

/** A room's worth of actors, with the library's Shot to send. */
const project = () => withActors('coin', 'player', 'ground', 'shot');
/** The Coin, turned into a turret that sends Shots. */
const armed = () => shootsAt.apply(project(), COIN, 'actors/shot');

describe('the shoots-whenever row, as edits', () => {
  it('writes the firing and the sending, and the rules under both', () => {
    const after = armed();
    const coin = at(after, 'actors/coin.actor')!;

    expect(coin).toContain('Zapping#ZapsTrait');
    expect(coin).not.toContain('Input#TakesKeyboardInputTrait');
    expect(coin).toContain('world_set_Zapping_RechargeTimeProperty');
    expect(coin).toContain('world_trait_step');
    expect(coin).toContain('world_do_Zapping_MakeZapAction');
    expect(coin).toContain('world_on_Zapping_ZapsEvent');
    expect(coin).toContain('"ACTOR": "actors/shot"');
    expect(at(after, 'rules/zaps.rule')).toBeTruthy();
    expect(at(after, 'rules/expires.rule')).toBeTruthy();
  });

  it('names the shot, and declares the name', () => {
    const coin = JSON.parse(at(armed(), 'actors/coin.actor')!) as {
      variables?: Array<{id: string}>;
    };
    expect((coin.variables ?? []).map(one => one.id)).toContain('zapping_shot');
  });

  it('does nothing the second time', () => {
    const once = armed();
    expect(shootsAt.applied(once, COIN, 'actors/shot')).toBe(true);
    expect(
      at(shootsAt.apply(once, COIN, 'actors/shot'), 'actors/coin.actor'),
    ).toBe(at(once, 'actors/coin.actor'));
  });

  it('sends something else when asked again, rather than adding a gun', () => {
    const again = shootsAt.apply(armed(), COIN, 'actors/ground');
    const coin = at(again, 'actors/coin.actor')!;

    expect(coin.match(/world_on_Zapping_ZapsEvent/g)).toHaveLength(1);
    expect(coin.match(/world_trait_step/g)).toHaveLength(1);
    expect(coin).toContain('"ACTOR": "actors/ground"');
    expect(shootsAt.applied(again, COIN, 'actors/shot')).toBe(false);
    expect(shootsAt.applied(again, COIN, 'actors/ground')).toBe(true);
  });

  it('is not applied while nobody has said what to send', () => {
    expect(shootsAt.applied(armed(), COIN)).toBe(false);
    const unasked = project();
    expect(shootsAt.apply(unasked, COIN)).toBe(unasked);
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

const play = (world: World, seconds: number, keys: string[] = []) => {
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) {
    world.setInput(keys.map(keyName));
    world.tick(1 / 60);
  }
};

describe('the shoots-whenever row, played', () => {
  // The shooter floats — a Coin has no gravity — with a floor and a player
  // in the room for company, and shoots straight up, which is the way an
  // actor that never turns is facing.
  const room = async (source: Source) =>
    (
      await compileProject(
        projectFiles(
          roomOf(source, [
            ['actors/ground', 240, 300],
            ['actors/player', 240, 100],
            ['actors/coin', 40, 250],
          ]),
        ),
      )
    ).world;

  const shots = (world: World) =>
    [...world.actors].filter(actor => actor.type === 'actors/shot');
  const coin = (world: World) =>
    [...world.actors].find(actor => actor.type === 'actors/coin')!;

  it('fires without being told to, and the shot leaves', async () => {
    const world = await room(armed());
    play(world, 0.1);

    const [shot] = shots(world);
    expect(shot).toBeDefined();
    expect(
      Math.abs(
        shot.get(PositionProperty).x - coin(world).get(PositionProperty).x,
      ),
    ).toBeLessThan(1);

    const from = shot.get(PositionProperty).y;
    play(world, 0.3);
    expect(shot.get(PositionProperty).y).toBeLessThan(from);
  });

  it('fires again once it has recharged, and not before', async () => {
    const world = await room(armed());
    play(world, 0.5);
    expect(shots(world)).toHaveLength(1);

    play(world, 1.2);
    expect(shots(world)).toHaveLength(2);
  });

  it('does nothing at all without the row', async () => {
    const world = await room(project());
    play(world, 1);

    expect(shots(world)).toHaveLength(0);
  });
});
