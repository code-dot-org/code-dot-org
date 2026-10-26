// Cameras made in the map editor: data on a Viewport's placement, or on the
// world's main map, never blocks in anybody's code — declared by the compiler
// alone (`blockly/placementCameras`, specs/SPACE_CAMERAS_PLAN.md).

import {describe, expect, it} from 'vitest';

import {asAWorld} from '../../__tests__/support/asAWorld';
import {compileProject} from '../../__tests__/support/compileProject';
import {projectFiles} from '../../runtime/projectFiles';
import {WORLD_SCENARIOS} from '../scenarios';

/** A learner's own `when created`, marked so its place in the code shows. */
const MINE = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'world_on_Space_CreatedEvent',
        x: 20,
        y: 20,
        next: {
          block: {
            type: 'world_print',
            inputs: {VALUE: {shadow: {type: 'text', fields: {TEXT: 'mine'}}}},
          },
        },
      },
    ],
  },
};

/** The camera the map editor made: Wide, following the Pilot. */
const WIDE = [
  {
    id: 'wide',
    name: 'Wide',
    traits: ['Camera Follow#FollowsTrait'],
    values: [
      {
        setter: 'world_set_CameraFollow_ActorToFollowProperty',
        type: 'actor',
        value: 'actors/pilot',
      },
    ],
  },
];

/** Jetpack as a world, with a Viewport whose map editor made it a camera called Wide. */
const withWideCamera = () =>
  asAWorld(projectFiles(WORLD_SCENARIOS.jetpack.source), {
    actors: [
      {
        type: 'actors/viewport',
        id: 'Mini',
        properties: {
          positional: {position: {x: 80, y: 60}},
          showsMap: {mirrorsTheWorld: true, showsThrough: 'Wide'},
        },
        blocks: MINE,
        cameras: WIDE,
      },
    ],
  });

describe('a Viewport’s cameras made in the map editor', () => {
  it('are declared before the learner’s own `when created` runs', async () => {
    const {code} = await compileProject(withWideCamera());
    const world = code['worlds/main'];
    expect(world).toContain('defineCamera');
    expect(world.indexOf('defineCamera')).toBeLessThan(world.indexOf('"mine"'));
  }, 60000);

  it('look through the chosen camera before the first tick', async () => {
    // Declared as the map loads and chosen when the Viewport's map lands, so
    // the first frame drawn is through it (specs/SCREEN_MAP_PLAN.md).
    const {world} = await compileProject(withWideCamera());
    const mini = [...world.actors].find(actor => actor.id === 'Mini')!;
    const space = world.viewportSpaceOf(mini)!;
    expect(space.cameraNamed('Wide')).toBeDefined();
    expect(space.camera?.name).toBe('Wide');
  }, 60000);

  it('give the Viewport a camera to look through, with its traits', async () => {
    const {world} = await compileProject(withWideCamera());
    const mini = [...world.actors].find(actor => actor.id === 'Mini')!;
    world.tick(1 / 60);
    world.tick(1 / 60);
    const space = world.viewportSpaceOf(mini)!;
    const wide = space.cameraNamed('Wide');
    expect(wide).toBeDefined();
    expect(space.camera?.name).toBe('Wide');
  }, 60000);
});

/** Flappy as a world, with `main` as its main map (`asAWorld`). */
const flappyAsAWorld = (main: object) =>
  asAWorld(projectFiles(WORLD_SCENARIOS.flappy.source), main);

/** Flappy with a camera its map editor made, which the world starts with. */
const withOverview = () =>
  flappyAsAWorld({
    cameras: [{id: 'overview', name: 'Overview', traits: [], values: []}],
    startingCamera: 'camera:overview',
  });

describe('a world’s cameras made in the map editor', () => {
  it('are declared, and the world starts through the one its map says', async () => {
    // What the map editor was last told is what the world does.
    const {world, code} = await compileProject(withOverview());
    expect(code['worlds/main']).toContain('"Overview"');
    expect(world.activeCamera().name).toBe('Overview');
  }, 60000);
});

/** Flappy with its MAIN camera told to follow the Bird, and started through. */
const withMainFollowing = () =>
  flappyAsAWorld({
    mainCamera: {
      traits: ['Camera Follow#FollowsTrait'],
      values: [
        {
          setter: 'world_set_CameraFollow_ActorToFollowProperty',
          type: 'actor',
          value: 'actors/bird',
        },
      ],
    },
    startingCamera: 'main',
  });

describe('the world’s main camera, given traits in the map editor', () => {
  it('is given them, and the world looks through it', async () => {
    const {world, code} = await compileProject(withMainFollowing());
    expect(code['worlds/main']).toMatch(/world\.camera\("main"\)/);
    expect(code['worlds/main']).toContain('addTrait');
    expect(world.activeCamera().id).toBe('main');
  }, 60000);
});
