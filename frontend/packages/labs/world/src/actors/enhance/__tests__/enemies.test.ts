// The three rows an enemy is made of — as edits, and then as a game.
//
// A level whose only moving thing is the player is a level with nothing in it,
// and the three verbs it is missing are walking a beat, hurting what it
// touches, and going after somebody. They are separate rows because they are
// separately wanted — a spike hurts without moving, a lift patrols without
// hurting — and the Crawler every platformer starts with is the first two
// applied to one actor (`fixtures/platformerSingle`).
//
// What reading cannot tell is whether the blocks they write actually make a
// thing behave, so the second half builds a room and plays it.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty, type World} from '../../../engine';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {chasesEnhancement} from '../chases';
import {dealsDamageEnhancement} from '../dealsDamage';
import {patrolsEnhancement} from '../patrols';

/** A Coin: something in the library that is emphatically not an enemy. */
const COIN = {kind: 'actor' as const, path: 'actors/coin', name: 'Coin'};
const PLAYER = {
  kind: 'actor' as const,
  path: 'actors/player',
  name: 'Platformer Player',
};

type Source = typeof WORLD_SCENARIOS.empty.source;

/** The empty scenario with the named stock actors imported. */
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

describe('walking a beat', () => {
  it('elects the trait and brings the rule', () => {
    const after = patrolsEnhancement.apply(withActors('coin'), COIN);

    expect(at(after, 'actors/coin.actor')).toContain(
      'Patrol#PatrolsAcrossTrait',
    );
    expect(at(after, 'rules/patrol.rule')).toBeTruthy();
  });

  it('leaves the other direction alone', () => {
    // Down is a lift rather than a guard — a different thing rather than the
    // other half of this one. An actor that took both would walk a rectangle
    // nobody asked for (`rules/stock/patrol`).
    expect(
      at(
        patrolsEnhancement.apply(withActors('coin'), COIN),
        'actors/coin.actor',
      ),
    ).not.toContain('PatrolsDownTrait');
  });

  it('does nothing the second time', () => {
    const once = patrolsEnhancement.apply(withActors('coin'), COIN);
    expect(patrolsEnhancement.applied(once, COIN)).toBe(true);
    expect(at(patrolsEnhancement.apply(once, COIN), 'actors/coin.actor')).toBe(
      at(once, 'actors/coin.actor'),
    );
  });
});

describe('hurting what it touches', () => {
  it('elects the trait and brings the rule', () => {
    const after = dealsDamageEnhancement.apply(withActors('coin'), COIN);

    expect(at(after, 'actors/coin.actor')).toContain('Health#DealsDamageTrait');
    expect(at(after, 'rules/health.rule')).toBeTruthy();
  });

  it('gives the toucher nothing to lose of its own', () => {
    // Damage is dealt by one actor and felt by another, and the row is about
    // the dealing. An enemy that quietly gained health would be a second
    // decision nobody asked for — and a health bar's worth of state.
    expect(
      at(
        dealsDamageEnhancement.apply(withActors('coin'), COIN),
        'actors/coin.actor',
      ),
    ).not.toContain('HasHealthTrait');
  });

  it('does nothing the second time', () => {
    const once = dealsDamageEnhancement.apply(withActors('coin'), COIN);
    expect(dealsDamageEnhancement.applied(once, COIN)).toBe(true);
    expect(
      at(dealsDamageEnhancement.apply(once, COIN), 'actors/coin.actor'),
    ).toBe(at(once, 'actors/coin.actor'));
  });
});

describe('chasing somebody', () => {
  const project = () => withActors('coin', 'player');

  it('offers every actor but the one being enhanced', () => {
    // An actor told to chase its own kind picks the nearest of them, which is
    // usually itself — a hunter standing on its own spot, which reads as the
    // trait not working.
    const offered = chasesEnhancement
      .asks!.options(project(), COIN)
      .map(choice => choice.value);

    expect(offered).toContain('actors/player');
    expect(offered).not.toContain('actors/coin');
  });

  it('writes the trait and a line saying who', () => {
    const after = chasesEnhancement.apply(project(), COIN, 'actors/player');
    const actor = at(after, 'actors/coin.actor')!;

    expect(actor).toContain('Steering#ChasesTrait');
    // Told WHEN IT APPEARS, so a chaser a spawner makes later learns it too.
    expect(actor).toContain('world_on_Space_CreatedEvent');
    expect(actor).toContain('world_set_Steering_ActorToChaseProperty');
    // …and handed ONE actor rather than the list: the property holds one, and
    // `any ⟨kind⟩` in that socket compiles and chases nothing.
    expect(actor).toContain('world_first_actor');
    expect(at(after, 'rules/steering.rule')).toBeTruthy();
  });

  it('does nothing without an answer', () => {
    // The question is the row's whole point; the dialog will not enable the
    // button without one, and this is the same claim one layer down.
    const before = project();
    expect(chasesEnhancement.apply(before, COIN)).toBe(before);
    expect(chasesEnhancement.applied(before, COIN)).toBe(false);
  });

  it('repoints rather than adding a second hat', () => {
    // An actor chases one thing, so saying it twice is a learner changing
    // their mind — the reading the camera already settled on.
    const once = chasesEnhancement.apply(project(), COIN, 'actors/player');
    const twice = chasesEnhancement.apply(once, COIN, 'actors/coin');
    const actor = at(twice, 'actors/coin.actor')!;

    expect([...actor.matchAll(/world_on_Space_CreatedEvent/g)]).toHaveLength(1);
    expect(chasesEnhancement.applied(twice, COIN, 'actors/coin')).toBe(true);
    expect(chasesEnhancement.applied(twice, COIN, 'actors/player')).toBe(false);
  });

  it('does nothing the second time it is asked the same thing', () => {
    const once = chasesEnhancement.apply(project(), COIN, 'actors/player');
    expect(chasesEnhancement.applied(once, COIN, 'actors/player')).toBe(true);
    expect(
      at(
        chasesEnhancement.apply(once, COIN, 'actors/player'),
        'actors/coin.actor',
      ),
    ).toBe(at(once, 'actors/coin.actor'));
  });
});

