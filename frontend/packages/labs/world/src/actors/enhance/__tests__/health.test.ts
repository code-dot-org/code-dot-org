// Giving an actor health and a bar — as EDITS, and then as a game.
//
// Two halves, and the second is the one that matters: an enhancement writes
// blocks into three files, and whether those blocks are the right ones is a
// question only compiling and running the project can answer. The first half
// checks the arithmetic of the patch (idempotence, what it imports); the
// second plays it.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty} from '../../../engine';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {healthEnhancement} from '../health';

/** The empty scenario with a Platformer Player in it, which is the case. */
const withPlayer = () => {
  const source = importStockActor(
    WORLD_SCENARIOS.empty.source,
    stockActorById('player')!,
  ).source;
  return source;
};

const PLAYER = {path: 'actors/player', name: 'Platformer Player'};

/** One file's contents, by the path it sits at. */
const at = (source: ReturnType<typeof withPlayer>, path: string) => {
  const id = fileIdAt(source, path);
  return id ? source.files[id].contents : undefined;
};

describe('the health enhancement, as edits', () => {
  it('gives the actor the trait, and brings what the trait needs', () => {
    const before = withPlayer();
    expect(at(before, 'actors/healthBar.actor')).toBeUndefined();

    const after = healthEnhancement.apply(before, PLAYER);

    expect(at(after, 'actors/player.actor')).toContain('Health#HasHealthTrait');
    // The bar, the rule its drawing reads, and the rule that makes it ride.
    expect(at(after, 'actors/healthBar.actor')).toBeTruthy();
    expect(at(after, 'rules/health.rule')).toBeTruthy();
    expect(at(after, 'rules/attachment.rule')).toBeTruthy();
    expect(at(after, 'actors/healthBar.actor')).toContain(
      'Attachment#AttachedTrait',
    );
  });

  it('places the bar in the world and points it at the actor', () => {
    const world = at(
      healthEnhancement.apply(withPlayer(), PLAYER),
      'worlds/main.world',
    )!;

    expect(world).toContain('world_add_actor');
    expect(world).toContain('ActorsHealthBar_SubjectProperty');
    expect(world).toContain('world_set_Attachment_AttachedToProperty');
    // Named, so a second bar somewhere else is not this one.
    expect(world).toContain('playerBar');
  });

  it('does nothing the second time', () => {
    const once = healthEnhancement.apply(withPlayer(), PLAYER);
    expect(healthEnhancement.applied(once, PLAYER)).toBe(true);

    const twice = healthEnhancement.apply(once, PLAYER);

    // Byte for byte: a learner who cannot see what changed will do it again,
    // and the second time must not leave two bars and two traits.
    expect(at(twice, 'worlds/main.world')).toBe(at(once, 'worlds/main.world'));
    expect(at(twice, 'actors/player.actor')).toBe(
      at(once, 'actors/player.actor'),
    );
  });

  it('refuses to give a Health Bar a health bar', () => {
    expect(
      healthEnhancement.refuse?.({
        path: 'actors/healthBar',
        name: 'Health Bar',
      }),
    ).toContain('own health');
    expect(healthEnhancement.refuse?.(PLAYER)).toBeUndefined();
  });
});

describe('the health enhancement, played', () => {
  /** The enhanced project, with the player placed where the test can find it. */
  const enhanced = () => {
    const source = healthEnhancement.apply(withPlayer(), PLAYER);
    const worldId = fileIdAt(source, 'worlds/main.world')!;
    const world = JSON.parse(source.files[worldId].contents);
    // Put the player in it, in front of everything the enhancement appended.
    const root = world.blocks.blocks.find(
      (block: {type: string}) => block.type === 'world_world',
    );
    root.next = {
      block: {
        type: 'world_add_actor',
        fields: {ACTOR: 'actors/player'},
        inputs: {
          DO: {
            block: {
              type: 'world_set_position',
              inputs: {
                ACTOR: {block: {type: 'world_this_actor'}},
                X: {block: {type: 'math_number', fields: {NUM: 100}}},
                Y: {block: {type: 'math_number', fields: {NUM: 100}}},
              },
            },
          },
        },
        next: root.next,
      },
    };
    return {
      ...source,
      files: {
        ...source.files,
        [worldId]: {
          ...source.files[worldId],
          contents: JSON.stringify(world),
        },
      },
    };
  };

  /** How wide the bar's fill is drawn — the second rectangle, over the track. */
  const filled = (world: {renderSnapshot: () => unknown[]}, bar: unknown) => {
    const state = (
      world.renderSnapshot() as Array<{
        actor: unknown;
        drawing?: {commands: Array<{op: string; width?: number}>};
      }>
    ).find(one => one.actor === bar)!;
    const [, fill] = state.drawing!.commands;
    return fill.width!;
  };

  it('gives the player health, and draws how much of it is left', async () => {
    const {world, modules} = await compileProject(projectFiles(enhanced()));
    const health = modules['rules/health'] as unknown as {
      HasHealthTrait: never;
      HealthProperty: never;
      MostHealthProperty: never;
    };
    const actors = [...world.actors];
    const player = actors.find(actor => actor.has(health.HasHealthTrait))!;
    const bar = actors.find(actor => actor !== player)!;

    world.tick(1 / 60);
    const whole = filled(world, bar);
    // Full, because a Player arrives at full health and the bar reads it off
    // whoever it was pointed at. A bar pointed at NOBODY draws an empty track,
    // which is what this looked like before the wiring existed.
    expect(whole).toBeGreaterThan(0);

    // Now hurt it, which is the line a game writes: the bar is not told.
    player.set(
      health.HealthProperty,
      ((player.get(health.MostHealthProperty) as number) / 2) as never,
    );
    world.tick(1 / 60);

    expect(filled(world, bar)).toBeCloseTo(whole / 2, 3);
  }, 60000);

  it('rides above the actor it is about', async () => {
    const {world, modules} = await compileProject(projectFiles(enhanced()));
    const health = modules['rules/health'] as unknown as {
      HasHealthTrait: never;
    };
    const actors = [...world.actors];
    const player = actors.find(actor => actor.has(health.HasHealthTrait))!;
    const bar = actors.find(actor => actor !== player)!;

    world.tick(1 / 60);

    // 24 above, which is the Attachment rule's own default and the reason the
    // enhancement writes no offset of its own.
    const above = bar.get(PositionProperty);
    const on = player.get(PositionProperty);
    expect(above.x).toBeCloseTo(on.x, 3);
    expect(above.y).toBeCloseTo(on.y - 24, 3);
  }, 60000);

  it('follows the actor as it moves', async () => {
    const {world, modules} = await compileProject(projectFiles(enhanced()));
    const health = modules['rules/health'] as unknown as {
      HasHealthTrait: never;
    };
    const actors = [...world.actors];
    const player = actors.find(actor => actor.has(health.HasHealthTrait))!;
    const bar = actors.find(actor => actor !== player)!;

    // Gravity is what a Platformer Player brings, so playing the world at all
    // moves it — and the bar has to arrive where it lands rather than where it
    // started.
    for (let frame = 0; frame < 30; frame++) {
      world.tick(1 / 60);
    }

    expect(player.get(PositionProperty).y).toBeGreaterThan(100);
    expect(bar.get(PositionProperty).y).toBeCloseTo(
      player.get(PositionProperty).y - 24,
      3,
    );
  }, 60000);
});
