// Notes: the first thing in this lab that is an APP rather than a game.
//
// Every piece of specs/APPS.md's list was built and tested alone — screens
// have a demo, saving has a test, the keyboard has a play test that types into
// a field. Nothing had ever put them in one artifact, and a seam between two
// of them is invisible until something crosses it. That is what this is for.
//
// WHAT IT USES, which is the whole list:
//
//   • two SCREENS and a way back down (specs/SCREEN_STACK_PLAN.md);
//   • a FORM — a Text Input on the second screen (`actors/textInput`);
//   • a LIST showing what has been written (`actors/list`);
//   • ANCHORING, so the header and the button hold their edges on a window
//     that is not the shape the map was drawn at (specs/ANCHORS_PLAN.md);
//   • SAVING, so the notes outlive a reload (specs/SAVING_PLAN.md).
//
// It is the app specs/SAVING_PLAN.md asks for in as many words: "a world with
// a list of its own, a Text Input that adds to it, `save what the world
// remembers as ⟨notes⟩` after each change, and `when ⟨…⟩ is created` doing the
// `load`." Written there as a thing to look at in a browser, and now a thing a
// test can play.
//
// THE BUTTONS SPEAK THROUGH THE GAME'S EVENTS, which is the pattern the pause
// menu established (specs/UI_ACTORS.md) and the only one available here: `the
// ⟨Save⟩` names a placement and is a screen's own block, and `any ⟨Button⟩`
// cannot tell three buttons apart. So a placement script on the write screen
// raises the Main Screen's event, and the Main Screen answers. Moving a button
// rewires nothing.
//
// NO ON-SCREEN KEYBOARD, for now. It typed into the form under it, and only
// the top screen takes input until a screen can let it through
// (specs/SCREEN_STACK_PLAN.md, "Not in this plan").
//
// ON A PHONE-SHAPED SCREEN, ten tiles by eighteen, the same shape the
// Interface Kit uses and for the same reason: a form on a square window looks
// like a game with a form in it.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockActor} from '../actors/importStockActor';
import {stockActorById} from '../actors/stock';
import {
  actorFile,
  chain,
  defineMap,
  defineProperty,
  emitWorldEvent,
  hearWorldEvent,
  isData,
  me,
} from '../actors/stock/workspace';
import {APP_ACTORS} from '../appBuilder';
import {MAIN_SCREEN_PATH} from '../mainWorld';
import {TILE_SIZE} from '../runtime/viewport';

/** The screen, in tiles: the standard width, and a phone's height. */
export const PORTRAIT = {columns: 10, rows: 18};
const WIDTH = PORTRAIT.columns * TILE_SIZE;

const words = (text: string) => ({block: {type: 'text', fields: {TEXT: text}}});

/** `any ⟨kind⟩` — how a world names the actor a handler is about. */
const kind = (path: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: path}},
});

interface PlaceOpts {
  /** Which edge of the window this placement holds on to. */
  anchor?: string;
  /** The `emit` block this placement's own script runs when it is clicked. */
  emits?: object;
  /** …or what it DOES when clicked, for a placement on the world's own map. */
  does?: object[];
  /** Per-owner property overrides, keyed as the engine keys them. */
  own?: Record<string, Record<string, unknown>>;
}

/** `when this actor is clicked with ⟨any⟩: emit ⟨the map's event⟩`. */
/**
 * A placement's own workspace: when it is clicked, do these.
 *
 * THE ROWS USED TO BE ONE `emit`, always, because a screen was a separate
 * file and a map that wanted the world to act had to say so and be heard. The
 * world's OWN map needs no such message — the world is right there — so
 * home's button goes to the write screen itself, and only the maps that are
 * still files announce (specs/MAIN_MAP_PLAN.md).
 */
const onClick = (rows: object[]) => ({
  blocks: {
    blocks: {
      blocks: [
        {
          type: 'world_on_Mouse_IsClickedWithEvent',
          fields: {FILTER0: ''},
          x: 20,
          y: 20,
          next: {block: chain(rows)},
        },
      ],
    },
  },
});

const clickEmits = (emit: object) => onClick([emit]);

/** One placement: a kind, a name, its centre, and what it overrides. */
const place = (
  type: string,
  id: string,
  x: number,
  y: number,
  {anchor, emits, does, own = {}}: PlaceOpts = {},
) => ({
  type,
  id,
  ...(anchor ? {anchor} : {}),
  properties: {...own, positional: {position: {x, y}, ...own.positional}},
  ...(does ? onClick(does) : emits ? clickEmits(emits) : {}),
});

