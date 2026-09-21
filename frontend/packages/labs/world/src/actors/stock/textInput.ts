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
// THE INSERTION POINT IS A NUMBER, and everything else follows from it.
// `caret` counts the characters BEFORE it, so typing inserts there, backspace
// takes the character before it, and the arrows move it. It used to be the end
// of the text and nothing else — which reads as a text field until the moment
// somebody wants to fix a typo in the middle of what they typed.
//
// CLICKING INTO A WORD is what the measuring seam was really built for, and it
// is the case a drawing could never have answered: where a click landed, in
// LETTERS, is asked by a mouse handler in the frame it is asked in. The scan
// walks the prefixes — the width of the first one character, the first two —
// and stops at the boundary nearest the click. That is one measurement per
// character, of a line short enough to fit a field, once per click.
//
// AND THE WORDS SLIDE so the CARET stays in the box, which is not the same as
// keeping the END in the box: a caret walked back to the start of a long line
// has to bring the line with it. `scroll` is how far left the words are
// pushed, worked out once a frame in three cases — the caret is off the left,
// the caret is off the right, or there is slack at the right and the words
// should come back.

import {labelHalf, labelSizeOf} from './label';
import {BORDER, LOOK, RADIUS_TIGHT} from './look';
import {
  actorFile,
  actsLike,
  chain,
  corner,
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
  useStyle,
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

/** `⟨a⟩ and ⟨b⟩`. */
const both = (a: object, b: object) => ({
  block: {type: 'logic_operation', fields: {OP: 'AND'}, inputs: {A: a, B: b}},
});

/**
 * Several strings, joined left to right.
 *
 * `as text` on the FIRST link, and it is not the redundant kind: a chain's
 * first block has to carry a socket, and `“ ⟨…⟩ ”` is the only string block
 * that does — `text` has a field where its words go. Every link after it plugs
 * into the one before (`domainBlocks.worldAsText`).
 */
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

/** `⟨text⟩ of this actor`, which is what a field holds. */
const held = () => textOf('TextProperty');

/** …and the size it is drawn at, which every measurement needs. */
const atSize = () => textOf('TextSizeProperty');

const OWN = 'ActorsTextInput';

/** One of this field's own properties, read off itself. */
const own = (exportName: string) => ({
  block: {type: `world_get_${OWN}_${exportName}`, inputs: {ACTOR: me()}},
});

/** `⟨hint⟩ of this actor` — what the field says while it is empty. */
const hint = () => own('HintProperty');
/** …whether it takes digits only, and whether a project has called it wrong. */
const digitsOnly = () => own('OnlyNumbersProperty');
const looksWrong = () => own('LooksWrongProperty');

/** `⟨a⟩ = ⟨b⟩`, for the one equality this file does. */
const isEmpty = () => ({
  block: {
    type: 'logic_compare',
    fields: {OP: 'EQ'},
    inputs: {A: length(), B: num(0)},
  },
});

/** `not ⟨a⟩`. */
const not = (a: object) => ({block: {type: 'logic_negate', inputs: {BOOL: a}}});

/**
 * What a number field will take: the ten digits, a minus and a dot.
 *
 * A NUMBER FIELD THAT CANNOT SAY `-2` OR `1.5` is a counting field wearing
 * the wrong name. What it refuses is letters (specs/FIELDS_PLAN.md).
 */
const DIGITS = [...'0123456789-.'];

/**
 * A line of words the field does not HOLD — the hint.
 *
 * `drawParagraph` draws the actor's own `text`, which is the whole of what
 * every other caller wants; this is the one line that draws something else,
 * so it says the same thing with the text swapped.
 */
const drawWords = (text: object, x: object, y: object) => ({
  type: 'world_draw_paragraph',
  inputs: {
    TEXT: text,
    WIDTH: num(0),
    X: x,
    Y: y,
    SIZE: textOf('TextSizeProperty'),
    ANCHOR: textOf('TextAnchorProperty'),
  },
});

/**
 * Whether this field will take the character that was just typed.
 *
 * A list and `has`, rather than a new block for asking about a string: the
 * text category says plainly that `indexOf` and its family are "string
 * surgery with no reading in a world yet", and twelve characters is a list
 * anybody can read.
 */
const takes = () => ({
  block: {
    type: 'logic_operation',
    fields: {OP: 'OR'},
    inputs: {
      A: not(digitsOnly()),
      B: {
        block: {
          type: 'world_list_has',
          inputs: {
            LIST: {
              block: {
                type: 'lists_create_with',
                extraState: {itemCount: DIGITS.length},
                inputs: Object.fromEntries(
                  DIGITS.map((character, at) => [
                    `ADD${at}`,
                    {block: {type: 'text', fields: {TEXT: character}}},
                  ]),
                ),
              },
            },
            ITEM: {block: {type: 'world_event_value'}},
          },
        },
      },
    },
  },
});

/** `length of ⟨what it holds⟩`. */
const length = () => ({block: {type: 'text_length', inputs: {VALUE: held()}}});

/** How far the words are inset from the left edge, and the caret's bar. */
const PAD = 8;
const CARET_WIDTH = 2;
/** How far the bar stops short of the panel, top and bottom. */
const CARET_INSET = 5;
/** A full blink, in seconds: half of it lit. */
const BLINK = 1;

/** `⟨a⟩ ⟨op⟩ ⟨b⟩`, for the four sums this file does. */
const sum = (op: 'ADD' | 'MINUS' | 'MULTIPLY', a: object, b: object) => ({
  block: {type: 'math_arithmetic', fields: {OP: op}, inputs: {A: a, B: b}},
});

/** `⟨a⟩ ⟨op⟩ ⟨b⟩` as a test — the comparisons the editing rows ask. */
const compare = (op: 'LT' | 'LTE' | 'GT', a: object, b: object) => ({
  block: {type: 'logic_compare', fields: {OP: op}, inputs: {A: a, B: b}},
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
    inputs: {TEXT: held(), SIZE: atSize()},
  },
});

