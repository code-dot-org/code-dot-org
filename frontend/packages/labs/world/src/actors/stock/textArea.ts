// "Text Area" — a Text Input with lines.
//
// The last of the base set, and the one the spec ranked last: several lines
// you can type in. What it adds to the Text Input is exactly one thing, a
// LINE, and everything below is the arithmetic that one thing costs
// (specs/UI_ACTORS.md).
//
// A LINE IS A NEWLINE IN THE WORDS. Enter is not a character — the `types`
// event never sees it — so it is the one KEY this listens to that inserts
// something: a newline at the caret. `draw paragraph` breaks on it, in a
// column of zero so nothing else breaks: a line is as long as it was typed,
// and what runs past the right edge is clipped, as the Text Input's is.
// Soft wrapping is deliberately not done, because the painter decides where
// a wrapped line breaks and the caret would have to guess the same place
// (specs/DRAWING.md); a caret that disagrees with the words is worse than a
// long line.
//
// THE CARET IS STILL ONE NUMBER, the characters before it, and its line and
// column are worked out from the words: the line is how many newlines come
// before it, and the column is how far it is past the last of them. Both are
// questions Blockly's own text blocks answer — `count`, `find last`, and the
// substrings the Text Input already takes. Up and down keep the column where
// the line above or below has room for it, which is what every editor does.
//
// WHERE THE BAR IS DRAWN follows the painter: lines are laid `size × 1.25`
// apart from a top-left anchor, so the bar sits at `PAD + line × step`, and
// as far across as the line's prefix measures — the same measuring tape the
// Text Input borrows (`World.textWidth`).
//
// TWO THINGS THE TEXT INPUT DOES THAT THIS DOES NOT, and why:
//
//   - a click puts the caret at the END, not in the word. Clicking into a
//     line of a paragraph is the Text Input's prefix scan run on one line of
//     several, and which line is a division; it is the next thing to add,
//     and it is not here because a first cut that scans the wrong line is
//     worse than one that goes to the end.
//   - the words do not scroll. A line past the right edge and a paragraph
//     past the bottom are clipped; making them slide is the Text Input's
//     three cases in two directions, and waits for an actor tall enough to
//     need it.

import {labelSizeOf} from './label';
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

const OWN = 'ActorsTextArea';

/** Room for a short paragraph. */
const WIDTH = 160;
const HEIGHT = 96;
/** The painter's line step, as a multiple of the text size. */
const LINE_SPACING = 1.25;
const PAD = 8;
const CARET_WIDTH = 2;
const BLINK = 1;

const width = () => labelSizeOf('Width');
const height = () => labelSizeOf('Height');

const focused = () => ({
  block: {
    type: 'world_get_TabNavigation_FocusedProperty',
    inputs: {ACTOR: me()},
  },
});
const emitChanged = () => ({
  type: `world_emit_${OWN}_ChangedEvent`,
  inputs: {ACTOR: me()},
});
const onlyIf = (test: object, body: object[]) => ({
  type: 'controls_if',
  inputs: {IF0: test, DO0: {block: chain(body)}},
});
const both = (a: object, b: object) => ({
  block: {type: 'logic_operation', fields: {OP: 'AND'}, inputs: {A: a, B: b}},
});
const sum = (op: 'ADD' | 'MINUS' | 'MULTIPLY', a: object, b: object) => ({
  block: {type: 'math_arithmetic', fields: {OP: op}, inputs: {A: a, B: b}},
});
const compare = (op: 'LT' | 'GT', a: object, b: object) => ({
  block: {type: 'logic_compare', fields: {OP: op}, inputs: {A: a, B: b}},
});
/** `⟨value⟩` held between `low` and `high`. */
const clamp = (value: object, low: object, high: object) => ({
  block: {type: 'math_constrain', inputs: {VALUE: value, LOW: low, HIGH: high}},
});
/** Several strings joined left to right (`textInput.joined`). */
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
const literal = (text: string) => ({
  block: {type: 'text', fields: {TEXT: text}},
});
const NEWLINE = () => literal('\n');

