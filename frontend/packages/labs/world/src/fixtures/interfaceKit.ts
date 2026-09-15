// Every interface actor, on one screen, wired to each other.
//
// The interface set is the one part of the library with no scenario: a Label
// sits in the starter and a Speech Box in the novel, but nothing places a
// Button beside a Text Input beside a bar and makes them answer one another —
// which is the only way to find out whether they compose (specs/UI_ACTORS.md).
//
// EVERY ONE OF THEM IS ON THE SHELF NOW, including the Text Input, which
// waited here for a lesson that could TYPE at it. What this fixture is for is
// unchanged: it is the only place the set is assembled INTO something, and a
// kit that composes is the claim no single actor's test can make.
//
// WHAT IT DEMONSTRATES, and each is a seam that could have failed quietly:
//
//   • a Text Input keeps what was TYPED, and only the field that was clicked;
//   • a Button raises a click on itself, with no hit test written anywhere;
//   • a Speech Box lets its line out a letter at a time, on its own timer;
//   • a bar fills from a number a handler works out;
//   • an actor's OWN event — the field's `changed` — is heard by the world,
//     which is the whole of why an actor may declare one.
//
// BUILT BY IMPORTING rather than by listing files. Every one of these actors
// brings rules, and one brings another actor; hand-listing them is a list to
// forget, and `importStockActor` already walks both (`actors/importStockActor`).
//
// THE SCREEN IS A MAP. The five actors were `add actor` rows under the world,
// each placing itself with `set position`, and the world now says `load map`
// and `maps/interface.map` holds where each one is and what it says. That is
// the claim specs/UI_ACTORS.md makes about the map editor — that arranging a
// HUD is arranging actors, on the same canvas, with the same inspector — and
// this fixture is where the claim gets tried: open the map and the words on
// the title, the button's caption and the bar's empty start are each a
// property override on a placement, editable where the placement is.
//
// ON A PHONE-SHAPED SCREEN. An interface is the one kind of world whose
// shape is not a level's, and a form on a square window looks like a game
// with a form in it. The world says `set size of view` (specs/VIEWPORT.md)
// and the pane takes that shape — which is also the one place in the library
// a world declares a view that is not the default, so the map editor, the
// backdrop and the driver all get exercised on a window that is not square.
//
// The width is kept at the standard ten tiles and only the height grows,
// because that is what the actors were sized to: a Speech Box is 280 wide
// and everything is centred on 160. Eighteen tall is sixteen by nine within
// a tile (320 by 576, against 320 by 569), and the map is said to be the
// same, so the level is exactly one screen and nothing reads a map that is
// shorter than its window.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockActor} from '../actors/importStockActor';
import {stockActorById} from '../actors/stock';
import {TILE_SIZE} from '../runtime/viewport';

/** `any ⟨kind⟩` — how a world names the actor a handler is about. */
const kind = (path: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: path}},
});
const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

/**
 * One placement on the map: a kind, a name, its centre in pixels, and the
 * properties it overrides — keyed the way the engine keys them, by the
 * declaring kind's id and then the property's (`World.loadMap`). A Button's
 * `text` is the LABEL's, because that is where `acts like` found it.
 */
const place = (
  type: string,
  id: string,
  x: number,
  y: number,
  overrides: Record<string, Record<string, unknown>> = {},
) => ({
  type,
  id,
  properties: {positional: {position: {x, y}}, ...overrides},
});

/** `⟨text⟩ of ⟨any ⟨Text Input⟩⟩` — what has been typed into the field. */
const typedIn = () => ({
  block: {
    type: 'world_get_ActorsLabel_TextProperty',
    inputs: {ACTOR: kind('actors/textInput')},
  },
});

/** The screen, in tiles: the standard width, and a phone's height. */
export const PORTRAIT = {columns: 10, rows: 18};

/** The screen, as the map editor sees it: five placements, top to bottom. */
const INTERFACE_MAP = JSON.stringify(
  {
    type: 'map',
    size: {width: PORTRAIT.columns, height: PORTRAIT.rows},
    tile: {width: TILE_SIZE, height: TILE_SIZE},
    actors: [
      // A title, which is a Label doing the one thing a Label does.
      place('actors/label', 'Title', 160, 30, {
        Label: {text: 'WHAT IS YOUR NAME?'},
      }),
      // The field. Click it and type.
      place('actors/textInput', 'Name', 160, 80),
      // A button that answers the field.
      place('actors/button', 'Hello', 160, 130, {Label: {text: 'SAY HELLO'}}),
      // How full the field is, as a bar — empty until something is typed.
      place('actors/progressBar', 'Bar', 160, 168, {
        Progress_Bar: {fraction: 0},
      }),
      // …and the box that says the answer, a letter at a time. At the foot
      // of the screen, where a phone keeps its replies; the form stays at
      // the top, where the test's clicks land.
      place('actors/speechBox', 'Reply', 160, 500),
    ],
  },
  null,
  2,
);