/**
 * The main map's shape: the placements, and no workspace.
 *
 * A `.map` has a workspace of its own, opening with its `define map` root, and
 * a world's map does not, because the world's workspace IS its workspace
 * (`mapEditor/worldDocument`, `hasMapScript`). So home has nothing to declare
 * and its button goes to the write screen itself.
 */
const mainMap = (actors: object[]) => ({
  type: 'map' as const,
  size: {width: PORTRAIT.columns, height: PORTRAIT.rows},
  tile: {width: TILE_SIZE, height: TILE_SIZE},
  actors,
});

const screenFile = (name: string, actors: object[]) =>
  JSON.stringify(
    {
      type: 'map',
      size: {width: PORTRAIT.columns, height: PORTRAIT.rows},
      tile: {width: TILE_SIZE, height: TILE_SIZE},
      actors,
      // The screen's own workspace: what it is called. Which of the game's
      // events it raises is what its placements' `emit` blocks say.
      blocks: defineMap(name),
    },
    null,
    2,
  );

// ── The screens ─────────────────────────────────────────────────────────────

/**
 * Home: what has been written, and the way to write more.
 *
 * The header HOLDS THE TOP and the button HOLDS THE BOTTOM, so this screen is
 * still laid out on a window taller or shorter than the one it was drawn at.
 * That is the case anchoring exists for, met here rather than imagined — and
 * it is why the two of them are anchored and the list between them is not: a
 * list is the thing that should take up whatever room is left.
 *
 * Its controls do not dodge the screen that comes up over them: only the top
 * screen takes input, so NEW NOTE at the foot of this one cannot be pressed
 * through the write screen (specs/SCREEN_STACK_PLAN.md).
 */
const HOME_MAP = mainMap([
  place('actors/label', 'Header', WIDTH / 2, 48, {
    anchor: 'top',
    own: {Label: {text: 'NOTES'}},
  }),
  place('actors/list', 'Notes', WIDTH / 2, 260, {
    own: {hasABox: {width: 280, height: 320}},
  }),
  place('actors/button', 'New', WIDTH / 2, 520, {
    anchor: 'bottom',
    own: {Label: {text: 'NEW NOTE'}, hasABox: {width: 200}},
    // IT GOES, RATHER THAN ANNOUNCING. Home is the Main Screen, so the button
    // shows the write screen itself; the write screen announces, since it is
    // written apart from the handlers (specs/MAIN_MAP_PLAN.md).
    does: [{type: 'world_show_screen', fields: {SCREEN: 'screens/write'}}],
  }),
]);

/**
 * Write: one field and two answers, a screen shown over home. It has no color
 * of its own, so home shows under it.
 */
const WRITE_SCREEN = screenFile('Write', [
  // A backdrop, so the form READS as a screen over the list rather than as
  // controls floating among it.
  place('actors/panel', 'Sheet', WIDTH / 2, 88, {
    anchor: 'top',
    own: {hasABox: {width: WIDTH, height: 176}},
  }),
  place('actors/label', 'Prompt', WIDTH / 2, 36, {
    anchor: 'top',
    own: {Label: {text: 'NEW NOTE'}},
  }),
  place('actors/textInput', 'Entry', WIDTH / 2, 88, {
    anchor: 'top',
    own: {hasABox: {width: 280}},
  }),
  place('actors/button', 'Save', 96, 144, {
    anchor: 'top',
    emits: emitWorldEvent('save', undefined, MAIN_SCREEN_PATH),
    own: {Label: {text: 'SAVE'}, hasABox: {width: 120}},
  }),
  place('actors/button', 'Cancel', 224, 144, {
    anchor: 'top',
    emits: emitWorldEvent('cancel', undefined, MAIN_SCREEN_PATH),
    own: {Label: {text: 'CANCEL'}, hasABox: {width: 120}},
  }),
]);

// ── The world ───────────────────────────────────────────────────────────────

/** `⟨text⟩ of ⟨any ⟨Text Input⟩⟩` — what has been typed into the form. */
const typed = () => ({
  block: {
    type: 'world_get_ActorsLabel_TextProperty',
    inputs: {ACTOR: kind('actors/textInput')},
  },
});

/** `⟨a⟩ + ⟨b⟩ + ⟨c⟩`, as the chain of `as text` blocks that says it. */
const joined = (parts: object[]): object => {
  let chained: object | undefined;
  for (let at = parts.length - 1; at >= 0; at -= 1) {
    chained = {
      block: {
        type: 'world_as_text',
        inputs: {VALUE: parts[at], ...(chained ? {ADD: chained} : {})},
      },
    };
  }
  return chained as object;
};

