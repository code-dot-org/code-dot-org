// An actor's animations, kept as its data, compiled and PLAYED
// (specs/ANIMATION_PLAN.md, step 3).
//
// The data is the timelines; the compiler reads the `define actor` the data
// stands for, whose animations row declares them on the kind and plays Main
// (`actors/actorData`, `world_actor_animations`). So this writes an actor as
// data, compiles a project that places it, and watches the engine play it.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {
  DrawnOffsetProperty,
  SpriteProperty,
  playAnimation,
  type Actor,
} from '../../engine';
import {EMPTY_WORLD_PROJECT} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {actorView, type ActorData} from '../actorData';

/** A Bobber: two pictures in turn, and a hop that lifts it. */
const BOBBER: ActorData = {
  type: 'actor',
  name: 'Bobber',
  animations: {
    Main: {
      loop: true,
      tracks: {
        sprite: [
          {at: 0, value: 'one.png'},
          {at: 0.2, value: 'two.png'},
          {at: 0.4, value: 'two.png'},
        ],
      },
    },
    Hop: {
      tracks: {
        drawnOffset: [
          {at: 0, value: {x: 0, y: 0}},
          {at: 0.5, value: {x: 0, y: -10}},
        ],
      },
    },
  },
};

/** A world that places one Bobber. */
const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        fields: {NAME: 'My World'},
        next: {
          block: {type: 'world_add_actor', fields: {ACTOR: 'actors/bobber'}},
        },
      },
    ],
  },
});

const play = async () => {
  const files = {
    ...projectFiles(EMPTY_WORLD_PROJECT),
    'worlds/main.world': WORLD,
    'actors/bobber.actor': JSON.stringify(BOBBER),
  };
  const {world} = await compileProject(files);
  const bobber = [...world.actors].find(
    (actor: Actor) => actor.type === 'actors/bobber',
  )!;
  return {world, bobber};
};

describe('an actor’s animations, played', () => {
  it('declares them on the kind, in the define actor its data stands for', () => {
    const view = JSON.stringify(actorView(BOBBER));
    expect(view).toContain('"type":"world_actor_animations"');
    // …and not the still picture's row, since Main moves.
    expect(view).not.toContain('world_set_sprite');
  });

  it('plays Main from the moment it is made', async () => {
    const {world, bobber} = await play();
    expect(bobber).toBeDefined();
    world.tick(0.1);
    expect(bobber.get(SpriteProperty)).toBe('one.png');
    world.tick(0.15);
    expect(bobber.get(SpriteProperty)).toBe('two.png');
    // A loop: 0.45 is 0.05 into the second time round.
    world.tick(0.2);
    expect(bobber.get(SpriteProperty)).toBe('one.png');
  });

  it('plays another of its own by name', async () => {
    const {world, bobber} = await play();
    playAnimation(bobber, 'Hop');
    world.tick(0.25);
    expect(bobber.get(DrawnOffsetProperty).y).toBeCloseTo(-5);
  });

  it('is a plain set sprite when Main is one still picture', () => {
    const still: ActorData = {
      type: 'actor',
      name: 'Rock',
      animations: {
        Main: {loop: true, tracks: {sprite: [{at: 0, value: 'rock.png'}]}},
      },
    };
    const view = JSON.stringify(actorView(still));
    expect(view).toContain('"SPRITE":"rock.png"');
    expect(view).not.toContain('world_actor_animations');
  });
});
