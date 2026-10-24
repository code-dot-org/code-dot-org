// The camera that keeps an actor on screen — as edits, and then as a game.
//
// It is the WORLD's enhancement, and the actor is its answer: nothing here
// lands in an actor's file, and what lands in the world is its main camera's
// settings, on its main map. The half that matters is the second: a camera
// aimed at nobody sits at the middle of the map for the rest of the game with
// nothing in the console to say why.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty} from '../../../engine';
import {EMPTY_WORLD_PROJECT} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {cameraFollowEnhancement, followedIn} from '../cameraFollow';

/** The world being enhanced, and the two answers the project can give. */
const WORLD = {kind: 'world' as const, path: 'worlds/main', name: 'My World'};
const PLAYER = 'actors/player';
const GROUND = 'actors/ground';

/** The empty scenario with a Platformer Player and a Ground imported. */
const withActors = () => {
  let source = importStockActor(
    EMPTY_WORLD_PROJECT,
    stockActorById('player')!,
  ).source;
  source = importStockActor(source, stockActorById('ground')!).source;
  return source;
};

const world = (source: ReturnType<typeof withActors>) => {
  const id = fileIdAt(source, 'worlds/main.world')!;
  return source.files[id].contents;
};

/** The world's main camera, as the main map stores it. */
const mainCamera = (contents: string) =>
  (
    JSON.parse(contents) as {
      map?: {mainCamera?: {traits: string[]; values: {setter: string}[]}};
    }
  ).map?.mainCamera;

describe('the camera-follow enhancement, as edits', () => {
  it('makes the world’s main camera follow, kept in the map', () => {
    const after = cameraFollowEnhancement.apply(withActors(), WORLD, PLAYER);
    const contents = world(after);

    expect(mainCamera(contents)?.traits).toContain(
      'Camera Follow#FollowsTrait',
    );
    expect(followedIn(contents)).toBe('actors/player');
    // Data, not blocks: the map editor shows it as the main camera's, and
    // the code editor shows nothing (`placementCameras`).
    expect(contents).not.toContain('world_define_camera');
    expect(contents).not.toContain('world_use_camera');

    // …and the rule that aims it, which brings the one that moves the view.
    expect(fileIdAt(after, 'rules/cameraFollow.rule')).toBeTruthy();
    expect(fileIdAt(after, 'rules/camera.rule')).toBeTruthy();
  });

  it('keeps what else the main camera elects', () => {
    const once = cameraFollowEnhancement.apply(withActors(), WORLD, PLAYER);
    const id = fileIdAt(once, 'worlds/main.world')!;
    const file = JSON.parse(once.files[id].contents);
    file.map.mainCamera.traits.push('Camera Confined#ConfinedToTheMapTrait');
    const confined = {
      ...once,
      files: {
        ...once.files,
        [id]: {...once.files[id], contents: JSON.stringify(file)},
      },
    };

    const twice = cameraFollowEnhancement.apply(confined, WORLD, GROUND);
    expect(mainCamera(world(twice))?.traits).toEqual([
      'Camera Follow#FollowsTrait',
      'Camera Confined#ConfinedToTheMapTrait',
    ]);
  });

  it('does nothing the second time', () => {
    const once = cameraFollowEnhancement.apply(withActors(), WORLD, PLAYER);
    expect(cameraFollowEnhancement.applied(once, WORLD, PLAYER)).toBe(true);

    expect(world(cameraFollowEnhancement.apply(once, WORLD, PLAYER))).toBe(
      world(once),
    );
  });

  it('points the same camera somewhere else, rather than adding a rival', () => {
    // A world has one view. "Follow this one" said twice is a learner changing
    // their mind, not asking for two cameras.
    const once = cameraFollowEnhancement.apply(withActors(), WORLD, PLAYER);
    const twice = cameraFollowEnhancement.apply(once, WORLD, GROUND);

    expect(followedIn(world(twice))).toBe('actors/ground');
    expect(
      mainCamera(world(twice))?.values.filter(
        value =>
          value.setter === 'world_set_CameraFollow_ActorToFollowProperty',
      ),
    ).toHaveLength(1);
    expect(cameraFollowEnhancement.applied(twice, WORLD, PLAYER)).toBe(false);
  });

  it('offers the actors the project holds', () => {
    const files = cameraFollowEnhancement.asks!.options(withActors(), WORLD);
    expect(files.map(one => one.value)).toContain('actors/player');
  });
});

describe('the camera-follow enhancement, played', () => {
  /** The enhanced project, with a player placed where the test can find it. */
  const placed = () => {
    const source = cameraFollowEnhancement.apply(withActors(), WORLD, PLAYER);
    const worldId = fileIdAt(source, 'worlds/main.world')!;
    const parsed = JSON.parse(source.files[worldId].contents);
    const root = parsed.blocks.blocks.find(
      (block: {type: string}) => block.type === 'world_world',
    );
    // A row of the world's own: the stored camera is declared after all of
    // them, so it finds the Player wherever the row is.
    root.next = {
      block: {
        type: 'world_add_actor',
        fields: {ACTOR: 'actors/player'},
        inputs: {
          DO: {
            block: {
              type: 'world_set_position',
              inputs: {
                ACTOR: {block: {type: 'world_this_actor'}},
                X: {block: {type: 'math_number', fields: {NUM: 200}}},
                Y: {block: {type: 'math_number', fields: {NUM: 150}}},
              },
            },
          },
        },
        next: root.next,
      },
    };
    return {
      ...source,
      files: {
        ...source.files,
        [worldId]: {
          ...source.files[worldId],
          contents: JSON.stringify(parsed),
        },
      },
    };
  };

  it('puts the view on the actor, and keeps it there as it falls', async () => {
    const {world: running, modules} = await compileProject(
      projectFiles(placed()),
    );
    const jumping = modules['rules/jump'] as unknown as {JumpsTrait: never};
    const player = [...running.actors].find(actor =>
      actor.has(jumping.JumpsTrait),
    )!;

    running.tick(1 / 60);
    const view = () => running.cameraSnapshot().find(one => one.active)!;
    expect(view().position.x).toBeCloseTo(player.get(PositionProperty).x, 3);
    expect(view().position.y).toBeCloseTo(player.get(PositionProperty).y, 3);

    // A Platformer Player brings gravity, so playing the world at all moves
    // it — and the view has to arrive where it lands rather than where it
    // started.
    const before = player.get(PositionProperty).y;
    for (let frame = 0; frame < 30; frame++) {
      running.tick(1 / 60);
    }

    expect(player.get(PositionProperty).y).toBeGreaterThan(before);
    expect(view().position.y).toBeCloseTo(player.get(PositionProperty).y, 3);
  }, 60000);
});
