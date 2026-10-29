// The Jetpack minimap, end to end: a second Viewport on the Main Screen,
// showing the one World as every Viewport does, its camera set up on its
// placement to follow and stay in the map, and told in its own `on create`
// whom to follow — `set actor to follow of ⟨camera of ⟨this actor⟩⟩`
// (specs/SPACE_CAMERAS_PLAN.md, specs/ONE_WORLD_PLAN.md).
//
// This runs the whole chain: the camera rules imported, the screen placement,
// the World it shows, the camera's traits from its placement, the created
// event, `camera of` reaching the camera, `Follows` aiming it through `in this
// space`, and `Confined to the Map` keeping it in the level.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {PositionProperty} from '../../engine/rules/spatial';
import {STOCK_RULES} from '../../rules/stock';
import {projectFiles} from '../../runtime/projectFiles';
import {WORLD_SCENARIOS} from '../scenarios';

/** The one row: `set actor to follow of ⟨camera of ⟨this actor⟩⟩ to ⟨any Pilot⟩`, under `on create`. */
const FOLLOW_THE_PILOT = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'world_on_Space_CreatedEvent',
        next: {
          block: {
            type: 'world_set_CameraFollow_ActorToFollowProperty',
            inputs: {
              ACTOR: {
                block: {
                  type: 'world_camera_of',
                  inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
                },
              },
              VALUE: {
                block: {
                  type: 'world_actor_kind',
                  fields: {ACTOR: 'actors/pilot'},
                },
              },
            },
          },
        },
      },
    ],
  },
};

/**
 * Jetpack with a second Viewport on its Main Screen, which names no map: it
 * shows the World the Game Viewport loaded. Its camera follows and stays in
 * the map, and the rules that make it are the project's, as the camera's
 * inspector imports them.
 */
const withMinimap = (): Record<string, string> => {
  const files = projectFiles(WORLD_SCENARIOS.jetpack.source);
  const screen = JSON.parse(files['screens/main.screen']) as {
    actors: object[];
  };
  screen.actors.push({
    type: 'actors/viewport',
    id: 'Mini',
    properties: {positional: {position: {x: 80, y: 60}}},
    blocks: FOLLOW_THE_PILOT,
    camera: {
      traits: [
        'Camera Follow#FollowsTrait',
        'Camera Confined#ConfinedToTheMapTrait',
      ],
      values: [],
    },
  });
  const rules = Object.fromEntries(
    STOCK_RULES.filter(rule =>
      ['camera', 'cameraFollow', 'cameraConfined'].includes(rule.id),
    ).map(rule => [`rules/${rule.id}.rule`, rule.contents]),
  );
  return {...files, ...rules, 'screens/main.screen': JSON.stringify(screen)};
};

describe('a minimap of Jetpack that follows the Pilot', () => {
  it('follows the Pilot from one row in `on create`, confined to the level', async () => {
    const {world} = await compileProject(withMinimap());
    const mini = [...world.actors].find(actor => actor.id === 'Mini')!;
    const pilot = [...world.actors].find(
      actor => actor.type === 'actors/pilot',
    )!;
    const space = world.viewportSpaceOf(mini)!;
    expect(space.mirrorOf?.id).toBe('world');

    // Tick one drains the created event; tick two is the first the camera
    // can aim with both in place.
    world.tick(1 / 60);
    world.tick(1 / 60);
    const at = pilot.get(PositionProperty) as {x: number; y: number};
    const camera = space.camera!.position;
    const view = world.viewSize(space.camera!);
    const bounds = world.mapBounds(space.camera!);
    // On the Pilot on each axis, or as near as the level's edge allows —
    // which is `Confined to the Map` doing its part.
    const confined = (value: number, half: number, size: number) =>
      Math.min(Math.max(value, half), size - half);
    expect(camera.x).toBeCloseTo(confined(at.x, view.x / 2, bounds.x), 3);
    expect(camera.y).toBeCloseTo(confined(at.y, view.y / 2, bounds.y), 3);
    // …and it is the Pilot it is on, not the corner it started in.
    expect(camera).not.toEqual({x: view.x / 2, y: view.y / 2});
  }, 60000);
});
