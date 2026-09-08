// "Text Input" — a Label you can type into.
//
// The first actor in the library that takes something from the player other
// than a press: what it holds is what was TYPED at it, which is not a list of
// keys. Shift, a dead key, an IME and a paste all make a character and no key
// edge anybody could name, so this listens to `types ⟨a⟩` and leaves backspace
// to the key events, which is the division `rules/input` draws
// (specs/UI_ACTORS.md).
//
// IT IS A LABEL, said in a row: the words it shows, their size and color, and
// the box they are laid into all come across, and what it adds is a focus, a
// panel and two handlers (`ActorBuilder.actsLike`).
//
// FOCUS IS A CLEAR AND THEN A SET, and it works because the Mouse rule emits
// in that order within one step: `presses mouse button` reaches every actor
// that takes mouse input, wherever the pointer is, and `is clicked with`
// reaches only the ones under it — announced afterwards (`rules/mouse`,
// `buttonEvents`). So every field unfocuses on any click and the one clicked
// on focuses again, in that order, and two fields on a screen cannot both be
// taking the typing.
//
// THERE IS NO CARET, and the reason is worth writing down rather than
// discovering twice. A caret belongs after the last letter, and where that is
// depends on how wide the letters are — which only the painter knows: the
// engine has no canvas and deliberately never measures text (specs/DRAWING.md,
// and `draw paragraph` hands its column DOWN for the same reason). A bar at a
// guessed offset would sit in the middle of the word at one text size and off
// the end at another. So focus is shown by the edge instead, which is a thing
// the drawing can say exactly.

import {labelHalf, labelSizeOf} from './label';
import {
  actorFile,
  actsLike,
  chain,
  defineEvent,
  defineProperty,
  drawParagraph,
  fill,
  me,
  noOutline,
  num,
  outline,
  rectangle,
  setText,
  showAs,
  swatch,
  textOf,
  useTrait,
  words,
} from './workspace';

/** Wider and shallower than a Label: a field is a line, not a paragraph. */
const HEIGHT = 28;

const width = () => labelSizeOf('Width');
const height = () => labelSizeOf('Height');

/** `⟨focused⟩ of this actor` — whether the typing is coming here. */
const focused = () => ({
  block: {
    type: 'world_get_ActorsTextInput_FocusedProperty',
    inputs: {ACTOR: me()},
  },
});

/** `set ⟨focused⟩ of this actor to ⟨yes/no⟩`. */
const setFocused = (on: boolean) => ({
  type: 'world_set_ActorsTextInput_FocusedProperty',
  inputs: {
    ACTOR: me(),
    VALUE: {
      block: {type: 'logic_boolean', fields: {BOOL: on ? 'TRUE' : 'FALSE'}},
    },
  },
});

/** `emit changed for this actor` — the cue a project waits on. */
const emitChanged = () => ({
  type: 'world_emit_ActorsTextInput_ChangedEvent',
  inputs: {ACTOR: me()},
});

/** `if ⟨test⟩ do ⟨body⟩`. */
const onlyIf = (test: object, body: object[]) => ({
  type: 'controls_if',
  inputs: {IF0: test, DO0: {block: chain(body)}},
});

/** `⟨text⟩ of this actor`, which is what a field holds. */
const held = () => textOf('TextProperty');

export const textInputActor = actorFile(
  'Text Input',
  [
    actsLike('actors/label'),
    // What was typed, rather than which keys are down.
    useTrait('Input#TakesKeyboardInputTrait'),
    // Any click, so a field knows to let go…
    useTrait('Mouse#TakesMouseInputTrait'),
    // …and a click on THIS one, so it knows to take over.
    useTrait('Mouse#CanBeClickedTrait'),
    showAs('input'),
    defineProperty('boolean', 'focused', 'false'),
    defineEvent('changed'),
    {
      type: 'world_set_ActorsLabel_HeightProperty',
      inputs: {
        ACTOR: me(),
        VALUE: {shadow: {type: 'math_number', fields: {NUM: HEIGHT}}},
      },
    },
    // A field's words start at its left edge and grow rightwards, where a
    // Label's are centered: what has been typed should not shuffle sideways as
    // it is typed.
    setText('TextAnchorProperty', words('left')),
    // EMPTY, where a Label ships saying "Label": a field with words in it that
    // nobody typed is a field whose first keystroke has to delete them.
    setText('TextProperty', words('')),
  ],
  {
    handlers: [
      // Any click anywhere: let go. Announced BEFORE the click on a particular
      // actor, which is what makes this and the next one a clear and a set
      // rather than a race (`rules/mouse`).
      {
        type: 'world_on_Mouse_PressesMouseButtonEvent',
        fields: {FILTER0: ''},
        inputs: {ACTOR: me()},
        next: {block: setFocused(false)},
      },
      // …and a click on this one: take the typing.
      {
        type: 'world_on_Mouse_IsClickedWithEvent',
        fields: {FILTER0: ''},
        inputs: {ACTOR: me()},
        next: {block: setFocused(true)},
      },
      // A character, appended — but only if this is the field being typed at.
      {
        type: 'world_on_Input_TypesEvent',
        inputs: {ACTOR: me()},
        next: {
          block: onlyIf(focused(), [
            setText('TextProperty', {
              block: {
                type: 'world_as_text',
                inputs: {
                  VALUE: held(),
                  ADD: {
                    block: {
                      type: 'world_as_text',
                      inputs: {VALUE: {block: {type: 'world_event_value'}}},
                    },
                  },
                },
              },
            }),
            emitChanged(),
          ]),
        },
      },
      // …and backspace, which makes no character and so is a KEY.
      {
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: 'backspace'},
        inputs: {ACTOR: me()},
        next: {
          block: onlyIf(focused(), [
            setText('TextProperty', {
              block: {
                type: 'text_getSubstring',
                fields: {WHERE1: 'FROM_START', WHERE2: 'FROM_START'},
                inputs: {
                  STRING: held(),
                  AT1: {block: {type: 'math_number', fields: {NUM: 1}}},
                  // One shorter. At zero this is the empty string, so an empty
                  // field backspaced is still an empty field rather than an
                  // error — which is what a reader expects and what
                  // `firstCharacters` already does at the other end.
                  AT2: {
                    block: {
                      type: 'math_arithmetic',
                      fields: {OP: 'MINUS'},
                      inputs: {
                        A: {
                          block: {type: 'text_length', inputs: {VALUE: held()}},
                        },
                        B: {shadow: {type: 'math_number', fields: {NUM: 1}}},
                      },
                    },
                  },
                },
              },
            }),
            emitChanged(),
          ]),
        },
      },
    ],
    drawing: {
      width: width(),
      height: height(),
      commands: [
        // The field: dark, with an edge that says whether it is listening.
        fill(swatch('#1a1a22')),
        outline(swatch('#8890b0'), 2),
        rectangle(0, 0, width(), height()),
        noOutline(),
        fill(textOf('TextColorProperty')),
        // Inset from the left edge, since the words are anchored there.
        drawParagraph(num(8), labelHalf(height()), width()),
      ],
    },
  },
);