/** `set size of ⟨map|view⟩ to x ⟨columns⟩ y ⟨rows⟩ tiles`. */
const sized = (what: 'map' | 'view') => ({
  type: `world_set_${what}_size`,
  inputs: {X: number(PORTRAIT.columns), Y: number(PORTRAIT.rows)},
});

/** Chain top-level rows under the world block. */
const chain = (rows: object[]) =>
  rows.reduceRight((next, row) => ({...row, next: {block: next}}));

const MAIN_WORLD = JSON.stringify(
  {
    blocks: {
      blocks: [
        {
          type: 'world_world',
          x: 20,
          y: 20,
          fields: {NAME: 'Interface'},
          next: {
            block: chain([
              // The screen's shape, first, so the map is placed on the
              // window it is seen through. The map file says the same size;
              // the world saying it too is what a world with no map would
              // say, and it costs one row.
              sized('view'),
              sized('map'),
              {type: 'world_load_map', fields: {MAP: 'maps/interface'}},
            ]),
          },
        },
        // THE FIELD'S OWN EVENT, heard by the world: a Text Input declares
        // `changed` for itself, and this is the whole reason an actor may
        // declare one (`ActorBuilder.defineEvent`).
        {
          type: 'world_on_ActorsTextInput_ChangedEvent',
          x: 20,
          y: 260,
          inputs: {ACTOR: kind('actors/textInput')},
          next: {
            block: {
              type: 'world_set_ActorsProgressBar_FractionProperty',
              inputs: {
                ACTOR: kind('actors/progressBar'),
                VALUE: {
                  block: {
                    type: 'math_arithmetic',
                    fields: {OP: 'DIVIDE'},
                    inputs: {
                      A: {
                        block: {
                          type: 'text_length',
                          inputs: {VALUE: typedIn()},
                        },
                      },
                      B: number(12),
                    },
                  },
                },
              },
            },
          },
        },
        // …and the button, which needs no hit test of its own.
        {
          type: 'world_on_Mouse_IsClickedWithEvent',
          x: 20,
          y: 400,
          fields: {FILTER0: ''},
          inputs: {ACTOR: kind('actors/button')},
          next: {
            block: {
              type: 'world_do_ActorsSpeechBox_SayAction',
              inputs: {
                ACTOR: kind('actors/speechBox'),
                // `⟨HELLO ⟩ + ⟨what was typed⟩` — a chain, read left to right.
                //
                // NO ADAPTER, because there is nothing to adapt. A chain's
                // socket takes `String` and `text of ⟨…⟩` reports one, so it
                // plugs straight in; `as text` is the door for everything that
                // is NOT already words — a score, a choice — and putting one
                // here would say the field's words needed turning into words
                // (`domainBlocks.worldAsText`).
                VALUE: {
                  block: {
                    type: 'text',
                    fields: {TEXT: 'HELLO '},
                    inputs: {ADD: typedIn()},
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
);

/** The kit, built by importing each actor into an empty project. */
export const interfaceKit = (empty: MultiFileSource): MultiFileSource => {
  let source = empty;
  for (const actor of ['label', 'button', 'progressBar', 'speechBox']) {
    source = importStockActor(source, stockActorById(actor)!).source;
  }
  source = importStockActor(source, stockActorById('textInput')!).source;

  const main = Object.values(source.files).find(
    file => file.name === 'main.world',
  );
  const maps = Object.values(source.folders).find(
    folder => folder.name === 'maps' && folder.parentId === '0',
  );
  return main
    ? {
        ...source,
        files: {
          ...source.files,
          [main.id]: {...main, contents: MAIN_WORLD},
          interfaceMap: {
            id: 'interfaceMap',
            name: 'interface.map',
            language: 'map',
            contents: INTERFACE_MAP,
            folderId: maps?.id ?? '0',
          },
        },
      }
    : source;
};