const held = () => textOf('TextProperty');
const atSize = () => textOf('TextSizeProperty');
const length = () => ({block: {type: 'text_length', inputs: {VALUE: held()}}});
const caretAt = () => ({
  block: {type: `world_get_${OWN}_CaretProperty`, inputs: {ACTOR: me()}},
});
const setCaret = (to: object) => ({
  type: `world_set_${OWN}_CaretProperty`,
  inputs: {ACTOR: me(), VALUE: to},
});
/** The first `n` characters of what it holds. */
const upTo = (n: object, of: object = held()) => ({
  block: {
    type: 'text_getSubstring',
    fields: {WHERE1: 'FROM_START', WHERE2: 'FROM_START'},
    inputs: {STRING: of, AT1: num(1), AT2: n},
  },
});
/** …and everything from character `n` onwards. */
const from = (n: object, of: object = held()) => ({
  block: {
    type: 'text_getSubstring',
    fields: {WHERE1: 'FROM_START', WHERE2: 'LAST'},
    inputs: {STRING: of, AT1: n},
  },
});
/** `find ⟨first|last⟩ occurrence of ⟨newline⟩ in ⟨text⟩`, 1-based, 0 if none. */
const newlineIn = (text: object, which: 'FIRST' | 'LAST') => ({
  block: {
    type: 'text_indexOf',
    fields: {END: which},
    inputs: {VALUE: text, FIND: NEWLINE()},
  },
});
/** `count ⟨newline⟩ in ⟨text⟩` — which line the end of `text` is on. */
const newlinesIn = (text: object) => ({
  block: {type: 'text_count', inputs: {SUB: NEWLINE(), TEXT: text}},
});

/** Everything before the caret. */
const before = () => upTo(caretAt());
/** How many characters come before the caret's LINE: the last newline's place. */
const lineStart = () => newlineIn(before(), 'LAST');
/** How far along its line the caret is. */
const column = () => sum('MINUS', caretAt(), lineStart());
/** The caret's line, counting from zero. */
const line = () => newlinesIn(before());
/** The caret's line up to the caret, which is what the bar is drawn after. */
const linePrefix = () => from(sum('ADD', lineStart(), num(1)), before());
const widthOf = (text: object) => ({
  block: {type: 'world_text_width', inputs: {TEXT: text, SIZE: atSize()}},
});

const takeFocus = () => ({
  type: 'world_do_TabNavigation_TakeTheFocusAction',
  inputs: {ACTOR: me()},
});

/** Put `what` in at the caret, and move the caret past it. */
const insert = (what: object) => [
  setText(
    'TextProperty',
    joined([before(), what, from(sum('ADD', caretAt(), num(1)))]),
  ),
  setCaret(sum('ADD', caretAt(), num(1))),
  emitChanged(),
];

/**
 * Up: to the same column on the line above, or as far as it goes.
 *
 * The line above ends at the newline `lineStart` names; it begins after the
 * newline before that, found in the words up to it. Its length is the gap
 * between the two, and the caret goes that far along or to the column,
 * whichever is less.
 */
const lineAbove = () => {
  const aboveEnd = () => sum('MINUS', lineStart(), num(1));
  const aboveStart = () => newlineIn(upTo(aboveEnd()), 'LAST');
  return onlyIf(both(focused(), compare('GT', lineStart(), num(0))), [
    setCaret(
      sum(
        'ADD',
        aboveStart(),
        clamp(column(), num(0), sum('MINUS', aboveEnd(), aboveStart())),
      ),
    ),
  ]);
};
/**
 * Down: to the same column on the line below, or as far as it goes.
 *
 * The line below begins after the first newline past the caret, and ends at
 * the newline after that or at the end of the words.
 */
const lineBelow = () => {
  const rest = () => from(sum('ADD', caretAt(), num(1)));
  const breakAhead = () => newlineIn(rest(), 'FIRST');
  const belowStart = () => sum('ADD', caretAt(), breakAhead());
  const after = () => from(sum('ADD', belowStart(), num(1)));
  const breakAfter = () => newlineIn(after(), 'FIRST');
  const belowLength = () => ({
    block: {
      type: 'logic_ternary',
      inputs: {
        IF: compare('GT', breakAfter(), num(0)),
        THEN: sum('MINUS', breakAfter(), num(1)),
        ELSE: sum('MINUS', length(), belowStart()),
      },
    },
  });
  return onlyIf(both(focused(), compare('GT', breakAhead(), num(0))), [
    setCaret(sum('ADD', belowStart(), clamp(column(), num(0), belowLength()))),
  ]);
};

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

