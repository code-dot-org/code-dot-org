// Shooting — as edits, and then as a game.
//
// The reason to play this one rather than read it is the half-mechanic the
// rule deliberately is: Zapping raises an event and says nothing about what a
// zap SENDS, so every part of "a shot appears where the shooter is and flies
// off" is in the blocks this row writes. Reading them proves they were
// written. Only running them proves the shot is in the room.
//
// And two things in those blocks are silent when wrong. `as ⟨shot⟩` is what
// keeps `this actor` meaning the shooter inside the placing, so without it the
// shot is placed at its own position — which is a shot that never moves and no
// error anywhere. The variable that names it has to be declared in the file as
// well as named by the block, which is the mistake the typewriter made.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty, type World} from '../../../engine';
import {keyName} from '../../../engine/core/keys';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {shootsEnhancement as shoots} from '../shoots';

const PLAYER = {
  kind: 'actor' as const,
  path: 'actors/player',
  name: 'Platformer Player',
};

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

const project = () => withActors('player', 'coin', 'ground');

/** The player, told to send Coins. */
const armed = () => shoots.apply(project(), PLAYER, 'actors/coin');

describe('the shooting row, as edits', () => {
  it('writes the asking and the sending, and the rules under both', () => {
    const shooter = at(armed(), 'actors/player.actor')!;

    // The trait, the keyboard that makes a key handler reach this actor…
    expect(shooter).toContain('Zapping#ZapsTrait');
    expect(shooter).toContain('Input#TakesKeyboardInputTrait');
    // …the press that ASKS, which is not the same as firing…
    expect(shooter).toContain('world_on_Input_PressesEvent');
    expect(shooter).toContain('world_do_Zapping_MakeZapAction');
    // …and the handler that answers it by putting something in the world.
    expect(shooter).toContain('world_on_Zapping_ZapsEvent');
    expect(shooter).toContain('"ACTOR": "actors/coin"');
    expect(at(armed(), 'rules/zaps.rule')).toBeTruthy();
  });

  it('names the shot, and declares the name', () => {
    // A block naming a variable the workspace has not declared loads with a
    // variable Blockly has never heard of, and the body's getter resolves to
    // nothing — which compiles, and stands still.
    const workspace = JSON.parse(at(armed(), 'actors/player.actor')!) as {
      variables?: Array<{id?: string; name?: string; type?: string}>;
    };

    expect(workspace.variables).toContainEqual({
      id: 'zapping_shot',
      name: 'shot',
      type: 'Actor',
    });
  });

  it('gives what it sends what a shot needs', () => {
    // Velocity set on something that cannot move is a shot that appears and
    // stays; six a second that never leave is a game that gets slower.
    const coin = at(armed(), 'actors/coin.actor')!;

    expect(coin).toContain('Physics#CanMoveTrait');
    expect(coin).toContain('Collisions#CanCollideTrait');
    expect(coin).toContain('Expiry#ExpiresTrait');
  });

  it('does nothing the second time', () => {
    const once = armed();
    expect(shoots.applied(once, PLAYER, 'actors/coin')).toBe(true);
    expect(
      at(shoots.apply(once, PLAYER, 'actors/coin'), 'actors/player.actor'),
    ).toBe(at(once, 'actors/player.actor'));
  });

  it('sends something else when it is asked again', () => {
    // One gun, one kind of ammunition: asked twice is a learner changing their
    // mind, not asking for a second handler.
    const after = shoots.apply(armed(), PLAYER, 'actors/ground');
    const shooter = at(after, 'actors/player.actor')!;

    expect(shooter.split('world_on_Zapping_ZapsEvent').length - 1).toBe(1);
    expect(shooter).toContain('"ACTOR": "actors/ground"');
    expect(shooter).not.toContain('"ACTOR": "actors/coin"');
  });

  it('is not applied while nobody has said what to send', () => {
    const source = project();
    expect(shoots.applied(armed(), PLAYER)).toBe(false);
    expect(shoots.apply(source, PLAYER)).toBe(source);
  });
});

/** `add actor ⟨path⟩` at a place. */
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

const play = (world: World, seconds: number, keys: string[] = []) => {
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) {
    world.setInput(keys.map(keyName));
    world.tick(1 / 60);
  }
};

describe('the shooting row, played', () => {
  const room = async (source: Source) =>
    (
      await compileProject(
        projectFiles(
          roomOf(source, [
            ['actors/ground', 160, 300],
            ['actors/player', 160, 100],
          ]),
        ),
      )
    ).world;

  const coins = (world: World) =>
    [...world.actors].filter(actor => actor.type === 'actors/coin');

  it('puts a shot in the room on the space bar, and sends it off', async () => {
    const world = await room(armed());
    expect(coins(world)).toHaveLength(0);

    play(world, 0.2, ['space']);
    const shot = coins(world)[0];
    expect(shot).toBeDefined();

    // WHERE THE SHOOTER IS, which is the whole of what `as ⟨shot⟩` buys: with
    // the placing unnamed the body would have read the shot's own position and
    // put it where it already was.
    const player = [...world.actors].find(
      actor => actor.type === 'actors/player',
    )!;
    expect(
      Math.abs(shot.get(PositionProperty).x - player.get(PositionProperty).x),
    ).toBeLessThan(1);

    // …and it goes. Up, for an actor that never turns.
    const from = shot.get(PositionProperty).y;
    play(world, 0.3);
    expect(shot.get(PositionProperty).y).toBeLessThan(from);
  });

  it('refuses a second shot until it has recharged', async () => {
    // WHY THERE ARE TWO HANDLERS. The press only ASKS; the recharge answers,
    // and sometimes the answer is no. A learner who had spawned the shot
    // straight from the key press would have written a gun that fires as fast
    // as a finger can move, and adding a rate afterwards would mean unpicking
    // it.
    const world = await room(armed());
    const tap = () => {
      play(world, 0.05, ['space']);
      play(world, 0.05);
    };

    tap();
    expect(coins(world)).toHaveLength(1);

    // Straight away again: asked, and refused — a quarter of a second is the
    // recharge the rule starts with.
    tap();
    expect(coins(world)).toHaveLength(1);

    play(world, 0.3);
    tap();
    expect(coins(world)).toHaveLength(2);
  });

  it('does nothing at all without the row', async () => {
    const world = await room(project());
    play(world, 0.5, ['space']);

    expect(coins(world)).toHaveLength(0);
  });
});
