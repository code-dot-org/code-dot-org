// "A scoreboard" — the number on the screen, and the thing that keeps it true.
//
// The starter has one, hand-built, and every project that keeps a score wants
// the same three pieces: an actor that shows text, a handler that rewrites that
// text when the score changes, and somewhere to put it that does not scroll
// away. None of the three is hard and none of them is guessable.
//
// WHAT IT WRITES:
//
//   actors/scoreboard.actor  (new) Scoreboard, acting like the Label
//                                    trait  Scoring#Watches the Score
//                                    text   ⟨"SCORE 0"⟩
//                                  when ⟨this actor⟩ sees the score change:
//                                    set text of ⟨this actor⟩ to
//                                      join ⟨"SCORE "⟩ ⟨the score⟩
//
// THE TRAIT IS WHAT MAKES THE HAT FIRE. "Sees the score change" is an actor's
// event, and an actor hears it because it elected to watch — a scoreboard that
// only drew text would sit there saying whatever it was seeded with, which is
// exactly what this looked like before the row was added.
//
//   screens/main.screen          Scoreboard placed, docked in a bar a
//                                  tile high above the rest of the screen
//
// A KIND OF ITS OWN, rather than the stock Label placed and pointed at. The
// handler has to name what it is about, and a hat names a KIND: on `any
// ⟨Label⟩` it would rewrite every label in the project, including the ones the
// learner put there to say something else. So the scoreboard is a Label whose
// name is Scoreboard — a kind that ACTS LIKE a Label, which is what the
// starter's own `scoreboard.actor` is.
//
// AND IT GOES ON THE SCREEN, beside the Viewport rather than in the level it
// shows, which is the piece a learner discovers last and by accident. A score
// in the level slides off the moment anything moves the camera; one on the
// screen is part of the game rather than of the room. Docked, so it takes its
// share of any window (specs/DOCKING_PLAN.md), as the starter's HUD does.

import {getNextFileId} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {folderIn} from '../../projectWrite';
import {fileIdAt} from '../../runtime/projectFiles';
import {actorDocument} from '../actorDocument';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';
import {labelValue} from '../stock/workspace';

import {edit, importRules, me} from './actorPatch';
import type {Enhancement, EnhanceTarget} from './enhancements';
import type {BlockJson} from './patch';

/** What makes an actor hear that the score changed. */
const WATCHES = 'Scoring#WatchesTheScoreTrait';

/** Where the board lands, and what it calls itself. */
const BOARD_PATH = 'actors/scoreboard';
const BOARD_NAME = 'Scoreboard';
/** How tall the bar it is docked in is: one tile, as the starter's. */
const BAR = 32;
/** Where the editor first draws it; docked, the layout places it. */
const AT = {x: 48, y: 16};

/** What it says before anything has been scored, as the starter's does. */
const SEED = 'SCORE 0';

/** `set text of ⟨who⟩ to ⟨value⟩`. */
const setText = (who: object, value: object): BlockJson => ({
  // The LABEL's property, which the board has by acting like one: the four
  // text properties were a rule's and are the Label's own now
  // (specs/UI_ACTORS.md).
  type: 'world_set_ActorsLabel_TextProperty',
  inputs: {ACTOR: who, VALUE: value},
});

/** The hat that keeps the number true. */
const watcher = (): BlockJson => ({
  type: 'world_on_Scoring_SeesTheScoreChangeEvent',
  next: {
    block: setText(me(), {
      // `⟨SCORE ⟩ + ⟨“ the score ”⟩` — a chain, read left to right. It was
      // `text_join` and a mutator; the score joins as WORDS through `as text`,
      // because a chain of strings is the one shape that cannot quietly do
      // arithmetic instead (`domainBlocks.worldAsText`).
      block: {
        type: 'text',
        fields: {TEXT: 'SCORE '},
        inputs: {
          ADD: {
            block: {
              type: 'world_as_text',
              inputs: {
                VALUE: {block: {type: 'world_get_Scoring_ScoreProperty'}},
              },
            },
          },
        },
      },
    }),
  },
});