/** The loop's name for one record; each loop has its own (`rebuildRows`). */
interface Row {
  id: string;
  name: string;
}
const row = (loop: Row) => ({
  block: {
    type: 'variables_get_Actor',
    fields: {VAR: {id: loop.id, name: loop.name}},
  },
});

/**
 * A Note: a RECORD, which in this lab is an actor with no place.
 *
 * `is data` is what makes it that — not drawn, in no search over places, hit
 * tested by nothing, and still findable with `any ⟨Note⟩`, which is how the
 * rebuild below walks them (specs/RECORDS_PLAN.md).
 *
 * TWO FIELDS RATHER THAN ONE STRING. This used to be a list of words, and a
 * note that wanted a date had the date glued to the front of it —
 * `2000-01-01  milk`, one string doing two jobs, because a string was all
 * there was. The date is a number on the record now, and the row on screen is
 * built from the two at the moment it is shown.
 */
const NOTE_ACTOR = actorFile('Note', [
  isData(),
  defineProperty('string', 'text', ''),
  defineProperty('number', 'at', '0'),
]);

/** `⟨text⟩ of ⟨the note⟩`, and `⟨at⟩ of ⟨the note⟩`. */
const fieldOf = (loop: Row, exportName: string) => ({
  block: {
    type: `world_get_ActorsNote_${exportName}`,
    inputs: {ACTOR: row(loop)},
  },
});

/** The game's own list of notes — `notes` on the Main Screen. */
const notes = () => ({block: {type: 'world_get_ScreensMain_NotesProperty'}});

/** `set ⟨items⟩ of ⟨any ⟨List⟩⟩ to ⟨notes⟩` — the list shows what is kept. */
const showNotes = () => ({
  type: 'world_set_ActorsList_ItemsProperty',
  inputs: {ACTOR: kind('actors/list'), VALUE: notes()},
});

/**
 * Build the words the List shows, out of the records.
 *
 * THE RECORDS ARE WHAT IS TRUE and this list is a VIEW of them, rebuilt
 * whenever they change. That is the difference records made: what is kept has
 * fields, and what is shown is made from them — so a row can be dated without
 * the date living inside the words.
 */
const rebuildRows = (key: string) => {
  const loop = {id: `appNoteRow_${key}`, name: 'note'};
  return [
    {
      type: 'world_set_ScreensMain_NotesProperty',
      inputs: {VALUE: {block: {type: 'lists_create_empty'}}},
    },
    {
      type: 'world_for_each',
      fields: {VAR: loop},
      inputs: {
        SOURCE: kind('actors/note'),
        DO: {
          block: {
            type: 'world_push_ScreensMain_NotesProperty',
            inputs: {
              ITEM: joined([
                {
                  block: {
                    type: 'world_time_text',
                    fields: {STYLE: 'date'},
                    inputs: {TIME: fieldOf(loop, 'AtProperty')},
                  },
                },
                words('  '),
                fieldOf(loop, 'TextProperty'),
              ]),
            },
          },
        },
      },
    },
    showNotes(),
  ];
};

const MEMORY = 'notes';

/**
 * The Main Screen: home, with no Viewport, since an app has no level to look
 * into (specs/SCREEN_MAP_PLAN.md). The write screen is shown over it, and
 * `go back` never takes home off (specs/SCREEN_STACK_PLAN.md).
 */
