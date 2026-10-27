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
import {boardPath, scoreboardEnhancement} from '../scoreboard';

const GAME = {kind: 'world' as const, path: 'screens/main', name: 'My Game'};
const PLAYER = {
  kind: 'actor' as const,
  path: 'actors/player',
  name: 'Platformer Player',
};

/** The empty game with a Player, a Ground and a Coin in its project. */
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
    const after = scoreboardEnhancement.apply(withActors(), GAME);
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

  it('puts it on the screen, docked above the game', () => {
    const screen = JSON.parse(
      at(
        scoreboardEnhancement.apply(withActors(), GAME),
        'screens/main.screen',
      )!,
    ) as {actors: Array<{type: string; id: string}>; layout: unknown};

    // On the screen rather than in the level, so moving the camera moves the
    // room and not the score.
    expect(screen.actors.map(actor => actor.type)).toContain(boardPath);
    // …and in a bar of its own above what was there, the Viewport called Game.
    expect(screen.layout).toEqual({
      split: 'down',
      fixed: 'first',
      size: 32,
      first: {dock: 'Scoreboard'},
      second: {dock: 'Game'},
    });
  });

  it('does nothing the second time', () => {
    const once = scoreboardEnhancement.apply(withActors(), GAME);
    expect(scoreboardEnhancement.applied(once, GAME)).toBe(true);

    const twice = scoreboardEnhancement.apply(once, GAME);
    expect(at(twice, 'worlds/main.world')).toBe(at(once, 'worlds/main.world'));
    expect(at(twice, `${boardPath}.actor`)).toBe(
      at(once, `${boardPath}.actor`),
    );
  });
});

describe('the pair, played', () => {
  const place = (type: string, id: string, x: number, y: number) => ({
    type,
    id,
    properties: {positional: {position: {x, y}}},
  });

  /** A player standing on a coin, on the map, with a scoreboard watching. */
  const game = () => {
    let source = collectsEnhancement.apply(withActors(), PLAYER);
    source = scoreboardEnhancement.apply(source, GAME);
    const mapId = fileIdAt(source, 'maps/main.map')!;
    const map = JSON.parse(source.files[mapId].contents);
    map.actors = [
      ...map.actors,
      place('actors/ground', 'Ground', 100, 200),
      place('actors/coin', 'Coin', 100, 100),
      place('actors/player', 'Player', 100, 100),
    ];
    return {
      ...source,
      files: {
        ...source.files,
        [mapId]: {...source.files[mapId], contents: JSON.stringify(map)},
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
