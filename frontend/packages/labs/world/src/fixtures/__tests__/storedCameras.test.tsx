// A Viewport's camera set up in the map editor: data on its placement, never
// blocks in anybody's code — set up by the compiler alone
// (`blockly/placementCameras`, specs/SPACE_CAMERAS_PLAN.md,
// specs/ONE_WORLD_PLAN.md).

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {PositionProperty} from '../../engine/rules/spatial';
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

/** The camera the map editor set up: following the Pilot. */
const FOLLOWING = {
  traits: ['Camera Follow#FollowsTrait'],
  values: [
    {
      setter: 'world_set_CameraFollow_ActorToFollowProperty',
      type: 'actor',
      value: 'actors/pilot',
    },
  ],
};

/** Jetpack with a second Viewport on its Main Screen, its camera set up. */
const withMinimap = (camera: object = FOLLOWING): Record<string, string> => {
  const files = projectFiles(WORLD_SCENARIOS.jetpack.source);
  const screen = JSON.parse(files['screens/main.screen']) as {
    actors: object[];
  };
  screen.actors.push({
    type: 'actors/viewport',
    id: 'Mini',
    properties: {positional: {position: {x: 80, y: 60}}},
    blocks: MINE,
    camera,
  });
  return {...files, 'screens/main.screen': JSON.stringify(screen)};
};

describe('a Viewport’s camera set up in the map editor', () => {
  it('takes the zoom the inspector gave it', async () => {
    // A minimap that takes in more of the level than the game does.
    const {code, world} = await compileProject(
      withMinimap({...FOLLOWING, zoom: 0.5}),
    );
    expect(code['screens/main']).toContain('zoom: 0.5');
    const mini = [...world.actors].find(actor => actor.id === 'Mini')!;
    expect(world.cameraOf(mini)!.zoom).toBe(0.5);
  }, 60000);

  it('is set up before the learner’s own `when created` runs', async () => {
    const {code} = await compileProject(withMinimap());
    const screen = code['screens/main'];
    expect(screen).toContain('setViewportCamera');
    expect(screen.indexOf('setViewportCamera')).toBeLessThan(
      screen.indexOf('"mine"'),
    );
  }, 60000);

  it('follows the Pilot from the first ticks', async () => {
    const {world} = await compileProject(withMinimap());
    const mini = [...world.actors].find(actor => actor.id === 'Mini')!;
    const pilot = [...world.actors].find(
      actor => actor.type === 'actors/pilot',
    )!;
    world.tick(1 / 60);
    world.tick(1 / 60);
    expect(world.cameraOf(mini)!.position).toEqual(pilot.get(PositionProperty));
  }, 60000);
});