/** `⟨caret⟩ of this actor` — how many characters are before the bar. */
const caretAt = () => ({
  block: {
    type: 'world_get_ActorsTextInput_CaretProperty',
    inputs: {ACTOR: me()},
  },
});

/** `set ⟨caret⟩ of this actor to ⟨n⟩`. */
const setCaret = (to: object) => ({
  type: 'world_set_ActorsTextInput_CaretProperty',
  inputs: {ACTOR: me(), VALUE: to},
});

/** `the first ⟨n⟩ characters of ⟨what it holds⟩` — everything before a point. */
const upTo = (n: object) => ({
  block: {
    type: 'text_getSubstring',
    fields: {WHERE1: 'FROM_START', WHERE2: 'FROM_START'},
    inputs: {STRING: held(), AT1: num(1), AT2: n},
  },
});

/** …and everything from character ⟨n⟩ onwards, which is the rest of it. */
const from = (n: object) => ({
  block: {
    type: 'text_getSubstring',
    fields: {WHERE1: 'FROM_START', WHERE2: 'LAST'},
    inputs: {STRING: held(), AT1: n},
  },
});

/** How wide the first `n` characters are drawn — where the bar goes. */
const widthTo = (n: object) => ({
  block: {
    type: 'world_text_width',
    inputs: {TEXT: upTo(n), SIZE: atSize()},
  },
});

/** `⟨this actor⟩ take the focus` — the one way it comes to hold it. */
const takeFocus = () => ({
  type: 'world_do_TabNavigation_TakeTheFocusAction',
  inputs: {ACTOR: me()},
});

/** `x of ⟨where the pointer is⟩`, in the world's own coordinates. */
const pointerX = () => ({
  block: {
    type: 'world_vector_component',
    fields: {COMPONENT: 'x'},
    inputs: {VEC: {block: {type: 'world_mouse_position'}}},
  },
});

/** …and `x of ⟨where this actor is⟩`, which is its MIDDLE. */
const middleX = () => ({
  block: {
    type: 'world_get_Space_PositionProperty',
    fields: {COMPONENT: 'x'},
    inputs: {ACTOR: me()},
  },
});

/**
 * How far into the WORDS the click landed, in pixels.
 *
 * From the pointer to the actor's middle, out to its left edge, past the
 * inset, and then back by however far the words have slid — which is the
 * whole of turning a place on the screen into a place in the line.
 */
const clickedAt = () =>
  sum(
    'ADD',
    sum(
      'MINUS',
      sum('ADD', sum('MINUS', pointerX(), middleX()), labelHalf(width())),
      num(PAD),
    ),
    scrolled(),
  );

/**
 * Put the bar where the click was — the scan the measuring seam exists for.
 *
 * WALKING THE PREFIXES is the only honest way: a proportional font has no
 * character width to divide by, so which letter a pixel falls on is a question
 * only measurement answers. It asks for the width of the first one character,
 * the first two, and so on, and stops at the boundary NEAREST the click —
 * which is why the test compares the midpoint of the next character rather
 * than its far edge. Clicking the right half of a letter puts the bar after
 * it, which is what every text field does and what a hand expects.
 *
 * Doubling both sides is how the midpoint is said without a division:
 * `(w(n) + w(n+1)) / 2 ≤ x` is `w(n) + w(n+1) ≤ 2x`.
 *
 * One measurement per character, of a line short enough to fit a field, once
 * per click. The loop stops at the first boundary past the click rather than
 * walking the rest of the line to no purpose.
 */