/** A Main Screen, as much of it as this reads. */
interface ScreenFile {
  actors?: Array<{type?: string; id?: string}>;
  layout?: unknown;
  [key: string]: unknown;
}

/** Whether this screen already has the board on it. */
const placed = (contents: string): boolean =>
  ((JSON.parse(contents) as ScreenFile).actors ?? []).some(
    actor => actor.type === BOARD_PATH,
  );

/**
 * The screen with the board placed, and docked in a bar above whatever the
 * screen laid out before (`docking`).
 */
const withBoard = (contents: string): string => {
  const screen = JSON.parse(contents) as ScreenFile;
  return JSON.stringify(
    {
      ...screen,
      actors: [
        ...(screen.actors ?? []),
        {
          type: BOARD_PATH,
          id: BOARD_NAME,
          properties: {positional: {position: AT}},
        },
      ],
      layout: {
        split: 'down',
        fixed: 'first',
        size: BAR,
        first: {dock: BOARD_NAME},
        second: screen.layout ?? {dock: 'Game'},
      },
    },
    null,
    2,
  );
};

/** Write the scoreboard's file, if the project has not got one. */
const writeBoard = (source: MultiFileSource): MultiFileSource => {
  if (fileIdAt(source, `${BOARD_PATH}.actor`)) {
    return source;
  }
  const placedIn = folderIn(source, 'actors');
  const fileId = getNextFileId(Object.values(placedIn.source.files));
  // A LABEL THAT WATCHES THE SCORE, said as data rather than copied out.
  //
  // It used to be the stock Label's file RENAMED, which worked while `text`
  // belonged to a rule: the same block type meant the same property wherever
  // the file lived. It is the Label's OWN property now, and an own property's
  // block carries the file that declared it — so a copy at a new path declared
  // a different `text`, and the handler below wrote one nothing read.
  //
  // Acting like it is both smaller and correct: the words, their size and
  // color, the box and the picture all come across, and they stay the LABEL's
  // (`ActorBuilder.actsLike`).
  const contents = actorDocument({
    name: BOARD_NAME,
    actsLike: 'actors/label',
    traits: [WATCHES],
    values: [labelValue('TextProperty', {type: 'string', value: SEED})],
    code: [watcher()],
  });
  return {
    ...placedIn.source,
    files: {
      ...placedIn.source.files,
      [fileId]: {
        id: fileId,
        name: `${BOARD_NAME.toLowerCase()}.actor`,
        language: 'actor',
        contents,
        folderId: placedIn.folderId,
      },
    },
  };
};

export const scoreboardEnhancement: Enhancement = {
  id: 'scoreboard',
  // The GAME's: what is on the screen while it is played, and where it sits,
  // are the Main Screen's business — and the score it shows is the game's
  // number.
  subject: 'world',
  name: 'A scoreboard',
  description:
    'Puts the score on the screen and keeps it there: a Scoreboard actor in a bar above the game, which stays put when the view moves, saying what the score is whenever it changes.',
  brings: ['Keeps Score', 'a Scoreboard actor'],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const id = fileIdAt(source, `${target.path}.screen`);
    return Boolean(id && placed(source.files[id].contents));
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    let current = importRules(source, ['Scoring']);
    // …and the Label the board ACTS LIKE. `acts like` names a module path, and
    // a path naming a file the project does not hold inherits nothing at all —
    // no words, no box, no picture.
    const label = stockActorById('label');
    if (label) {
      current = importStockActor(current, label).source;
    }
    current = writeBoard(current);

    const id = fileIdAt(current, `${target.path}.screen`);
    if (!id || placed(current.files[id].contents)) {
      return current;
    }
    return edit(current, id, withBoard);
  },
};

/** Exported for the test that reads where the board was put. */
export const boardPath = BOARD_PATH;
