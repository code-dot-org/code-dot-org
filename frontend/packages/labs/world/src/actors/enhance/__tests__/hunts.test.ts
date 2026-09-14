// The two rows that chase differently — as edits, and then as a game.
//
// Chasing, flapping and prowling are one shape with three fillings: a trait,
// and one line on the frame the actor arrives saying who it is after
// (`enhance/hunts`). `chases` is tested in `enemies.test`; what is worth
// pinning here is that the other two fill the shape with their own rule and
// their own property — and that a bat, which ignores the ground, actually
// closes on what it is hunting.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty, type World} from '../../../engine';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {flapsEnhancement, prowlsEnhancement} from '../hunts';

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

const project = () => withActors('coin', 'player');

describe('the two new hunters', () => {
  it('gives a bat its one trait and a line saying who', () => {
    // ONE TRAIT AND NOTHING ELSE: flapping IS its relationship with the
    // vertical, so an actor given gravity as well would be fighting itself.
    const after = flapsEnhancement.apply(project(), COIN, 'actors/player');
    const actor = at(after, 'actors/coin.actor')!;

    expect(actor).toContain('Flapping#FlapsAndGlidesTrait');
    expect(actor).toContain('world_set_Flapping_ActorToHuntProperty');
    expect(actor).toContain('world_on_Space_CreatedEvent');
    expect(actor).not.toContain('AffectedByGravityTrait');
    expect(at(after, 'rules/flapping.rule')).toBeTruthy();
  });

  it('gives a prowler the three a walker needs', () => {
    // Prowling is a walker's behaviour rather than a flier's: it falls, and it
    // climbs what can be climbed to follow.
    const after = prowlsEnhancement.apply(project(), COIN, 'actors/player');
    const actor = at(after, 'actors/coin.actor')!;

    expect(actor).toContain('Prowling#ProwlsTrait');
    expect(actor).toContain('Gravity#AffectedByGravityTrait');
    expect(actor).toContain('Climbing#ClimbsTrait');
    expect(actor).toContain('world_set_Prowling_ActorToHuntProperty');
  });

  it('offers every actor but the hunter itself', () => {
    for (const row of [flapsEnhancement, prowlsEnhancement]) {
      const offered = row
        .asks!.options(project(), COIN)
        .map(choice => choice.value);
      expect(offered).toContain('actors/player');
      expect(offered).not.toContain('actors/coin');
    }
  });

  it('does nothing without an answer', () => {
    const before = project();
    expect(flapsEnhancement.apply(before, COIN)).toBe(before);
    expect(flapsEnhancement.applied(before, COIN)).toBe(false);
  });

  it('repoints rather than adding a second hat', () => {
    // An actor hunts one thing, so saying it twice is a learner changing their
    // mind — the reading the whole shape is built on.
    const once = prowlsEnhancement.apply(project(), COIN, 'actors/player');
    const twice = prowlsEnhancement.apply(once, COIN, 'actors/coin');
    const actor = at(twice, 'actors/coin.actor')!;

    expect([...actor.matchAll(/world_on_Space_CreatedEvent/g)]).toHaveLength(1);
    expect(prowlsEnhancement.applied(twice, COIN, 'actors/coin')).toBe(true);
  });

  it('does nothing the second time it is asked the same thing', () => {
    const once = flapsEnhancement.apply(project(), COIN, 'actors/player');
    expect(flapsEnhancement.applied(once, COIN, 'actors/player')).toBe(true);
    expect(
      at(
        flapsEnhancement.apply(once, COIN, 'actors/player'),
        'actors/coin.actor',
      ),
    ).toBe(at(once, 'actors/coin.actor'));
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

const play = (world: World, seconds: number) => {
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) {
    world.tick(1 / 60);
  }
};

const placedAt = (world: World, x: number, y: number) =>
  [...world.actors].find(
    actor =>
      actor.get(PositionProperty).x === x &&
      actor.get(PositionProperty).y === y,
  )!;

describe('the hunting rows, played', () => {
  it('closes a bat on what it is hunting, across open air', async () => {
    // THE BAT RATHER THAN THE PROWLER, and the reason is what each one is. A
    // bat ignores the ground, so a room needs nothing in it but the two of
    // them; a prowler walks, falls and climbs, so showing it off wants a floor
    // to pace, a gap to be stopped by and somebody to come near — a level
    // rather than a test.
    const source = flapsEnhancement.apply(project(), COIN, 'actors/player');
    const {world} = await compileProject(
      projectFiles(
        roomOf(source, [
          ['actors/player', 100, 200],
          ['actors/coin', 400, 200],
        ]),
      ),
    );
    const bat = placedAt(world, 400, 200);
    const from = Math.abs(bat.get(PositionProperty).x - 100);
    play(world, 2);

    expect(Math.abs(bat.get(PositionProperty).x - 100)).toBeLessThan(from);
  });
});
