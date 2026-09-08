// The number on the screen, and the thing that keeps it true.
//
// The other half of the pair: one enhancement lets an actor collect and pay
// for it, this one shows what that came to. So the game half of this test
// applies BOTH, which is the only way to see either of them work — a score
// nothing displays and a display of a score nothing changes are equally
// convincing on their own.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {collectsEnhancement} from '../collects';
import {boardLayer, boardPath, scoreboardEnhancement} from '../scoreboard';

const WORLD = {kind: 'world' as const, path: 'worlds/main', name: 'My World'};
const PLAYER = {
  kind: 'actor' as const,
  path: 'actors/player',
  name: 'Platformer Player',
};

/** The empty scenario with a Player, a Ground and a Coin in it. */
const withActors = () => {
  let source = WORLD_SCENARIOS.empty.source;
  for (const id of ['player', 'ground', 'coin']) {
    source = importStockActor(source, stockActorById(id)!).source;
  }
  return source;
};

const at = (source: ReturnType<typeof withActors>, path: string) => {
  const id = fileIdAt(source, path);
  return id ? source.files[id].contents : undefined;
};

describe('the scoreboard enhancement, as edits', () => {
  it('makes an actor of its own, which is a Label by another name', () => {
    const after = scoreboardEnhancement.apply(withActors(), WORLD);
    const board = at(after, `${boardPath}.actor`)!;

    // A KIND of its own: a hat names a kind, and one on `any ⟨Label⟩` would
    // rewrite every label the learner has.
    expect(board).toContain('"NAME": "Scoreboard"');
    // …that ACTS LIKE the Label rather than copying it. It used to be that
    // file renamed, which worked while `text` belonged to a rule; an own
    // property's block carries the file that declared it, so a copy at a new
    // path declared a different `text` and the handler wrote one nothing read.
    expect(board).toContain('actors/label');
    // …and the trait that makes the hat fire at all: an actor hears about the
    // score because it elected to watch it.
    expect(board).toContain('Scoring#WatchesTheScoreTrait');
    expect(board).toContain('world_on_Scoring_SeesTheScoreChangeEvent');
    expect(board).toContain('world_get_Scoring_ScoreProperty');
    // …and it says something sensible before anything has been scored, rather
    // than the word the Label was seeded with.
    expect(board).toContain('SCORE 0');
    expect(board).not.toContain('"TEXT": "Label"');
  });

  it('puts it on a layer that does not scroll away', () => {
    const world = at(
      scoreboardEnhancement.apply(withActors(), WORLD),
      'worlds/main.world',
    )!;

    expect(world).toContain(boardLayer);
    // The piece a learner finds last and by accident: a world-space score
    // slides off the moment anything moves the camera.
    expect(world).toContain('world_layer_fixed');
    expect(world).toContain(boardPath);
  });

  it('does nothing the second time', () => {
    const once = scoreboardEnhancement.apply(withActors(), WORLD);
    expect(scoreboardEnhancement.applied(once, WORLD)).toBe(true);

    const twice = scoreboardEnhancement.apply(once, WORLD);
    expect(at(twice, 'worlds/main.world')).toBe(at(once, 'worlds/main.world'));
    expect(at(twice, `${boardPath}.actor`)).toBe(
      at(once, `${boardPath}.actor`),
    );
  });
});

describe('the pair, played', () => {
  const place = (path: string, x: number, y: number) => ({
    type: 'world_add_actor',
    fields: {ACTOR: path},
    inputs: {
      DO: {
        block: {
          type: 'world_set_position',
          inputs: {
            ACTOR: {block: {type: 'world_this_actor'}},
            X: {block: {type: 'math_number', fields: {NUM: x}}},
            Y: {block: {type: 'math_number', fields: {NUM: y}}},
          },
        },
      },
    },
  });

  /** A player standing on a coin, with a scoreboard watching. */
  const game = () => {
    let source = collectsEnhancement.apply(withActors(), PLAYER);
    source = scoreboardEnhancement.apply(source, WORLD);
    const worldId = fileIdAt(source, 'worlds/main.world')!;
    const parsed = JSON.parse(source.files[worldId].contents);
    const root = parsed.blocks.blocks.find(
      (block: {type: string}) => block.type === 'world_world',
    );
    // Chained IN FRONT of whatever the enhancements appended, rather than over
    // it: the scoreboard's layer is a row in this same chain.
    root.next = {
      block: {
        ...place('actors/ground', 100, 200),
        next: {
          block: {
            ...place('actors/coin', 100, 100),
            next: {
              block: {...place('actors/player', 100, 100), next: root.next},
            },
          },
        },
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

  /** What the scoreboard is drawing, as the driver would read it. */
  const said = (world: {renderSnapshot: () => unknown[]}): string[] =>
    (
      world.renderSnapshot() as Array<{
        drawing?: {commands: Array<{op: string; text?: string}>};
      }>
    ).flatMap(state =>
      (state.drawing?.commands ?? []).flatMap(command =>
        command.op === 'text' && command.text !== undefined
          ? [command.text]
          : [],
      ),
    );

  it('says SCORE 10 once the coin has been taken', async () => {
    const {world} = await compileProject(projectFiles(game()));

    // Before anything happens it says what the Label was seeded with, which is
    // its own text rather than a number nobody has scored yet.
    world.tick(1 / 60);
    expect(said(world)).toContain('SCORE 0');

    // Take the coin, pay for it, and rewrite the board: three handlers in
    // three files, and nothing but ticking connects them.
    for (let frame = 0; frame < 5; frame++) {
      world.tick(1 / 60);
    }

    expect(said(world)).toContain('SCORE 10');
  }, 60000);
});
