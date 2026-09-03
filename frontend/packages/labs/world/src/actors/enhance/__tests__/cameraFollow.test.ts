// The camera that keeps an actor on screen — as edits, and then as a game.
//
// It is the WORLD's enhancement, and the actor is its answer: nothing here
// lands in an actor's file. The half that matters is the second — five blocks
// in a world, one of which reads `any ⟨Player⟩` at the moment it runs, and the
// whole thing is silent when it is wrong. A camera aimed at nobody sits at the
// middle of the map for the rest of the game with nothing in the console to
// say why.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty} from '../../../engine';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
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
    WORLD_SCENARIOS.empty.source,
    stockActorById('player')!,
  ).source;
  source = importStockActor(source, stockActorById('ground')!).source;
  return source;
};

const world = (source: ReturnType<typeof withActors>) => {
  const id = fileIdAt(source, 'worlds/main.world')!;
  return source.files[id].contents;
};

describe('the camera-follow enhancement, as edits', () => {
  it('gives the world a camera, and looks through it', () => {
    const after = cameraFollowEnhancement.apply(withActors(), WORLD, PLAYER);
    const contents = world(after);

    expect(contents).toContain('world_define_camera');
    expect(contents).toContain('Camera Follow#FollowsTrait');
    expect(contents).toContain('world_set_CameraFollow_ActorToFollowProperty');
    // A world has a camera without asking, and it is not this one.
    expect(contents).toContain('world_use_camera');
    expect(followedIn(contents)).toBe('actors/player');

    // …and the rule that aims it, which brings the one that moves the view.
    expect(fileIdAt(after, 'rules/cameraFollow.rule')).toBeTruthy();
    expect(fileIdAt(after, 'rules/camera.rule')).toBeTruthy();
  });

  it('writes after everything else in the world', () => {
    // The ordering is load-bearing: `any ⟨Player⟩` is read when the camera is
    // declared, so one declared above `load map` is handed an empty list and
    // sits still for the whole game (`fixtures/flappy` says the same thing
    // over the same line).
    const contents = world(
      cameraFollowEnhancement.apply(withActors(), WORLD, PLAYER),
    );
    const parsed = JSON.parse(contents);
    const rows: string[] = [];
    for (
      let at = parsed.blocks.blocks.find(
        (block: {type: string}) => block.type === 'world_world',
      );
      at;
      at = at.next?.block
    ) {
      rows.push(at.type);
    }
    expect(rows[rows.length - 1]).toBe('world_use_camera');
    expect(rows[rows.length - 2]).toBe('world_define_camera');
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
    expect(world(twice).match(/world_define_camera/g)?.length).toBe(1);
    expect(cameraFollowEnhancement.applied(twice, WORLD, PLAYER)).toBe(false);
  });

  it('offers the actors this world can name — its own, and the files', () => {
    // Both kinds, because a world may hold both: `define actor` blocks are
    // `local:<block>`, files are their module paths.
    const single = WORLD_SCENARIOS['platformer-single'].source;
    const choices = cameraFollowEnhancement.asks!.options(single, {
      kind: 'world',
      path: 'worlds/main',
      name: 'Platform World',
    });

    expect(choices.map(one => one.name)).toContain('Ball');
    expect(choices.find(one => one.name === 'Ball')?.value).toBe(
      'local:platformerBallDef',
    );

    const files = cameraFollowEnhancement.asks!.options(withActors(), WORLD);
    expect(files.map(one => one.value)).toContain('actors/player');
  });

  it('takes a world-defined actor as its answer', () => {
    const single = WORLD_SCENARIOS['platformer-single'].source;
    const after = cameraFollowEnhancement.apply(
      single,
      {kind: 'world', path: 'worlds/main', name: 'Platform World'},
      'local:platformerBallDef',
    );

    expect(followedIn(world(after))).toBe('local:platformerBallDef');
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
    // In FRONT of the camera, which is where a placement has to go: the camera
    // reads `any ⟨Player⟩` as it is declared.
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
