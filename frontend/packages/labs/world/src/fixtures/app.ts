// Notes: the first thing in this lab that is an APP rather than a game.
//
// Every piece of specs/APPS.md's list was built and tested alone — screens
// have a demo, saving has a test, the keyboard has a play test that types into
// a field. Nothing had ever put them in one artifact, and a seam between two
// of them is invisible until something crosses it. That is what this is for.
//
// WHAT IT USES, which is the whole list:
//
//   • two SCREENS and a way back down (`rules/screens`);
//   • a FORM — a Text Input on the second screen (`actors/textInput`);
//   • the on-screen KEYBOARD, so it can be used with a finger alone
//     (`maps/keyboard`, specs/KEYBOARD_PLAN.md);
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
// THE BUTTONS SPEAK THROUGH THEIR MAP'S OWN EVENTS, which is the pattern the
// pause menu established (specs/UI_ACTORS.md) and the only one available here:
// `the ⟨Save⟩` names a placement and is a MAP SCRIPT's block — it generates
// `placed[…]`, so a world cannot use it — and `any ⟨Button⟩` cannot tell three
// buttons apart. So each map declares what happens on it, a placement script
// emits it, and the world answers. Moving a button on the map rewires nothing.
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
  defineEvent,
  defineProperty,
  isData,
  me,
} from '../actors/stock/workspace';
import {importStockMap} from '../maps/importStockMap';
import {stockMapById} from '../maps/stock';
import {importStockRule} from '../rules/importStockRule';
import {stockRule} from '../rules/stock';
import {TILE_SIZE} from '../runtime/viewport';

/** The screen, in tiles: the standard width, and a phone's height. */
export const PORTRAIT = {columns: 10, rows: 18};
const WIDTH = PORTRAIT.columns * TILE_SIZE;

const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});
const words = (text: string) => ({block: {type: 'text', fields: {TEXT: text}}});

/** `any ⟨kind⟩` — how a world names the actor a handler is about. */
const kind = (path: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: path}},
});

interface PlaceOpts {
  /** Which edge of the window this placement holds on to. */
  anchor?: string;
  /** The event this placement's own script emits when it is clicked. */
  emits?: string;
  /** Per-owner property overrides, keyed as the engine keys them. */
  own?: Record<string, Record<string, unknown>>;
}

/** `when this actor is clicked with ⟨any⟩: emit ⟨the map's event⟩`. */
const clickEmits = (blockType: string) => ({
  blocks: {
    blocks: {
      blocks: [
        {
          type: 'world_on_Mouse_IsClickedWithEvent',
          fields: {FILTER0: ''},
          inputs: {ACTOR: me()},
          x: 20,
          y: 20,
          next: {block: chain([{type: blockType}])},
        },
      ],
    },
  },
});

/** One placement: a kind, a name, its centre, and what it overrides. */
const place = (
  type: string,
  id: string,
  x: number,
  y: number,
  {anchor, emits, own = {}}: PlaceOpts = {},
) => ({
  type,
  id,
  ...(anchor ? {anchor} : {}),
  properties: {...own, positional: {position: {x, y}, ...own.positional}},
  ...(emits ? clickEmits(emits) : {}),
});

