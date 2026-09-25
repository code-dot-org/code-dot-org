// The Jetpack minimap, end to end: a Viewport placed on the world's main map,
// mirroring the world, told in its own `on create` to follow the Pilot — and
// nothing else. No camera declared, no trait row, no `look through`
// (specs/SPACE_CAMERAS_PLAN.md, "simplifying").
//
// WHY THIS EXISTS. The first report that it did not work came from a project
// whose `actors/viewport.actor` was imported before the stock Viewport elected
// `Follows` — a project holds its own copy of a stock actor, so a stock change
// reaches it only by re-importing — and the one row it had left set a property
// nothing read. This runs the whole chain against the stock actor as it ships:
// import, the main-map placement, the mirror binding, the created event, the
// property lent to the box's main camera, `Follows` aiming it through `in this
// space`, and `Confined to the Map` keeping it in the level.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {importStockActor} from '../../actors/importStockActor';
import {stockActorById} from '../../actors/stock';
import {PositionProperty} from '../../engine/rules/spatial';
import {fileIdAt, projectFiles} from '../../runtime/projectFiles';
import {WORLD_SCENARIOS} from '../scenarios';

/** The one row: `set actor to follow of ⟨this actor⟩ to ⟨any Pilot⟩`, under `on create`. */
const FOLLOW_THE_PILOT = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'world_on_Space_CreatedEvent',
        inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
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

/** Jetpack with the stock Viewport imported and placed on the world's main map. */
const withMinimap = () => {
  let source = importStockActor(
    WORLD_SCENARIOS.jetpack.source,
    stockActorById('viewport')!,
  ).source;
  const worldId = fileIdAt(source, 'worlds/main.world')!;
  const parsed = JSON.parse(source.files[worldId].contents);
  // Jetpack's world has no main map of its own — it `load map`s the level —
  // so placing a Viewport on it makes one, as the map editor would.
  parsed.map ??= {actors: []};
  parsed.map.actors.push({
    type: 'actors/viewport',
    id: 'Mini',
    properties: {
      positional: {position: {x: 80, y: 60}},
      showsMap: {mirrorsTheWorld: true},
    },
    blocks: FOLLOW_THE_PILOT,
  });
  source = {
    ...source,
    files: {
      ...source.files,
      [worldId]: {...source.files[worldId], contents: JSON.stringify(parsed)},
    },
  };
  return projectFiles(source);
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
    expect(space.mirrorOf?.id).toBe('main');

    // Tick one drains the created event and binds the mirror; tick two is the
    // first the camera can aim with both in place.
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