const key = (name: string, body: object) => ({
  type: 'world_on_Input_PressesEvent',
  fields: {FILTER0: name},
  inputs: {ACTOR: me()},
  next: {block: body},
});

export const textAreaActor = actorFile(
  'Text Area',
  [
    actsLike('actors/label'),
    useTrait('Input#TakesKeyboardInputTrait'),
    useTrait('Mouse#CanBeClickedTrait'),
    useTrait('Tab Navigation#CanBeFocusedTrait'),
    showAs('paragraph'),
    defineProperty('number', 'caret', '0'),
    defineEvent('changed'),
    {
      type: 'world_set_ActorsLabel_WidthProperty',
      inputs: {
        ACTOR: me(),
        VALUE: {shadow: {type: 'math_number', fields: {NUM: WIDTH}}},
      },
    },
    {
      type: 'world_set_ActorsLabel_HeightProperty',
      inputs: {
        ACTOR: me(),
        VALUE: {shadow: {type: 'math_number', fields: {NUM: HEIGHT}}},
      },
    },
    // From the top-left corner, since a paragraph grows down from its first
    // line and the caret is placed by counting from it.
    setText('TextAnchorProperty', words('top left')),
    setText('TextProperty', words('')),
  ],
  {
    handlers: [
      // A click chooses this area, and puts the bar at the end.
      {
        type: 'world_on_Mouse_IsClickedWithEvent',
        fields: {FILTER0: ''},
        inputs: {ACTOR: me()},
        next: {block: chain([takeFocus(), setCaret(length())])},
      },
      // A character goes in at the bar.
      {
        type: 'world_on_Input_TypesEvent',
        inputs: {ACTOR: me()},
        next: {
          block: onlyIf(
            focused(),
            insert({block: {type: 'world_event_value'}}),
          ),
        },
      },
      // …and so does a line: Enter is the one key that adds to the words.
      key('enter', onlyIf(focused(), insert(NEWLINE()))),
      key(
        'backspace',
        onlyIf(both(focused(), compare('GT', caretAt(), num(0))), [
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
      ),
      key(
        'delete',
        onlyIf(both(focused(), compare('LT', caretAt(), length())), [
          setText(
            'TextProperty',
            joined([before(), from(sum('ADD', caretAt(), num(2)))]),
          ),
          emitChanged(),
        ]),
      ),
      key(
        'left arrow',
        onlyIf(both(focused(), compare('GT', caretAt(), num(0))), [
          setCaret(sum('MINUS', caretAt(), num(1))),
        ]),
      ),
      key(
        'right arrow',
        onlyIf(both(focused(), compare('LT', caretAt(), length())), [
          setCaret(sum('ADD', caretAt(), num(1))),
        ]),
      ),
      key('up arrow', lineAbove()),
      key('down arrow', lineBelow()),
    ],
    drawing: {
      width: width(),
      height: height(),
      commands: [
        fill(swatch('#1a1a22')),
        outline(swatch('#8890b0'), 2),
        rectangle(0, 0, width(), height()),
        noOutline(),
        fill(textOf('TextColorProperty')),
        // From the corner, breaking on newlines only: a column of zero is
        // `draw paragraph`'s "do not wrap".
        drawParagraph(num(PAD), num(PAD), 0),
        // The bar, on the caret's line and after its prefix, blinking.
        onlyIf(blinking(), [
          rectangle(
            sum('ADD', num(PAD), widthOf(linePrefix())),
            sum(
              'ADD',
              num(PAD),
              sum(
                'MULTIPLY',
                line(),
                sum('MULTIPLY', atSize(), num(LINE_SPACING)),
              ),
            ),
            num(CARET_WIDTH),
            atSize(),
          ),
        ]),
      ],
    },
  },
);