const mapFile = (actors: object[], events: readonly string[], modal = false) =>
  JSON.stringify(
    {
      type: 'map',
      size: {width: PORTRAIT.columns, height: PORTRAIT.rows},
      tile: {width: TILE_SIZE, height: TILE_SIZE},
      ...(modal ? {modal: true} : {}),
      actors,
      // The map's own workspace: the events its placements raise.
      blocks: {
        blocks: {
          blocks: events.map((name, index) => ({
            ...defineEvent(name),
            x: 20,
            y: 20 + index * 80,
          })),
        },
      },
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
 * Its controls do not dodge the screen that comes up over them, and for a
 * while they had to. NEW NOTE sits at the foot of the screen, which is where a
 * button like it belongs and is exactly where the on-screen keyboard's third
 * row lands: tapping `b` also pressed NEW NOTE and opened a second copy of the
 * form, mid-word. The layout was bent around that until the write map could
 * say it was a SCREEN. It says so now, so this says what it means
 * (specs/MODALITY_PLAN.md).
 */
const HOME_MAP = mapFile(
  [
    place('actors/label', 'Header', WIDTH / 2, 48, {
      anchor: 'top',
      own: {Label: {text: 'NOTES'}},
    }),
    place('actors/list', 'Notes', WIDTH / 2, 260, {
      own: {hasABox: {width: 280, height: 320}},
    }),
    place('actors/button', 'New', WIDTH / 2, 520, {
      anchor: 'bottom',
      emits: 'world_emit_MapsHome_NewNoteEvent',
      own: {Label: {text: 'NEW NOTE'}, hasABox: {width: 200}},
    }),
  ],
  ['new note'],
);

/**
 * Write: one field, two answers, and room under them for a keyboard.
 *
 * The keyboard is NOT placed here. It is its own map, loaded over this one, so
 * what a learner reads on this screen is a form — and so the keyboard stays
 * one import rather than forty placements copied into every screen that types.
 */
const WRITE_MAP = mapFile(
  [
    // A backdrop, so the form READS as a screen over the list rather than as
    // controls floating among it. It is only paint: a Panel is not something
    // that can be clicked, which matters — see the note above about a screen
    // not blocking what is under it.
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
      emits: 'world_emit_MapsWrite_SaveEvent',
      own: {Label: {text: 'SAVE'}, hasABox: {width: 120}},
    }),
    place('actors/button', 'Cancel', 224, 144, {
      anchor: 'top',
      emits: 'world_emit_MapsWrite_CancelEvent',
      own: {Label: {text: 'CANCEL'}, hasABox: {width: 120}},
    }),
  ],
  ['save', 'cancel'],
  // A SCREEN, not an overlay: while it is up, nothing on home can be clicked,
  // tabbed to or typed at (specs/MODALITY_PLAN.md). The keyboard loaded OVER
  // it is not modal, which is the whole reason the flag is on the map rather
  // than on whatever is topmost — a keyboard that locked out the form it fills
  // would be useless.
  true,
);

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

