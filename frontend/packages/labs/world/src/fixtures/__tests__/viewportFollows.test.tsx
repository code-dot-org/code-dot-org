// The Jetpack minimap, end to end: a second Viewport placed on the Main
// Screen, showing the one World as every Viewport does, told in its own `on
// create` to follow the Pilot — and nothing else. No camera declared, no trait
// row, no `look through` (specs/SPACE_CAMERAS_PLAN.md, "simplifying";
// specs/ONE_WORLD_PLAN.md).
//
// WHY THIS EXISTS. The first report that it did not work came from a project
// whose `actors/viewport.actor` was imported before the stock Viewport elected
// `Follows` — a project holds its own copy of a stock actor, so a stock change
// reaches it only by re-importing — and the one row it had left set a property
// nothing read. This runs the whole chain against the stock actor as it ships:
// import, the screen placement, the World it shows, the created event, the
// property lent to the box's main camera, `Follows` aiming it through `in this
// space`, and `Confined to the Map` keeping it in the level.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {PositionProperty} from '../../engine/rules/spatial';
import {projectFiles} from '../../runtime/projectFiles';
import {WORLD_SCENARIOS} from '../scenarios';

/** The one row: `set actor to follow of ⟨this actor⟩ to ⟨any Pilot⟩`, under `on create`. */
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
              ACTOR: {block: {type: 'world_this_actor'}},
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
 * shows the World the Game Viewport loaded. The scenario carries the stock
 * Viewport already.
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
  });
  return {...files, 'screens/main.screen': JSON.stringify(screen)};
};

describe('a minimap of Jetpack that follows the Pilot', () => {
  it('brings the camera rules with the Viewport', () => {
    const files = withMinimap();
    for (const rule of ['camera', 'cameraFollow', 'cameraConfined']) {
      expect(files[`rules/${rule}.rule`], rule).toBeDefined();
    }
    expect(files['actors/viewport.actor']).toContain(
      'Camera Follow#FollowsTrait',
    );
  });

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
