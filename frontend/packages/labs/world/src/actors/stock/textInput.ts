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
// FOCUS IS NOT ITS OWN. It used to be: a `focused` property this file
// declared, cleared by `presses mouse button` and set by `is clicked with`,
// leaning on the Mouse rule announcing those in that order within one step. It
// worked, and it could only ever have worked for the mouse — tabbing between
// two fields is not a thing either field can work out, and neither is "which
// one has it". Those are facts about the SCREEN.
//
// So this elects `Tab Navigation#Can Be Focused` and reads the rule's
// `focused`, which is READ-ONLY. One block moves it — `take the focus` — and
// this calls it on a click; Tab and Escape call it from the rule. That is what
// makes the clear and the set unnecessary: `take the focus` releases whoever
// had it, so a click is one statement rather than a race between two
// (`rules/tabNavigation`, specs/UI_ACTORS.md).
//
// CLICKING THE BACKGROUND NO LONGER BLURS, and that is deliberate rather than
// lost. Escape is the release now, everywhere — it is what hands Tab back to
// the page as well. A field that also blurred on any press would raise a loss
// and a gain every time the FOCUSED field was clicked, which is exactly the
// churn the rule's idempotence guard exists to prevent.
//
// THERE IS A CARET, and what it cost is worth writing down. A caret belongs
// after the last letter, and where that is depends on how wide the letters are
// — which only the painter knew: the engine has no canvas and did not measure
// text at all (specs/DRAWING.md, and `draw paragraph` hands its column DOWN
// for the same reason). A bar at a guessed offset would have sat in the middle
// of the word at one text size and off the end at another, so for a while
// focus was shown by the edge alone.
//
// The tape is lent the other way now: a driver that has a canvas hands the
// World one, built from the same font string the painter sets, and `width of
// ⟨text⟩ at size ⟨n⟩` is what borrows it (`World.textWidth`,
// `runtime/driver/textMetrics`). A world with no canvas behind it measures
// zero, and a zero puts the caret at the left margin — visibly nothing rather
// than invisibly wrong.
//
// THE INSERTION POINT IS THE END, always: typing appends and backspace takes
// from the end, so there is one place the caret can be. Clicking INTO a word
// to put it somewhere else is the next thing this wants, and it is what the
// measuring seam was really built for — pixel-to-letter is a mouse handler's
// question, asked in the frame it is asked in, which no drawing could ever
// have answered.
//
// AND THE WORDS SLIDE so the caret stays in the box. `scroll` is how far left
// they are pushed, worked out once a frame from the same measurement: zero
// while what is typed fits, and exactly the overflow after that. Without it a
// field is a box that fills up and then types into thin air.

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

/**
 * `⟨focused⟩ of this actor` — whether the typing is coming here.
 *
 * THE RULE'S, and read-only. There is no setter to pair with this and that is
 * the point: an actor that could set it could set it while another actor also
 * had it, and then two fields would take the same keystroke.
 */
const focused = () => ({
  block: {
    type: 'world_get_TabNavigation_FocusedProperty',
    inputs: {ACTOR: me()},
  },
});