/** The loop's name for one record, as the rebuild below walks them. */
const ROW = {id: 'appNoteRow', name: 'note', type: 'Actor'};
const row = () => ({
  block: {
    type: 'variables_get_Actor',
    fields: {VAR: {id: ROW.id, name: ROW.name}},
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
const fieldOf = (exportName: string) => ({
  block: {
    type: `world_get_ActorsNote_${exportName}`,
    inputs: {ACTOR: row()},
  },
});

/** The world's own list of notes — `notes` in `main.world`. */
const notes = () => ({block: {type: 'world_get_WorldsMain_NotesProperty'}});

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
const rebuildRows = () => [
  {
    type: 'world_set_WorldsMain_NotesProperty',
    inputs: {VALUE: {block: {type: 'lists_create_empty'}}},
  },
  {
    type: 'world_for_each',
    fields: {VAR: {id: ROW.id, name: ROW.name}},
    inputs: {
      SOURCE: kind('actors/note'),
      DO: {
        block: {
          type: 'world_push_WorldsMain_NotesProperty',
          inputs: {
            ITEM: joined([
              {
                block: {
                  type: 'world_time_text',
                  fields: {STYLE: 'date'},
                  inputs: {TIME: fieldOf('AtProperty')},
                },
              },
              words('  '),
              fieldOf('TextProperty'),
            ]),
          },
        },
      },
    },
  },
  showNotes(),
];

/** `set size of ⟨map|view⟩ to x ⟨columns⟩ y ⟨rows⟩ tiles`. */
const sized = (what: 'map' | 'view') => ({
  type: `world_set_${what}_size`,
  inputs: {X: number(PORTRAIT.columns), Y: number(PORTRAIT.rows)},
});

const MEMORY = 'notes';

const MAIN_WORLD = JSON.stringify(
  {
    blocks: {
      blocks: [
        {
          type: 'world_world',
          x: 20,
          y: 20,
          fields: {NAME: 'Main'},
          next: {
            block: chain([
              // The screen's shape first, so the maps are placed on the window
              // they are seen through.
              sized('view'),
              sized('map'),
              // WHAT THIS APP KEEPS. A world's own property, which is exactly
              // what `save` writes and `load` puts back — so saving is one
              // block rather than a format (specs/WORLD_STATE.md).
              {
                type: 'world_rule_property',
                fields: {
                  TYPE: 'words',
                  ACCESS: 'writable',
                  NAME: 'notes',
                },
              },
              // …and whether the last write got through. `save` REPORTS
              // rather than acts, because a browser with its site data
              // blocked is a real thing and not a crash — so the answer is
              // kept rather than dropped, and an app that wanted to say
              // "could not save" has it to say (specs/SAVING_PLAN.md).
              {
                type: 'world_rule_property',
                fields: {
                  TYPE: 'boolean',
                  ACCESS: 'writable',
                  NAME: 'saved',
                  DEFAULT: 'TRUE',
                },
              },
              // …and whether there was anything to come back to. False on a
              // first run, which is what a start screen would say something
              // about (specs/SAVING_PLAN.md).
              {
                type: 'world_rule_property',
                fields: {
                  TYPE: 'boolean',
                  ACCESS: 'writable',
                  NAME: 'remembered',
                  DEFAULT: 'FALSE',
                },
              },
              // The first screen. `go to screen` rather than `load map`,
              // because the stack is what `go back` reads.
              {
                type: 'world_do_Screens_GoToScreenAction',
                fields: {VALUE: 'maps/home'},
              },
            ]),
          },
        },
        // RESTORING IS A HANDLER, not a row in the body above. The storage is
        // lent once the world exists, and a world's body runs while it is
        // still being described — so a `load` written up there answers false
        // every time (specs/SAVING_PLAN.md). `is created` runs on the first
        // tick, which is after.
        //
        // Hung on the LIST because the list is the thing that has to show the
        // answer: recall, then fill, in one handler, in that order.
        {
          type: 'world_on_Space_CreatedEvent',
          x: 20,
          y: 260,
          inputs: {ACTOR: kind('actors/list')},
          next: {
            block: chain([
              // The answer is KEPT rather than branched on, and the list is
              // filled either way. A list that is only filled when something
              // was remembered is a list still showing the stock rows it was
              // born with on a first run — which is what this did first.
              {
                type: 'world_set_WorldsMain_RememberedProperty',
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
              ...rebuildRows(),
            ]),
          },
        },
        // Home's one button: go and write.
        {
          type: 'world_on_MapsHome_NewNoteEvent',
          x: 20,
          y: 420,
          next: {
            block: chain([
              {
                type: 'world_do_Screens_GoToScreenAction',
                fields: {VALUE: 'maps/write'},
              },
              // …and the keyboard over it, so a finger has something to type
              // on. Loaded as a screen of its own so that `go back` from the
              // form takes both away in the order they went on.
              {
                type: 'world_do_Screens_GoToScreenAction',
                fields: {VALUE: 'maps/keyboard'},
              },
            ]),
          },
        },
        // SAVE: keep it, show it, write it down, and come back.
        //
        // The order is the whole of what an app has to get right here. The
        // note goes on the list before the screen goes away, because the
        // field it came from is on the screen that is about to be unloaded.
        {
          type: 'world_on_MapsWrite_SaveEvent',
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
              ...rebuildRows(),
              {
                type: 'world_set_WorldsMain_SavedProperty',
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
              // Twice, because the keyboard went on over the form.
              {type: 'world_do_Screens_GoBackAction'},
              {type: 'world_do_Screens_GoBackAction'},
            ]),
          },
        },
        // CANCEL: the same way back, and nothing kept.
        {
          type: 'world_on_MapsWrite_CancelEvent',
          x: 20,
          y: 820,
          next: {
            block: chain([
              {type: 'world_do_Screens_GoBackAction'},
              {type: 'world_do_Screens_GoBackAction'},
            ]),
          },
        },
      ],
    },
  },
  null,
  2,
);

// ── Assembly ────────────────────────────────────────────────────────────────

/** The actors the two screens place, each walking its own rules. */
const ACTORS = ['label', 'button', 'panel', 'textInput', 'list'] as const;

/** Notes, built by importing into an empty project. */
export const notesApp = (empty: MultiFileSource): MultiFileSource => {
  let source = empty;
  for (const actor of ACTORS) {
    source = importStockActor(source, stockActorById(actor)!).source;
  }
  // The stack. Nothing else brings it, because nothing else needs it: a
  // screen is a map, and every other actor here is happy with one.
  source = importStockRule(source, stockRule('screens')!).source;
  // …and the keyboard, which brings the Panel and the Button it places.
  source = importStockMap(source, stockMapById('keyboard')!).source;

  const main = Object.values(source.files).find(
    file => file.name === 'main.world',
  );
  const maps = Object.values(source.folders).find(
    folder => folder.name === 'maps' && folder.parentId === '0',
  );
  const actorsFolder = Object.values(source.folders).find(
    folder => folder.name === 'actors' && folder.parentId === '0',
  );
  if (!main) {
    return source;
  }
  const folderId = maps?.id ?? '0';
  return {
    ...source,
    files: {
      ...source.files,
      [main.id]: {...main, contents: MAIN_WORLD},
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
      appHomeMap: {
        id: 'appHomeMap',
        name: 'home.map',
        language: 'map',
        contents: HOME_MAP,
        folderId,
      },
      appWriteMap: {
        id: 'appWriteMap',
        name: 'write.map',
        language: 'map',
        contents: WRITE_MAP,
        folderId,
      },
    },
  };
};
