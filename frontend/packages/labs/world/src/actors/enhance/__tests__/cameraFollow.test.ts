// The camera that keeps an actor on screen — as edits, and then as a game.
//
// It is the GAME's enhancement, and the actor is its answer: nothing here
// lands in an actor's file, and what lands on the Main Screen is a camera on
// the Viewport the level is shown through. The half that matters is the
// second: a camera aimed at nobody sits at the middle of the map for the rest
// of the game with nothing in the console to say why.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty} from '../../../engine';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {cameraFollowEnhancement, followedIn} from '../cameraFollow';

/** The game being enhanced, and the two answers the project can give. */
const GAME = {kind: 'world' as const, path: 'screens/main', name: 'My Game'};
const PLAYER = 'actors/player';
const GROUND = 'actors/ground';

/** The empty game with a Platformer Player and a Ground imported. */
const withActors = () => {
  let source = importStockActor(
    WORLD_SCENARIOS.empty.source,
    stockActorById('player')!,
  ).source;
  source = importStockActor(source, stockActorById('ground')!).source;
  return source;
};

const screenOf = (source: ReturnType<typeof withActors>) => {
  const id = fileIdAt(source, 'screens/main.screen')!;
  return source.files[id].contents;
};

type Camera = {name: string; traits: string[]; values: {setter: string}[]};

/** The Game Viewport, its cameras, and the one it looks through. */
const gameOf = (contents: string) => {
  const game = (
    JSON.parse(contents) as {
      actors: Array<{
        id: string;
        cameras?: Camera[];
        properties?: {showsMap?: {showsThrough?: string}};
      }>;
    }
  ).actors.find(actor => actor.id === 'Game')!;
  const through = game.properties?.showsMap?.showsThrough;
  return {
    cameras: game.cameras ?? [],
    camera: game.cameras?.find(camera => camera.name === through),
  };
};

describe('the camera-follow enhancement, as edits', () => {
  it('gives the Game Viewport a camera that follows, and looks through it', () => {
    const after = cameraFollowEnhancement.apply(withActors(), GAME, PLAYER);
    const contents = screenOf(after);

    expect(gameOf(contents).camera?.traits).toContain(
      'Camera Follow#FollowsTrait',
    );
    expect(followedIn(contents)).toBe('actors/player');
    // Data, not blocks: the camera inspector shows it as the Viewport's, and
    // the code shows nothing (`placementCameras`).
    expect(contents).not.toContain('world_define_camera');
    expect(contents).not.toContain('world_use_camera');

    // …and the rule that aims it, which brings the one that moves the view.
    expect(fileIdAt(after, 'rules/cameraFollow.rule')).toBeTruthy();
    expect(fileIdAt(after, 'rules/camera.rule')).toBeTruthy();
  });

  it('keeps what else that camera elects', () => {
    const once = cameraFollowEnhancement.apply(withActors(), GAME, PLAYER);
    const id = fileIdAt(once, 'screens/main.screen')!;
    const file = JSON.parse(once.files[id].contents);
    file.actors
      .find((actor: {id: string}) => actor.id === 'Game')
      .cameras[0].traits.push('Camera Confined#ConfinedToTheMapTrait');
    const confined = {
      ...once,
      files: {
        ...once.files,
        [id]: {...once.files[id], contents: JSON.stringify(file)},
      },
    };

    const twice = cameraFollowEnhancement.apply(confined, GAME, GROUND);
    expect(gameOf(screenOf(twice)).camera?.traits).toEqual([
      'Camera Follow#FollowsTrait',
      'Camera Confined#ConfinedToTheMapTrait',
    ]);
  });

  it('does nothing the second time', () => {
    const once = cameraFollowEnhancement.apply(withActors(), GAME, PLAYER);
    expect(cameraFollowEnhancement.applied(once, GAME, PLAYER)).toBe(true);

    expect(screenOf(cameraFollowEnhancement.apply(once, GAME, PLAYER))).toBe(
      screenOf(once),
    );
  });

  it('points the same camera somewhere else, rather than adding a rival', () => {
    // A game has one view. "Follow this one" said twice is a learner changing
    // their mind, not asking for two cameras.
    const once = cameraFollowEnhancement.apply(withActors(), GAME, PLAYER);
    const twice = cameraFollowEnhancement.apply(once, GAME, GROUND);

    expect(followedIn(screenOf(twice))).toBe('actors/ground');
    const {cameras, camera} = gameOf(screenOf(twice));
    expect(cameras).toHaveLength(1);
    expect(
      camera?.values.filter(
        value =>
          value.setter === 'world_set_CameraFollow_ActorToFollowProperty',
      ),
    ).toHaveLength(1);
    expect(cameraFollowEnhancement.applied(twice, GAME, PLAYER)).toBe(false);
  });

  it('offers the actors the project holds', () => {
    const files = cameraFollowEnhancement.asks!.options(withActors(), GAME);
    expect(files.map(one => one.value)).toContain('actors/player');
  });
});

describe('the camera-follow enhancement, played', () => {
  /** The enhanced game, with a player placed on its map. */
  const placed = () => {
    const source = cameraFollowEnhancement.apply(withActors(), GAME, PLAYER);
    const mapId = fileIdAt(source, 'maps/main.map')!;
    const map = JSON.parse(source.files[mapId].contents);
    map.actors = [
      ...map.actors,
      {
        type: 'actors/player',
        id: 'Player',
        properties: {positional: {position: {x: 200, y: 150}}},
      },
    ];
    return {
      ...source,
      files: {
        ...source.files,
        [mapId]: {...source.files[mapId], contents: JSON.stringify(map)},
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
    // The view is the level's, through the camera the Game looks through.
    const view = () => running.spaces[0].camera!;
    expect(view().position.x).toBeCloseTo(player.get(PositionProperty).x, 3);
    expect(view().position.y).toBeCloseTo(player.get(PositionProperty).y, 3);

    // A Platformer Player brings gravity, so playing the game at all moves it
    // — and the view has to arrive where it lands rather than where it
    // started.
    const before = player.get(PositionProperty).y;
    for (let frame = 0; frame < 30; frame++) {
      running.tick(1 / 60);
    }

    expect(player.get(PositionProperty).y).toBeGreaterThan(before);
    expect(view().position.y).toBeCloseTo(player.get(PositionProperty).y, 3);
  }, 60000);
});
