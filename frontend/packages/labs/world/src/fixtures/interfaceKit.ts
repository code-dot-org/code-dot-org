// Every interface actor, on one screen, wired to each other.
//
// The interface set is the one part of the library with no scenario: a Label
// sits in the starter and a Speech Box in the novel, but nothing places a
// Button beside a Text Input beside a bar and makes them answer one another —
// which is the only way to find out whether they compose (specs/UI_ACTORS.md).
//
// IT ALSO CARRIES THE TEXT INPUT AND THE TAB NAVIGATION RULE, both of which
// are finished and neither of which is on the shelf: a stock actor or rule has
// to be granted by a progression tile, a tile needs a lesson, and the lessons
// that would teach typing and tabbing are curriculum nobody has written. A
// fixture holds FILES rather than shelf entries, so it can place them anyway —
// which is what makes this the honest home for work waiting on curriculum.
//
// The rule is imported by hand below rather than named in the Text Input's
// `requires`, because `actorRequirements` resolves a name against the shelf
// and silently drops what it cannot find (`actors/importStockActor`) — so a
// `requires` naming it would read as a dependency and be nothing at all.
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

import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockActor} from '../actors/importStockActor';
import type {StockActor} from '../actors/stock';
import {stockActorById} from '../actors/stock';
import {textInputActor} from '../actors/stock/textInput';
import {importStockRule} from '../rules/importStockRule';
import {TAB_NAVIGATION} from '../rules/stock';

/** `any ⟨kind⟩` — how a world names the actor a handler is about. */
const kind = (path: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: path}},
});
const me = () => ({block: {type: 'world_this_actor'}});
const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});
const words = (text: string) => ({
  block: {type: 'text', fields: {TEXT: text}},
});

/** `set position of ⟨this actor⟩ to ⟨x, y⟩`. */
const placeAt = (x: number, y: number) => ({
  type: 'world_set_position',
  inputs: {ACTOR: me(), X: number(x), Y: number(y)},
});

/** `set ⟨what⟩ of ⟨this actor⟩ to ⟨value⟩`, for one of the Label's four. */
const setText = (exportName: string, value: object) => ({
  type: `world_set_ActorsLabel_${exportName}`,
  inputs: {ACTOR: me(), VALUE: value},
});

/** `⟨text⟩ of ⟨any ⟨Text Input⟩⟩` — what has been typed into the field. */
const typedIn = () => ({
  block: {
    type: 'world_get_ActorsLabel_TextProperty',
    inputs: {ACTOR: kind('actors/textInput')},
  },
});

/** `add actor ⟨path⟩ do ⟨rows⟩`. */
const add = (path: string, rows: object[]) => ({
  type: 'world_add_actor',
  fields: {ACTOR: path},
  inputs: {
    DO: {
      block: rows.reduceRight((next, row) => ({...row, next: {block: next}})),
    },
  },
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
              // A title, which is a Label doing the one thing a Label does.
              add('actors/label', [
                placeAt(160, 30),
                setText('TextProperty', words('WHAT IS YOUR NAME?')),
              ]),
              // The field. Click it and type.
              add('actors/textInput', [placeAt(160, 80)]),
              // A button that answers the field.
              add('actors/button', [
                placeAt(160, 130),
                setText('TextProperty', words('SAY HELLO')),
              ]),
              // How full the field is, as a bar.
              add('actors/progressBar', [
                placeAt(160, 168),
                {
                  type: 'world_set_ActorsProgressBar_FractionProperty',
                  inputs: {ACTOR: me(), VALUE: number(0)},
                },
              ]),
              // …and the box that says the answer, a letter at a time.
              add('actors/speechBox', [placeAt(160, 250)]),
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
                // `⟨HELLO ⟩ + ⟨“ what was typed ”⟩` — a chain, read left to
                // right, with the field's words joined as words.
                VALUE: {
                  block: {
                    type: 'text',
                    fields: {TEXT: 'HELLO '},
                    inputs: {
                      ADD: {
                        block: {
                          type: 'world_as_text',
                          inputs: {VALUE: typedIn()},
                        },
                      },
                    },
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

/**
 * The shelf entry the Text Input WOULD have.
 *
 * Written here because it has none: see the header. Everything else in the kit
 * is on the shelf and is fetched from it.
 */
const TEXT_INPUT: StockActor = {
  id: 'textInput',
  name: 'Text Input',
  description: 'A line you can type into.',
  requires: ['Input', 'Mouse'],
  actors: ['label'],
  contents: textInputActor,
};

/** The kit, built by importing each actor into an empty project. */
export const interfaceKit = (empty: MultiFileSource): MultiFileSource => {
  // FIRST, because the Text Input elects one of its traits: an actor naming a
  // trait the project does not hold elects nothing, compiles perfectly, and
  // does nothing — which is the failure this fixture exists to catch.
  let source = importStockRule(empty, TAB_NAVIGATION).source;
  for (const actor of ['label', 'button', 'progressBar', 'speechBox']) {
    source = importStockActor(source, stockActorById(actor)!).source;
  }
  source = importStockActor(source, TEXT_INPUT).source;

  const main = Object.values(source.files).find(
    file => file.name === 'main.world',
  );
  return main
    ? {
        ...source,
        files: {...source.files, [main.id]: {...main, contents: MAIN_WORLD}},
      }
    : source;
};
