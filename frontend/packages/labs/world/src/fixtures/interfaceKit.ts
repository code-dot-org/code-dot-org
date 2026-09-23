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
import {importStockStyle, stockStyleById} from '../styles/importStockStyle';

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
  properties: {
    ...overrides,
    positional: {position: {x, y}, ...overrides.positional},
  },
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

/**
 * What the Scroll View shows: a settings page taller than the window onto it.
 *
 * A MAP, because that is what a Scroll View holds — it is a Viewport with a
 * finger, and a Viewport shows a map (`actors/scrollView`). So the content is
 * a file of its own, and the thing being demonstrated is that the rows in it
 * are REAL ACTORS: each one is a Label and a Toggle that can be clicked
 * through the window, which is the case a List cannot answer.
 *
 * SIX TILES TALL against the four the window is, so there is something below
 * the fold to drag up to. A map the same size as its window would scroll
 * nowhere and demonstrate nothing.
 */
const SETTINGS_MAP = JSON.stringify(
  {
    type: 'map',
    size: {width: 9, height: 6},
    tile: {width: TILE_SIZE, height: TILE_SIZE},
    actors: [
      ...['SOUND', 'MUSIC', 'HINTS', 'SHAKE', 'INVERT'].flatMap(
        (what, at) => [
          place('actors/label', `${what} label`, 76, 26 + at * 36, {
            Label: {text: what},
          }),
          place('actors/toggle', what, 214, 26 + at * 36, {
            Label: {text: ''},
            hasABox: {width: 64},
          }),
        ],
      ),
    ],
  },
  null,
  2,
);

/** The screen, as the map editor sees it: five placements, top to bottom. */
const INTERFACE_MAP = {
  type: 'map' as const,
  size: {width: PORTRAIT.columns, height: PORTRAIT.rows},
  tile: {width: TILE_SIZE, height: TILE_SIZE},
  actors: [
    // THE FORM IS A DIALOG: a Panel, and the title, the field, the button
    // and the bar as its children (specs/PARENTING.md). Each child's
    // stored position is measured from the panel — the same slot the
    // engine keeps a child's local position in — so moving the panel in
    // the editor moves the form, and the play test's clicks land where
    // they always did: the panel is at (160, 100) and the field 20 above
    // its middle is at (160, 80).
    place('actors/panel', 'Dialog', 160, 100, {
      hasABox: {width: 300, height: 296},
    }),
    // A title, which is a Label doing the one thing a Label does.
    place('actors/label', 'Title', 0, -70, {
      positional: {parent: 'Dialog'},
      Label: {text: 'WHAT IS YOUR NAME?'},
    }),
    // The field. Click it and type.
    place('actors/textInput', 'Name', 0, -20, {
      positional: {parent: 'Dialog'},
    }),
    // A button that answers the field.
    place('actors/button', 'Hello', 0, 30, {
      positional: {parent: 'Dialog'},
      Label: {text: 'SAY HELLO'},
    }),
    // How full the field is, as a bar — empty until something is typed.
    place('actors/progressBar', 'Bar', 0, 68, {
      positional: {parent: 'Dialog'},
      Progress_Bar: {fraction: 0},
    }),
    // A switch, which is a Button that stays answered. Nothing listens to
    // it here; what it demonstrates is a control on a panel that keeps a
    // state and says when it changes.
    place('actors/toggle', 'Sound', 0, 96, {
      positional: {parent: 'Dialog'},
      Label: {text: 'SOUND'},
      hasABox: {width: 120},
    }),
    // A bar the pointer drags, whose fraction a game reads as a volume.
    place('actors/slider', 'Volume', 0, 124, {
      positional: {parent: 'Dialog'},
    }),
    // One answer out of several, with the choices on the placement: a
    // list of words the inspector edits a row at a time.
    place('actors/dropdown', 'Size', 0, 152, {
      positional: {parent: 'Dialog'},
      Dropdown: {choices: ['SMALL', 'MEDIUM', 'LARGE']},
      Label: {text: 'SMALL'},
    }),
    // MORE THAN ONE LINE, which is the one thing a Text Input cannot do. It
    // is the kit's only control that grows downward as it is typed into, and
    // it is here because it had been shipped and placed nowhere — three
    // headless tests and never once seen running.
    place('actors/textArea', 'Notes', 160, 320, {
      hasABox: {width: 300, height: 88},
    }),
    // …and a window onto something taller than itself, which is the other
    // thing nothing had ever put on a screen. What is IN it is a map
    // (`SETTINGS_MAP`) rather than rows of words: its toggles are actors, and
    // clicking one through the window is the case a List cannot answer
    // (specs/SCROLLING_PLAN.md).
    place('actors/scrollView', 'Settings', 160, 428, {
      hasABox: {width: 300, height: 128},
      showsMap: {map: 'maps/settings'},
    }),
    // …and the box that says the answer, a letter at a time. At the foot
    // of the screen, where a phone keeps its replies, and nobody's child.
    place('actors/speechBox', 'Reply', 160, 530),
  ],
};

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
    // THE ARRANGEMENT IS THE WORLD'S OWN, under `map` beside `blocks`
    // (specs/MAIN_MAP_PLAN.md). It was a `maps/interface.map` with a `load
    // map` row naming it, which is one file and one row more than the idea
    // needs: this world IS the interface, and opening it should show it.
    //
    // Nothing downstream changes. A world's main map compiles to the same
    // `world.loadMap` a named one does (`blockly/assembleActorModule`), so
    // its placements get a load, modality still asks of that load, and a
    // screen put up over this one still covers it.
    map: INTERFACE_MAP,
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
              // …AND WHAT IT IS ALL PAINTED OUT OF, which is the row this
              // fixture exists to show off. Every control below names a
              // CLASS — `button`, `caption`, `ring` — and this says which
              // file those classes are looked up in. Point it at
              // `styles/classic` and the whole kit changes without a drawing
              // being edited (specs/STYLES_PLAN.md).
              {type: 'world_use_theme', fields: {THEME: 'styles/modern'}},
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
  for (const actor of [
    'label',
    'button',
    'progressBar',
    'speechBox',
    'panel',
    'toggle',
    'slider',
    'dropdown',
    'textArea',
    'scrollView',
  ]) {
    source = importStockActor(source, stockActorById(actor)!).source;
  }
  source = importStockActor(source, stockActorById('textInput')!).source;
  // BOTH THEMES, because the point of the kit is that you can swap one for
  // the other and watch every control follow. The world names Modern; opening
  // the world and picking Classic is the whole demonstration.
  // …and DANGER, which is neither: four lines that extend Modern and make a
  // button red. It is in the kit so that `extends` and a per-placement
  // override are things a learner can try, not things a spec describes.
  for (const style of ['modern', 'classic', 'danger']) {
    source = importStockStyle(source, stockStyleById(style)!).source;
  }

  const main = Object.values(source.files).find(
    file => file.name === 'main.world',
  );
  if (!main) {
    return source;
  }
  const maps = Object.values(source.folders).find(
    folder => folder.name === 'maps' && folder.parentId === '0',
  );
  return {
    ...source,
    files: {
      ...source.files,
      [main.id]: {...main, contents: MAIN_WORLD},
      // The Scroll View's contents. Written here rather than imported: a
      // stock map is something several projects share, and a settings page
      // is this kit's own idea of something to scroll.
      kitSettingsMap: {
        id: 'kitSettingsMap',
        name: 'settings.map',
        language: 'map',
        contents: SETTINGS_MAP,
        folderId: maps?.id ?? '0',
      },
    },
  };
};