const MAIN_SCREEN = JSON.stringify(
  {
    ...HOME_MAP,
    name: 'Main',
    properties: [
      // WHAT THIS APP KEEPS. A game-wide value, which is exactly what `save`
      // writes and `load` puts back — so saving is one block rather than a
      // format (specs/WORLD_STATE.md).
      {name: 'notes', type: 'words', value: ''},
      // …and whether the last write got through. `save` REPORTS rather than
      // acts, because a browser with its site data blocked is a real thing
      // and not a crash — so the answer is kept rather than dropped, and an
      // app that wanted to say "could not save" has it to say
      // (specs/SAVING_PLAN.md).
      {name: 'saved', type: 'boolean', value: 'true'},
      // …and whether there was anything to come back to. False on a first
      // run, which is what a start screen would say something about
      // (specs/SAVING_PLAN.md).
      {name: 'remembered', type: 'boolean', value: 'false'},
    ],
    // …AND WHAT THE WRITE SCREEN SAYS BACK. Both events are the game's,
    // declared here and raised by the write screen's two buttons, by name
    // (specs/MAP_EVENTS_PLAN.md).
    events: [{name: 'save'}, {name: 'cancel'}],
    blocks: {
      blocks: {
        languageVersion: 0,
        blocks: [
          // RESTORING IS A HANDLER. The storage is lent once the world exists,
          // and setup runs while it is still being described — so a `load`
          // there would answer false every time (specs/SAVING_PLAN.md). `is
          // created` runs before the list is first drawn, which is after.
          //
          // Hung on the LIST because the list is the thing that has to show the
          // answer: recall, then fill, in one handler, in that order.
          {
            type: 'world_on_Space_CreatedEvent',
            x: 20,
            y: 260,
            fields: {SUBJECT: 'actors/list'},
            next: {
              block: chain([
                // The answer is KEPT rather than branched on, and the list is
                // filled either way. A list that is only filled when something
                // was remembered is a list still showing the stock rows it was
                // born with on a first run — which is what this did first.
                {
                  type: 'world_set_ScreensMain_RememberedProperty',
                  inputs: {
                    VALUE: {
                      block: {
                        // `any actors in ⟨…⟩` rather than a count the block
                        // answers itself: bringing them back hands over the
                        // ACTORS, and asking whether there were any is a block
                        // the lab already has (specs/RECORDS_PLAN.md).
                        type: 'world_any_actors',
                        inputs: {
                          LIST: {
                            block: {
                              type: 'world_recall_actors',
                              inputs: {NAME: words(MEMORY)},
                            },
                          },
                        },
                      },
                    },
                  },
                },
                ...rebuildRows('created'),
              ]),
            },
          },
          // SAVE: keep it, show it, write it down, and come back.
          //
          // The order is the whole of what an app has to get right here. The
          // note goes on the list before the screen goes away, because the
          // field it came from is on the screen that is about to be unloaded.
          {
            type: hearWorldEvent('save', MAIN_SCREEN_PATH),
            x: 20,
            y: 600,
            next: {
              block: chain([
                // A RECORD, not a line of words: the note and when it was
                // written, each in a field of its own.
                {
                  type: 'world_add_actor',
                  fields: {ACTOR: 'actors/note'},
                  inputs: {
                    DO: {
                      block: chain([
                        {
                          type: 'world_set_ActorsNote_TextProperty',
                          inputs: {ACTOR: me(), VALUE: typed()},
                        },
                        {
                          type: 'world_set_ActorsNote_AtProperty',
                          inputs: {
                            ACTOR: me(),
                            VALUE: {block: {type: 'world_now'}},
                          },
                        },
                      ]),
                    },
                  },
                },
                ...rebuildRows('saved'),
                {
                  type: 'world_set_ScreensMain_SavedProperty',
                  inputs: {
                    VALUE: {
                      block: {
                        type: 'world_remember_actors',
                        inputs: {
                          ACTORS: kind('actors/note'),
                          NAME: words(MEMORY),
                        },
                      },
                    },
                  },
                },
                {type: 'world_go_back'},
              ]),
            },
          },
          // CANCEL: the same way back, and nothing kept.
          {
            type: hearWorldEvent('cancel', MAIN_SCREEN_PATH),
            x: 20,
            y: 820,
            next: {
              block: {type: 'world_go_back'},
            },
          },
        ],
      },
    },
  },
  null,
  2,
);

// ── Assembly ────────────────────────────────────────────────────────────────

/**
 * The actors the two screens place, each walking its own rules — and then
 * every other control an app is offered, so a learner finds the whole kit
 * already in the project rather than in a library (`appBuilder.APP_ACTORS`).
 */
const PLACED = ['label', 'button', 'panel', 'textInput', 'list'];
const ACTORS = [
  ...PLACED,
  ...[...APP_ACTORS].filter(actor => !PLACED.includes(actor)),
];

/** Notes, built by importing into an empty project. */
export const notesApp = (empty: MultiFileSource): MultiFileSource => {
  let source = empty;
  for (const actor of ACTORS) {
    source = importStockActor(source, stockActorById(actor)!).source;
  }
  const main = Object.values(source.files).find(
    file => file.name === 'main.screen',
  );
  const actorsFolder = Object.values(source.folders).find(
    folder => folder.name === 'actors' && folder.parentId === '0',
  );
  if (!main) {
    return source;
  }
  return {
    ...source,
    files: {
      ...source.files,
      [main.id]: {...main, contents: MAIN_SCREEN},
      // The record kind. Written here rather than imported, because a Note is
      // this app's own idea — a stock actor is something several projects
      // share, and nobody else's notes have these two fields.
      appNoteActor: {
        id: 'appNoteActor',
        name: 'note.actor',
        language: 'actor',
        contents: NOTE_ACTOR,
        folderId: actorsFolder?.id ?? '0',
      },
      appWriteScreen: {
        id: 'appWriteScreen',
        name: 'write.screen',
        language: 'screen',
        contents: WRITE_SCREEN,
        folderId: main.folderId,
      },
    },
  };
};