const placesTheCaret = () => [
  setCaret(num(0)),
  {
    type: 'controls_repeat_ext',
    inputs: {
      TIMES: length(),
      DO: {
        block: {
          type: 'controls_if',
          extraState: {hasElse: true},
          inputs: {
            IF0: compare(
              'LTE',
              sum(
                'ADD',
                widthTo(caretAt()),
                widthTo(sum('ADD', caretAt(), num(1))),
              ),
              sum('MULTIPLY', num(2), clickedAt()),
            ),
            DO0: {block: setCaret(sum('ADD', caretAt(), num(1)))},
            ELSE: {
              block: {
                type: 'controls_flow_statements',
                fields: {FLOW: 'BREAK'},
              },
            },
          },
        },
      },
    },
  },
];

/** `set ⟨scroll⟩ of this actor to ⟨n⟩`. */
const setScroll = (to: object) => ({
  type: 'world_set_ActorsTextInput_ScrollProperty',
  inputs: {ACTOR: me(), VALUE: to},
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

/** …and where the bar goes: after the characters BEFORE it, not after all. */
const caretLeft = () => sum('ADD', textLeft(), widthTo(caretAt()));

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

/** Where the bar is, measured from the left edge of the words. */
const caretWidth = () => widthTo(caretAt());

/**
 * `each frame`: slide the words so the CARET is inside the box.
 *
 * Not the end of the text — that was enough while the caret could only be at
 * the end, and stops being enough the moment an arrow key walks it back. Three
 * cases, and each is one comparison:
 *
 *   the bar is off the LEFT   → bring the words to it;
 *   the bar is off the RIGHT  → bring the words back by the overflow;
 *   there is SLACK at the right → pull the words right until there is none,
 *                                 or to nothing at all if the line now fits.
 *
 * The third is what stops a field staying scrolled after its text is deleted,
 * which the two-case version did: it only ever pushed left.
 *
 * A STEP AND A PROPERTY rather than the same sums written into the drawing.
 * The drawing needs the answer in two places (where the words start, and where
 * the bar goes), and a value the actor CARRIES is one an inspector can show.
 */
const slidesToShowTheCaret = () => ({
  type: 'world_trait_step',
  fields: {PHASE: 'react', NAME: 'keep the caret in the box'},
  inputs: {
    DO: {
      block: {
        type: 'controls_if',
        extraState: {elseIfCount: 2},
        inputs: {
          // Off the left: the words have been pushed further than the bar.
          IF0: compare('LT', caretWidth(), scrolled()),
          DO0: {block: setScroll(caretWidth())},
          // Off the right: past the far edge of the room the words have.
          IF1: compare('GT', sum('MINUS', caretWidth(), scrolled()), column()),
          DO1: {block: setScroll(sum('MINUS', caretWidth(), column()))},
          // …and slack, which is the case that lets a shortened line come
          // back. Nothing to come back to when the whole line fits, so the
          // answer is zero rather than a negative push.
          IF2: compare('LT', sum('MINUS', shown(), scrolled()), column()),
          DO2: {
            block: setScroll({
              block: {
                type: 'logic_ternary',
                inputs: {
                  IF: compare('GT', shown(), column()),
                  THEN: sum('MINUS', shown(), column()),
                  ELSE: {block: {type: 'math_number', fields: {NUM: 0}}},
                },
              },
            }),
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
    // WHERE THE TYPING GOES, counted in characters before it. Everything else
    // about editing is arithmetic on this: typing inserts here, backspace
    // takes the character before it, and the arrows move it.
    defineProperty('number', 'caret', '0'),
    // …and how far left the words are pushed so it stays in the box. Kept by
    // the step below, read twice by the drawing.
    defineProperty('number', 'scroll', '0'),
    // WHAT BELONGS IN IT, said in the field rather than beside it. Drawn
    // while the field is empty and gone the moment anything is typed — it is
    // never the text, because a hint the first keystroke has to delete is the
    // bug this file avoided by shipping empty (specs/FIELDS_PLAN.md).
    defineProperty('string', 'hint', ''),
    // …and the one KIND worth having. A number is what an app asks for that a
    // word is not: a quantity, an amount, how many. Anything else a field
    // might restrict is a vocabulary this does not invent.
    defineProperty('boolean', 'only numbers', 'false'),
    // …and whether somebody has decided the answer is wrong. A PROJECT's
    // word: the field has no idea what an email is, and what it owns is
    // saying so once somebody has decided.
    defineProperty('boolean', 'looks wrong', 'false'),
    defineEvent('changed'),
    // Enter, while this field is listening — a form's submit, and the
    // keyboard half of the button beside it.
    defineEvent('is done'),
    {
      type: 'world_set_Boxed_HeightProperty',
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
      // A click chooses this field AND says where in it. Two statements for
      // two questions: which control the keyboard goes to, and where in this
      // one the next letter lands.
      {
        type: 'world_on_Mouse_IsClickedWithEvent',
        fields: {FILTER0: ''},
        inputs: {ACTOR: me()},
        next: {
          block: chain([takeFocus(), ...placesTheCaret()]),
        },
      },
      // A character, inserted where the bar is — not appended. Appending is
      // what a field does until somebody clicks into the middle of what they
      // typed, which is the first thing anybody does after a typo.
      {
        type: 'world_on_Input_TypesEvent',
        inputs: {ACTOR: me()},
        next: {
          block: onlyIf(both(focused(), takes()), [
            setText(
              'TextProperty',
              joined([
                upTo(caretAt()),
                {block: {type: 'world_event_value'}},
                from(sum('ADD', caretAt(), num(1))),
              ]),
            ),
            setCaret(sum('ADD', caretAt(), num(1))),
            emitChanged(),
          ]),
        },
      },
      // …and backspace, which makes no character and so is a KEY. It takes the
      // one BEFORE the bar and moves the bar back over the gap.
      {
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: 'backspace'},
        inputs: {ACTOR: me()},
        next: {
          block: onlyIf(both(focused(), compare('GT', caretAt(), num(0))), [
            setText(
              'TextProperty',
              joined([
                upTo(sum('MINUS', caretAt(), num(1))),
                from(sum('ADD', caretAt(), num(1))),
              ]),
            ),
            setCaret(sum('MINUS', caretAt(), num(1))),
            emitChanged(),
          ]),
        },
      },
      // …and delete, which is the same edit read the other way: it takes the
      // character AFTER the bar and leaves the bar where it is.
      {
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: 'delete'},
        inputs: {ACTOR: me()},
        next: {
          block: onlyIf(both(focused(), compare('LT', caretAt(), length())), [
            setText(
              'TextProperty',
              joined([upTo(caretAt()), from(sum('ADD', caretAt(), num(2)))]),
            ),
            emitChanged(),
          ]),
        },
      },
      // Enter says the answer is finished. It changes nothing: what happens
      // after a form is submitted is the project's, and a field that emptied
      // itself would take the answer away before a handler could read it.
      {
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: 'enter'},
        inputs: {ACTOR: me()},
        next: {
          block: onlyIf(focused(), [
            {
              type: `world_emit_${OWN}_IsDoneEvent`,
              inputs: {ACTOR: me()},
            },
          ]),
        },
      },
      // The arrows walk the bar. They do not wrap and they do not run off
      // either end: a caret at the start that answered a left arrow by going
      // negative would put every later sum out by one, silently.
      {
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: 'left arrow'},
        inputs: {ACTOR: me()},
        next: {
          block: onlyIf(both(focused(), compare('GT', caretAt(), num(0))), [
            setCaret(sum('MINUS', caretAt(), num(1))),
          ]),
        },
      },
      {
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: 'right arrow'},
        inputs: {ACTOR: me()},
        next: {
          block: onlyIf(both(focused(), compare('LT', caretAt(), length())), [
            setCaret(sum('ADD', caretAt(), num(1))),
          ]),
        },
      },
    ],
    drawing: {
      width: width(),
      height: height(),
      commands: [
        // The field: dark, with an edge that says whether it is listening —
        // and RED when a project has called the answer wrong, which is the
        // one thing about a field a form needs to be able to show
        // (specs/FIELDS_PLAN.md).
        fill(swatch(LOOK.field)),
        outline(swatch(LOOK.surfaceEdge), BORDER),
        corner(RADIUS_TIGHT),
        useStyle('field'),
        rectangle(0, 0, width(), height()),
        onlyIf(looksWrong(), [
          // The wrong edge is drawn THICKER as well as red, so that the one
          // thing a form must be able to shout is not said in colour alone.
          outline(swatch(LOOK.danger), BORDER + 1),
          useStyle('wrong'),
          rectangle(0, 0, width(), height()),
        ]),
        noOutline(),
        // …and the hint, while there is nothing in it. Dimmed, so it reads as
        // a label for the box rather than as something somebody typed, and
        // drawn instead of the words rather than under them — an empty field
        // has no words to be under.
        onlyIf(isEmpty(), [
          fill(swatch(LOOK.mutedInk)),
          useStyle('hint'),
          drawWords(hint(), num(PAD), labelHalf(height())),
        ]),
        useStyle('caption'),
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