/** `⟨this actor⟩ take the focus` — the one way it comes to hold it. */
const takeFocus = () => ({
  type: 'world_do_TabNavigation_TakeTheFocusAction',
  inputs: {ACTOR: me()},
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

/** How far the words are inset from the left edge, and the caret's bar. */
const PAD = 8;
const CARET_WIDTH = 2;
/** How far the bar stops short of the panel, top and bottom. */
const CARET_INSET = 5;
/** A full blink, in seconds: half of it lit. */
const BLINK = 1;

/** `⟨a⟩ ⟨op⟩ ⟨b⟩`, for the four sums this file does. */
const sum = (op: 'ADD' | 'MINUS', a: object, b: object) => ({
  block: {type: 'math_arithmetic', fields: {OP: op}, inputs: {A: a, B: b}},
});

/** `⟨width⟩ − 16` — the room the words actually have between the insets. */
const column = () => sum('MINUS', width(), num(2 * PAD));

/**
 * `width of ⟨what it holds⟩ at size ⟨its text size⟩`, in pixels.
 *
 * The one question this actor cannot answer out of its own properties, and the
 * reason the World is lent a measuring tape at all (`World.textWidth`).
 */
const shown = () => ({
  block: {
    type: 'world_text_width',
    inputs: {TEXT: held(), SIZE: textOf('TextSizeProperty')},
  },
});

/** `⟨scroll⟩ of this actor` — how far left the words are pushed. */
const scrolled = () => ({
  block: {
    type: 'world_get_ActorsTextInput_ScrollProperty',
    inputs: {ACTOR: me()},
  },
});

/** Where the words start, which is the inset less however far they slid. */
const textLeft = () => sum('MINUS', num(PAD), scrolled());

/** …and where the caret goes: straight after them. */
const caretLeft = () => sum('ADD', textLeft(), shown());

/**
 * `⟨focused⟩ and ⟨the first half of each second⟩` — when the bar is drawn.
 *
 * A caret that does not blink reads as a picture of a caret. The clock is the
 * world's, so every field on a screen blinks together, which is what a reader
 * expects and what a per-actor timer would not give.
 */
const blinking = () => ({
  block: {
    type: 'logic_operation',
    fields: {OP: 'AND'},
    inputs: {
      A: focused(),
      B: {
        block: {
          type: 'logic_compare',
          fields: {OP: 'LT'},
          inputs: {
            A: {
              block: {
                type: 'math_modulo',
                inputs: {
                  DIVIDEND: {block: {type: 'world_time'}},
                  DIVISOR: num(BLINK),
                },
              },
            },
            B: num(BLINK / 2),
          },
        },
      },
    },
  },
});

/**
 * `each frame`: slide the words so the caret is inside the box.
 *
 * Zero while what is typed fits, and exactly the overflow once it does not —
 * so a field fills up and then scrolls, rather than typing into thin air past
 * its own edge.
 *
 * A STEP AND A PROPERTY rather than the same sum written twice in the drawing.
 * The drawing needs it in two places (where the words start, and where the
 * caret goes), the sum is four blocks, and a value the actor CARRIES is one an
 * inspector can show and a project can read.
 */
const slidesToShowTheCaret = () => ({
  type: 'world_trait_step',
  fields: {PHASE: 'react', NAME: 'keep the caret in the box'},
  inputs: {
    DO: {
      block: {
        type: 'world_set_ActorsTextInput_ScrollProperty',
        inputs: {
          ACTOR: me(),
          VALUE: {
            block: {
              type: 'logic_ternary',
              inputs: {
                IF: {
                  block: {
                    type: 'logic_compare',
                    fields: {OP: 'GT'},
                    inputs: {A: shown(), B: column()},
                  },
                },
                THEN: sum('MINUS', shown(), column()),
                ELSE: {block: {type: 'math_number', fields: {NUM: 0}}},
              },
            },
          },
        },
      },
    },
  },
});

export const textInputActor = actorFile(
  'Text Input',
  [
    actsLike('actors/label'),
    // What was typed, rather than which keys are down.
    useTrait('Input#TakesKeyboardInputTrait'),
    // A click on THIS one, so it knows to take over. It no longer needs to
    // hear every OTHER click: `take the focus` releases whoever had it.
    useTrait('Mouse#CanBeClickedTrait'),
    // …and the keyboard's way around the interface, which is where `focused`
    // comes from and how Tab reaches this field at all.
    useTrait('Tab Navigation#CanBeFocusedTrait'),
    showAs('input'),
    // How far left the words are pushed so the caret stays in the box. Kept by
    // the step below, read twice by the drawing.
    defineProperty('number', 'scroll', '0'),
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
    slidesToShowTheCaret(),
  ],
  {
    handlers: [
      // A click on this one: take the typing. ONE statement, where it used to
      // be a clear on every field and a set on this one, ordered against each
      // other — `take the focus` releases whoever had it as part of taking it.
      {
        type: 'world_on_Mouse_IsClickedWithEvent',
        fields: {FILTER0: ''},
        inputs: {ACTOR: me()},
        next: {block: takeFocus()},
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
        // Inset from the left edge, since the words are anchored there — less
        // however far they have slid to keep the caret in view.
        //
        // IN A COLUMN OF ZERO, which is `draw paragraph`'s way of saying "do
        // not wrap": a field is one line however much is typed into it, and a
        // second line in a 28-pixel box is half of a word hanging out of the
        // bottom. What runs past the right edge is clipped by the actor's own
        // canvas, which is what a field looks like everywhere.
        drawParagraph(textLeft(), labelHalf(height()), 0),
        // …and the caret, straight after the words, for half of every second.
        onlyIf(blinking(), [
          rectangle(
            caretLeft(),
            num(CARET_INSET),
            num(CARET_WIDTH),
            sum('MINUS', height(), num(2 * CARET_INSET)),
          ),
        ]),
      ],
    },
  },
);
