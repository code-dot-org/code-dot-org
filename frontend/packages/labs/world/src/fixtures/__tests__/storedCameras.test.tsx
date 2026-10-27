// Cameras made in the map editor: data on a Viewport's placement, never blocks
// in anybody's code — declared by the compiler alone
// (`blockly/placementCameras`, specs/SPACE_CAMERAS_PLAN.md).

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
const withWideCamera = (cameras: readonly object[] = WIDE) =>
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
        cameras,
      },
    ],
  });

describe('a Viewport’s cameras made in the map editor', () => {
  it('take the zoom the inspector gave them', async () => {
    // A minimap that takes in more of the level than the game does
    // (specs/MIRRORING_PLAN.md, step 7).
    const {code, world} = await compileProject(
      withWideCamera([{...WIDE[0], zoom: 0.5}]),
    );
    expect(code['screens/main']).toContain('zoom: 0.5');
    const mini = [...world.actors].find(actor => actor.id === 'Mini')!;
    expect(world.viewportSpaceOf(mini)!.cameraNamed('Wide')!.zoom).toBe(0.5);
  }, 60000);

  it('are declared before the learner’s own `when created` runs', async () => {
    const {code} = await compileProject(withWideCamera());
    const world = code['screens/main'];
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
