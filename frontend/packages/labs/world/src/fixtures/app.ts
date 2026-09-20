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
import {chain, defineEvent, me} from '../actors/stock/workspace';
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

const mapFile = (actors: object[], events: readonly string[]) =>
  JSON.stringify(
    {
      type: 'map',
      size: {width: PORTRAIT.columns, height: PORTRAIT.rows},
      tile: {width: TILE_SIZE, height: TILE_SIZE},
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
 */
const HOME_MAP = mapFile(
  [
    place('actors/label', 'Header', WIDTH / 2, 48, {
      anchor: 'top',
      own: {Label: {text: 'NOTES'}},
    }),
    place('actors/list', 'Notes', WIDTH / 2, 270, {
      own: {Label: {width: 280, height: 180}},
    }),
    place('actors/button', 'New', WIDTH / 2, 380, {
      anchor: 'bottom',
      emits: 'world_emit_MapsHome_NewNoteEvent',
      own: {Label: {text: 'NEW NOTE', width: 200}},
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
      own: {Label: {width: WIDTH, height: 176}},
    }),
    place('actors/label', 'Prompt', WIDTH / 2, 36, {
      anchor: 'top',
      own: {Label: {text: 'NEW NOTE'}},
    }),
    place('actors/textInput', 'Entry', WIDTH / 2, 88, {
      anchor: 'top',
      own: {Label: {width: 280}},
    }),
    place('actors/button', 'Save', 96, 144, {
      anchor: 'top',
      emits: 'world_emit_MapsWrite_SaveEvent',
      own: {Label: {text: 'SAVE', width: 120}},
    }),
    place('actors/button', 'Cancel', 224, 144, {
      anchor: 'top',
      emits: 'world_emit_MapsWrite_CancelEvent',
      own: {Label: {text: 'CANCEL', width: 120}},
    }),
  ],
  ['save', 'cancel'],
);

// ── The world ───────────────────────────────────────────────────────────────

/** `⟨text⟩ of ⟨any ⟨Text Input⟩⟩` — what has been typed into the form. */
const typed = () => ({
  block: {
    type: 'world_get_ActorsLabel_TextProperty',
    inputs: {ACTOR: kind('actors/textInput')},
  },
});

/** The world's own list of notes — `notes` in `main.world`. */
const notes = () => ({block: {type: 'world_get_WorldsMain_NotesProperty'}});

/** `set ⟨items⟩ of ⟨any ⟨List⟩⟩ to ⟨notes⟩` — the list shows what is kept. */
const showNotes = () => ({
  type: 'world_set_ActorsList_ItemsProperty',
  inputs: {ACTOR: kind('actors/list'), VALUE: notes()},
});

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
                      type: 'world_recall_memory',
                      inputs: {NAME: words(MEMORY)},
                    },
                  },
                },
              },
              showNotes(),
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
              {
                type: 'world_push_WorldsMain_NotesProperty',
                inputs: {ITEM: typed()},
              },
              showNotes(),
              {
                type: 'world_set_WorldsMain_SavedProperty',
                inputs: {
                  VALUE: {
                    block: {
                      type: 'world_save_memory',
                      inputs: {NAME: words(MEMORY)},
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
  if (!main) {
    return source;
  }
  const folderId = maps?.id ?? '0';
  return {
    ...source,
    files: {
      ...source.files,
      [main.id]: {...main, contents: MAIN_WORLD},
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
