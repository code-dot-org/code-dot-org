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

  it('makes the actor bring its own bar, and leaves the world alone', () => {
    const before = withPlayer();
    const after = healthEnhancement.apply(before, PLAYER);

    // Everything lands in the actor: it hears its own creation and adds the
    // bar itself, so no world knows anything about this.
    const actor = at(after, 'actors/player.actor')!;
    expect(actor).toContain('world_on_Space_CreatedEvent');
    expect(actor).toContain('world_add_actor');
    expect(actor).toContain('ActorsHealthBar_SubjectProperty');
    expect(actor).toContain('world_set_Attachment_AttachedToProperty');
    // Named, so `this actor` in the body still means the actor that was
    // created rather than the bar being placed.
    expect(actor).toContain('playerBar');

    expect(at(after, 'worlds/main.world')).toBe(
      at(before, 'worlds/main.world'),
    );
  });

  it('teaches the actor to take its bar away again', () => {
    const actor = at(
      healthEnhancement.apply(withPlayer(), PLAYER),
      'actors/player.actor',
    )!;

    // A property to remember it in, because `as ⟨bar⟩` is a block scope and
    // the handler that removes it is a different root entirely.
    expect(actor).toContain('world_rule_property');
    expect(actor).toContain('health bar');
    expect(actor).toContain('world_on_Space_RemovedEvent');
    expect(actor).toContain('world_remove_actor');
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
  /** `add actor ⟨path⟩` at a place, as a world says it. */
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

  /** The enhanced project, with `count` players placed 100 apart. */
  const enhanced = (count = 1) => {
    const source = healthEnhancement.apply(withPlayer(), PLAYER);
    const worldId = fileIdAt(source, 'worlds/main.world')!;
    const world = JSON.parse(source.files[worldId].contents);
    const root = world.blocks.blocks.find(
      (block: {type: string}) => block.type === 'world_world',
    );
    let chain = root.next;
    for (let at = 0; at < count; at++) {
      chain = {
        block: {
          ...place('actors/player', 100 + at * 100, 100),
          ...(chain ? {next: chain} : {}),
        },
      };
    }
    root.next = chain;
    return {
      ...source,
      files: {
        ...source.files,
        [worldId]: {...source.files[worldId], contents: JSON.stringify(world)},
      },
    };
  };

  /** Play it long enough for a created handler to run and its bar to settle. */
  const played = async (count = 1) => {
    const {world, modules} = await compileProject(
      projectFiles(enhanced(count)),
    );
    const health = modules['rules/health'] as unknown as {
      HasHealthTrait: never;
      HealthProperty: never;
      MostHealthProperty: never;
    };
    // TWO ticks, and the reason is the design: `is created` is queued like
    // every other event, so the bar is added on the first and the attachment
    // step puts it over the head on the second. One frame, and it buys a
    // handler that may add an actor without the world growing while somebody
    // walks it (`engine/rules/spatial`).
    world.tick(1 / 60);
    world.tick(1 / 60);
    const actors = [...world.actors];
    return {
      world,
      health,
      modules,
      players: actors.filter(actor => actor.has(health.HasHealthTrait)),
      bars: actors.filter(actor => !actor.has(health.HasHealthTrait)),
    };
  };

  /** How wide a bar's fill is drawn — the second rectangle, over the track. */
  const filled = (
    world: {renderSnapshot: () => unknown[]},
    bar: unknown,
  ): number => {
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
    const {world, health, players, bars} = await played();
    const [player] = players;
    const [bar] = bars;

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

  it('rides above the actor it is about, and follows it', async () => {
    const {world, players, bars} = await played();
    const [player] = players;
    const [bar] = bars;

    // 24 above, which is the Attachment rule's own default and the reason the
    // enhancement writes no offset of its own.
    expect(bar.get(PositionProperty).x).toBeCloseTo(
      player.get(PositionProperty).x,
      3,
    );
    expect(bar.get(PositionProperty).y).toBeCloseTo(
      player.get(PositionProperty).y - 24,
      3,
    );

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

  it('gives every one of them its own bar', async () => {
    // The whole reason this moved out of the world. Placing the bar there and
    // pointing it with `any ⟨kind⟩` gave three players one bar between them,
    // about whichever of them the language picked; an actor that hears its own
    // creation brings one each.
    const {players, bars} = await played(3);

    expect(players.length).toBe(3);
    expect(bars.length).toBe(3);

    // …and each is over its own, rather than all three over one.
    const heads = players
      .map(player => player.get(PositionProperty).x)
      .sort((one, other) => one - other);
    const over = bars
      .map(bar => bar.get(PositionProperty).x)
      .sort((one, other) => one - other);
    expect(over).toEqual(heads);
  }, 60000);

  it('takes its bar with it when it goes', async () => {
    // An actor removed with its bar still in the world leaves a bar about
    // nobody, hanging where its subject used to be.
    const {world, players, bars} = await played(3);
    expect(bars.length).toBe(3);

    world.removeActor(players[0]);
    // One tick: the removal is outside a tick, so the actor detaches at once
    // and its `is removed` is dispatched on this one — which removes the bar
    // before the same tick ends.
    world.tick(1 / 60);

    const left = [...world.actors];
    expect(left).not.toContain(players[0]);
    expect(left).not.toContain(bars[0]);
    // …and only its own: the other two are still standing with theirs.
    expect(left.length).toBe(4);
  }, 60000);
});