/** `add actor ⟨path⟩`, put at one place — the shape `playerFalls` uses. */
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

/** A world that places the given actors, in order. */
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

/** Tick for `seconds` at sixty frames a second. */
const play = (world: World, seconds: number) => {
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) {
    world.tick(1 / 60);
  }
};

/**
 * The actor the world put at exactly this spot.
 *
 * BOTH COORDINATES, because a room has several actors and any one of them may
 * share a row or a column with another: the first cut of this asked for "the
 * one at y 260" in a room where the chaser and its quarry were both there, got
 * the quarry twice, and measured the gap between an actor and itself.
 *
 * Resolved before anything ticks — the object is stable, the position is not.
 */
const placedAt = (world: World, x: number, y: number) =>
  [...world.actors].find(
    actor =>
      actor.get(PositionProperty).x === x &&
      actor.get(PositionProperty).y === y,
  )!;

describe('the enemy rows, played', () => {
  it('sets a patrolling coin walking, and turns it round', async () => {
    const source = roomOf(
      patrolsEnhancement.apply(withActors('coin', 'ground'), COIN),
      [
        ['actors/ground', 160, 300],
        ['actors/coin', 160, 100],
      ],
    );
    const {world} = await compileProject(projectFiles(source));
    const coin = placedAt(world, 160, 100);
    const from = coin.get(PositionProperty).x;

    play(world, 0.5);
    const walked = coin.get(PositionProperty).x;
    expect(Math.abs(walked - from)).toBeGreaterThan(8);

    // The beat is a clock rather than a distance, so it comes back: a patrol
    // that only ever walked one way would pass the line above and be wrong.
    let farthest = walked;
    let nearest = walked;
    for (let step = 0; step < 60; step++) {
      play(world, 0.1);
      const x = coin.get(PositionProperty).x;
      farthest = Math.max(farthest, x);
      nearest = Math.min(nearest, x);
    }
    expect(farthest - nearest).toBeGreaterThan(8);
  });

  it('sets a chasing coin closing on the player', async () => {
    const source = roomOf(
      chasesEnhancement.apply(
        withActors('coin', 'player', 'ground'),
        COIN,
        'actors/player',
      ),
      [
        ['actors/ground', 160, 300],
        ['actors/player', 60, 260],
        ['actors/coin', 300, 260],
      ],
    );
    const {world} = await compileProject(projectFiles(source));
    const coin = placedAt(world, 300, 260);
    const player = placedAt(world, 60, 260);
    const gap = () =>
      Math.abs(coin.get(PositionProperty).x - player.get(PositionProperty).x);
    const before = gap();

    play(world, 2);

    // The whole of what the `when it appears` line buys: without it the
    // property is empty, the step reads nobody, and the gap never changes.
    expect(gap()).toBeLessThan(before - 20);
  });

  it('takes health off what a damaging actor touches', async () => {
    let source = withActors('coin', 'player', 'ground');
    source = dealsDamageEnhancement.apply(source, COIN);
    // The other half, which is the other actor's: something to lose.
    const {healthEnhancement} = await import('../health');
    source = healthEnhancement.apply(source, PLAYER);
    source = roomOf(source, [
      ['actors/ground', 160, 300],
      ['actors/player', 160, 260],
      ['actors/coin', 166, 260],
    ]);

    const {world, modules} = await compileProject(projectFiles(source));
    const health = (modules['rules/health'] as Record<string, unknown>)
      .HealthProperty;
    const player = placedAt(world, 160, 260);
    const full = (player as {get(p: unknown): number}).get(health);

    play(world, 1);

    expect((player as {get(p: unknown): number}).get(health)).toBeLessThan(
      full,
    );
  });
});
