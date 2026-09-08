// "A scoreboard" — the number on the screen, and the thing that keeps it true.
//
// The starter has one, hand-built, and every project that keeps a score wants
// the same three pieces: an actor that shows text, a handler that rewrites that
// text when the score changes, and somewhere to put it that does not scroll
// away. None of the three is hard and none of them is guessable.
//
// WHAT IT WRITES:
//
//   actors/scoreboard.actor  (new) define actor named ⟨Scoreboard⟩
//                                    …the stock Label's own blocks…
//                                    use trait ⟨Scoring#Watches the Score⟩
//                                  when ⟨this actor⟩ sees the score change:
//                                    set text of ⟨this actor⟩ to
//                                      join ⟨"SCORE "⟩ ⟨the score⟩
//
// THE TRAIT IS WHAT MAKES THE HAT FIRE. "Sees the score change" is an actor's
// event, and an actor hears it because it elected to watch — a scoreboard that
// only drew text would sit there saying whatever it was seeded with, which is
// exactly what this looked like before the row was added.
//
//   worlds/<world>.world           define layer ⟨Interface⟩ do:
//                                    this layer ⟨fixed⟩
//                                    add actor ⟨Scoreboard⟩ do:
//                                      set position ⟨48, 16⟩
//
// A KIND OF ITS OWN, rather than the stock Label placed and pointed at. The
// handler has to name what it is about, and a hat names a KIND: on `any
// ⟨Label⟩` it would rewrite every label in the project, including the ones the
// learner put there to say something else. So the scoreboard is a Label whose
// name is Scoreboard — a kind that ACTS LIKE a Label, which is what the
// starter's own `scoreboard.actor` is.
//
// AND IT GOES ON A FIXED LAYER, which is the piece a learner discovers last
// and by accident. A world-space score sits where it was placed and slides off
// the screen the moment anything moves the camera; `this layer fixed` is what
// makes something part of the SCREEN rather than part of the room. Written
// here even in a project with no camera, because the day one arrives — the
// camera enhancement is one click away — nothing about the scoreboard should
// need revisiting.
//
// LAST IN THE WORLD's chain, so it is defined after the map and drawn over it.

import {getNextFileId} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {folderIn} from '../../projectWrite';
import {importStockRule} from '../../rules/importStockRule';
import {STOCK_RULES} from '../../rules/stock';
import {fileIdAt} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

import type {Enhancement, EnhanceTarget} from './enhancements';
import {addRoot, append, rowsUnder, type BlockJson} from './patch';

/** What makes an actor hear that the score changed. */
const WATCHES = 'Scoring#WatchesTheScoreTrait';

/** Where the board lands, and what it calls itself. */
const BOARD_PATH = 'actors/scoreboard';
const BOARD_NAME = 'Scoreboard';
/** The layer it sits on, and the block that declares it. */
const LAYER_ID = 'enhanceInterfaceLayer';
const LAYER_NAME = 'Interface';
/**
 * Where on the screen, in pixels from the top left of the view.
 *
 * The top-left corner, a Label's half-height down so the words are not cut in
 * two by the edge — the same measurement `fixtures/tapper` explains for the
 * same reason.
 */
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

/** `this actor`, as a socket's contents. */
const me = () => ({block: {type: 'world_this_actor'}});

/** The hat that keeps the number true. */
const watcher = (): BlockJson => ({
  type: 'world_on_Scoring_SeesTheScoreChangeEvent',
  inputs: {ACTOR: me()},
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

/** The layer, and the board on it. */
const hud = (): BlockJson => ({
  type: 'world_define_layer',
  id: LAYER_ID,
  fields: {NAME: LAYER_NAME},
  inputs: {
    DO: {
      block: {
        type: 'world_layer_fixed',
        fields: {FIXED: 'fixed'},
        next: {
          block: {
            type: 'world_add_actor',
            fields: {ACTOR: BOARD_PATH},
            inputs: {
              DO: {
                block: {
                  type: 'world_set_position',
                  inputs: {
                    ACTOR: me(),
                    X: {block: {type: 'math_number', fields: {NUM: AT.x}}},
                    Y: {block: {type: 'math_number', fields: {NUM: AT.y}}},
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

/** Whether this world already has the board on its own interface layer. */
const placed = (contents: string): boolean =>
  rowsUnder(contents, {type: 'world_world'}).some(
    row => row.type === 'world_define_layer' && row.id === LAYER_ID,
  );

/** Write the scoreboard's file, if the project has not got one. */
const writeBoard = (source: MultiFileSource): MultiFileSource => {
  if (fileIdAt(source, `${BOARD_PATH}.actor`)) {
    return source;
  }
  const placedIn = folderIn(source, 'actors');
  const fileId = getNextFileId(Object.values(placedIn.source.files));
  // A LABEL THAT WATCHES THE SCORE, said in a row rather than copied out.
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
  const contents = addRoot(
    JSON.stringify(
      {
        blocks: {
          blocks: [
            {
              type: 'world_actor',
              x: 20,
              y: 20,
              fields: {NAME: BOARD_NAME},
              next: {
                block: {
                  type: 'world_acts_like',
                  fields: {ACTOR: 'actors/label'},
                  next: {
                    block: {
                      type: 'world_use_trait',
                      fields: {TRAIT: WATCHES},
                      next: {
                        block: setText(me(), {
                          shadow: {type: 'text', fields: {TEXT: SEED}},
                        }),
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      },
      null,
      2,
    ),
    watcher(),
  );
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

/** Rewrite one file's contents, leaving the rest of the project alone. */
const edit = (
  source: MultiFileSource,
  id: string,
  change: (contents: string) => string,
): MultiFileSource => ({
  ...source,
  files: {
    ...source.files,
    [id]: {...source.files[id], contents: change(source.files[id].contents)},
  },
});

export const scoreboardEnhancement: Enhancement = {
  id: 'scoreboard',
  // The WORLD's: what is on the screen while this world is played, and where
  // it sits, are the world's business — and the score it shows is the world's
  // number.
  subject: 'world',
  name: 'A scoreboard',
  description:
    'Puts the score on the screen and keeps it there: a Scoreboard actor in the corner, on a layer that stays put when the view moves, saying what the score is whenever it changes.',
  brings: ['Keeps Score', 'a Scoreboard actor'],
  applied(source: MultiFileSource, target: EnhanceTarget) {
    const id = fileIdAt(source, `${target.path}.world`);
    return Boolean(id && placed(source.files[id].contents));
  },
  apply(source: MultiFileSource, target: EnhanceTarget) {
    let current = source;
    for (const name of ['Scoring']) {
      const rule = STOCK_RULES.find(one => one.name === name);
      if (rule) {
        current = importStockRule(current, rule).source;
      }
    }
    // …and the Label the board ACTS LIKE. `acts like` names a module path, and
    // a path naming a file the project does not hold inherits nothing at all —
    // no words, no box, no picture.
    const label = stockActorById('label');
    if (label) {
      current = importStockActor(current, label).source;
    }
    current = writeBoard(current);

    const id = fileIdAt(current, `${target.path}.world`);
    if (!id || placed(current.files[id].contents)) {
      return current;
    }
    return edit(current, id, contents =>
      append(contents, {type: 'world_world'}, [hud()]),
    );
  },
};

/** Exported for the test that reads where the board was put. */
export const boardPath = BOARD_PATH;
export const boardLayer = LAYER_ID;
