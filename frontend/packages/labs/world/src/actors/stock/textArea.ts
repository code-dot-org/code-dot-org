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
// A CLICK LANDS WHERE IT LANDED, which it did not: it used to put the caret at
// the end of everything, so the one thing anybody does after a typo — click
// back into it — could not be done. It is two questions and the lab already
// had the hard one. WHICH LINE is arithmetic, the painter's own step divided
// into the click's y; WHICH LETTER is the Text Input's prefix walk, because a
// proportional font has no character width to divide by and only measurement
// answers it.
//
// What was genuinely missing is the character a line STARTS at. `find newline`
// answers first-or-last and not nth, so the caret is stepped down a line at a
// time — the same "where does the next line begin" the down arrow is made of.
// The scan then walks that line and stops at its end, which is what keeps a
// click off the right of a short line from running onto the next one.
//
// THE WORDS DO SCROLL, BOTH WAYS, which they did not. A paragraph taller than
// the box was simply cut off and a line longer than it ran off the edge:
// either way, what you were typing was in a place nobody could see. The window
// is two offsets in pixels — `scroll` down the paragraph and `slide` across
// the line — the words and the bar are drawn less both, and the texture's own
// bounds do the clipping, because a drawing is rasterised at the actor's size
// (specs/DRAWING.md).
//
// TWO NAMES RATHER THAN A VECTOR, because they answer different questions: one
// is a place in the paragraph, the other a place in ONE line, and a line
// scrolls on its own — walking to a short line brings the words back however
// far the line above ran on.
//
// AND IT FOLLOWS THE CARET, which is the part that makes it usable: after
// every move and every edit the window is clamped between the offset that puts
// the caret at the far edge of the box and the one that puts it at the near
// edge. A caret already in view sits between the two and nothing moves; one
// past an edge snaps to the nearer bound and lands against that edge. One
// clamp rather than two tests, which is the List's trick for the same job
// (`actors/list`, `reveal`).
//
// The ACROSS clamp is the Text Input's three cases in one. That actor tests
// for the caret being off the left, off the right, and for slack at the right
// when a line has been shortened; the clamp answers all three, because a
// shorter line means a smaller caret offset, which brings the upper bound —
// and the words — back with it.

import {labelHalf, labelSizeOf} from './label';
import {BORDER, LOOK, RADIUS_TIGHT} from './look';
import {
  actorFile,
  actsLike,
  alongX,
  alongY,
  chain,
  corner,
  defineBlock,
  defineEvent,
  defineProperty,
  drawParagraph,
  fill,
  joined,
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
const sum = (
  op: 'ADD' | 'MINUS' | 'MULTIPLY' | 'DIVIDE',
  a: object,
  b: object,
) => ({
  block: {type: 'math_arithmetic', fields: {OP: op}, inputs: {A: a, B: b}},
});
const compare = (op: 'LT' | 'LTE' | 'GT', a: object, b: object) => ({
  block: {type: 'logic_compare', fields: {OP: op}, inputs: {A: a, B: b}},
});
/** `⟨value⟩` held between `low` and `high`. */
const clamp = (value: object, low: object, high: object) => ({
  block: {type: 'math_constrain', inputs: {VALUE: value, LOW: low, HIGH: high}},
});
const literal = (text: string) => ({
  block: {type: 'text', fields: {TEXT: text}},
});
const NEWLINE = () => literal('\n');

const held = () => textOf('TextProperty');
const atSize = () => textOf('TextSizeProperty');
/** `round down ⟨n⟩` — which line a pixel falls on, once divided. */
const floor = (of: object) => ({
  block: {type: 'math_round', fields: {OP: 'ROUNDDOWN'}, inputs: {NUM: of}},
});
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
/** …and the same with one more character, which the scan compares against. */
const linePrefixPlusOne = () =>
  from(sum('ADD', lineStart(), num(1)), upTo(sum('ADD', caretAt(), num(1))));
/**
 * The style the words are DRAWN in, and so the one they must be MEASURED in.
 *
 * The Modern theme makes a caption bold and bold is wider, so a tape that did
 * not know came back short by a little per character — which is a bar a touch
 * before the end of one line and several letters adrift down a paragraph
 * (`World.textWidth`).
 */
const CAPTION = 'caption';

const widthOf = (text: object) => ({
  block: {
    type: 'world_text_width',
    fields: {STYLE: CAPTION},
    inputs: {TEXT: text, SIZE: atSize()},
  },
});

// ── Scrolling, which is one clamp said twice ────────────────────────────────

/** How far apart the painter lays two lines (specs/DRAWING.md). */
const step = () => sum('MULTIPLY', atSize(), num(LINE_SPACING));
/** How much room there is for words: the box, less the padding at each end. */
const inside = () => sum('MINUS', height(), num(PAD * 2));
/** How many lines the words are, which is the breaks plus the last one. */
const lines = () => sum('ADD', newlinesIn(held()), num(1));
/** The top of line `l`, measured from the top of the words. */
const lineTop = (l: object) => sum('MULTIPLY', l, step());
/** How far it can scroll before the last line is at the bottom. Never below 0. */
const overflow = () =>
  clamp(
    sum('MINUS', sum('MULTIPLY', lines(), step()), inside()),
    num(0),
    sum('MULTIPLY', lines(), step()),
  );

const scroll = () => ({
  block: {type: `world_get_${OWN}_ScrollProperty`, inputs: {ACTOR: me()}},
});
/** How much room there is ACROSS: the box, less the padding at each end. */
const across = () => sum('MINUS', width(), num(PAD * 2));
/** How far the bar is along its line, which is what has to stay in view. */
const caretAcross = () => widthOf(linePrefix());
const slid = () => ({
  block: {type: `world_get_${OWN}_SlideProperty`, inputs: {ACTOR: me()}},
});
const slideTo = (to: object) => ({
  type: `world_set_${OWN}_SlideProperty`,
  inputs: {ACTOR: me(), VALUE: to},
});
const scrollTo = (to: object) => ({
  type: `world_set_${OWN}_ScrollProperty`,
  inputs: {ACTOR: me(), VALUE: clamp(to, num(0), overflow())},
});

/**
 * Bring the caret's line into view, moving as little as possible.
 *
 * ONE CLAMP RATHER THAN TWO TESTS, which is the List's trick for the same job
 * (`actors/list`, `reveal`). The bottom of the clamp is the scroll that puts
 * the line at the FOOT of the box and the top is the scroll that puts it at
 * the HEAD, so a line already in view is between them and nothing moves; a
 * line below the window snaps to the first and becomes the bottom-most, and
 * one above snaps to the second and becomes the top-most.
 *
 * After every caret move and every edit, because both can take the caret off
 * the screen — typing a line at the bottom is the ordinary way to do it.
 */
/**
 * `keep the caret in view` — the same work, said once and called eight times.
 *
 * THE BIGGEST THING IN THIS FILE, and it was written out at every site that
 * moves the caret: six key hats, the insert, and the click. Each copy carries
 * the whole of the arithmetic below — which line the caret is on, how far
 * along it, how tall a line is, how much room the box has — and each copy is
 * about a hundred and fifty blocks. A reader opening the file met the same
 * sums eight times and the workspace was three and a half times the size of
 * the Text Input's.
 *
 * A `define block` is what this lab already has for that: a named thing a kind
 * does, with its body behind a pencil on a surface of its own, so the file
 * shows the NAME at each of the eight sites and the sums once
 * (`ownProperties.designedBlock`). It is the first stock actor to use one.
 */
const KEEP_IN_VIEW = 'keep the caret in view';

/** `keep the caret in view` — the call, which is what the handlers say. */
const keepInView = () => ({
  type: 'world_do_ActorsTextArea_KeepTheCaretInViewAction',
  inputs: {ACTOR: me()},
});

const revealBody = () => [
  scrollTo(
    clamp(
      scroll(),
      sum('MINUS', sum('ADD', lineTop(line()), step()), inside()),
      lineTop(line()),
    ),
  ),
  // …AND THE SAME CLAMP ACROSS. The Text Input answers this with a per-frame
  // step and three cases — off the left, off the right, and slack at the
  // right when a line has got shorter — and the clamp is all three at once:
  // move to a short line and the upper bound comes down with the caret, which
  // pulls the words back without a case of its own.
  //
  // The low bound is clamped to zero rather than allowed negative, which is
  // the only asymmetry with the vertical: there is nothing to the left of the
  // first character, where there IS something above the first line once the
  // window has moved.
  slideTo(
    clamp(
      slid(),
      clamp(sum('MINUS', caretAcross(), across()), num(0), caretAcross()),
      caretAcross(),
    ),
  ),
];

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
  keepInView(),
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
    keepInView(),
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
    keepInView(),
  ]);
};

// ── Where a click lands ────────────────────────────────────────────────────

/** Where the caret's line ENDS: the next newline, or the end of the words. */
const lineEnd = () => {
  const ahead = () => newlineIn(from(sum('ADD', caretAt(), num(1))), 'FIRST');
  return {
    block: {
      type: 'logic_ternary',
      inputs: {
        IF: compare('GT', ahead(), num(0)),
        THEN: sum('MINUS', sum('ADD', caretAt(), ahead()), num(1)),
        ELSE: length(),
      },
    },
  };
};

/** How many characters are left on the caret's line, after the caret. */
const restOfLine = () => sum('MINUS', lineEnd(), caretAt());

/**
 * Which LINE the click landed on, counting from zero.
 *
 * The y of the click in this actor's own frame, out to its top edge, past the
 * inset, plus however far the words have scrolled — then divided by the step
 * the painter lays lines at. Clamped to the lines there are, so a click in the
 * empty band below the last line goes to the last line rather than past it.
 */
const lineClicked = () =>
  clamp(
    floor(
      sum(
        'DIVIDE',
        sum(
          'ADD',
          sum('MINUS', sum('ADD', alongY(), labelHalf(height())), num(PAD)),
          scroll(),
        ),
        step(),
      ),
    ),
    num(0),
    sum('MINUS', lines(), num(1)),
  );

/** How far ACROSS the clicked line the click landed, in pixels. */
const clickedAcross = () =>
  sum('MINUS', sum('ADD', alongX(), labelHalf(width())), num(PAD));

/**
 * Put the bar where the click was: the right line, then the right letter.
 *
 * TWO WALKS, because the words are one string with newlines in it and neither
 * question can be answered by arithmetic alone. Which LINE is arithmetic — the
 * painter lays them a fixed step apart — but the character that line STARTS at
 * is not, so the caret is stepped down to it a line at a time, reusing the
 * same "where does the next line begin" the down arrow is made of.
 *
 * Then the column, which is the Text Input's scan unchanged: a proportional
 * font has no character width to divide by, so which letter a pixel falls on
 * is a question only measurement answers. It walks the prefixes of THIS line,
 * stopping at the boundary nearest the click, and never past the line's end —
 * which is what keeps a click off the right of a short line from wrapping onto
 * the next one.
 *
 * Doubling both sides is how the midpoint is said without a division:
 * `(w(n) + w(n+1)) / 2 ≤ x` is `w(n) + w(n+1) ≤ 2x`.
 */
const placesTheCaret = () => [
  setCaret(num(0)),
  {
    type: 'controls_repeat_ext',
    inputs: {
      TIMES: lineClicked(),
      DO: {
        block: setCaret(
          sum(
            'ADD',
            caretAt(),
            newlineIn(from(sum('ADD', caretAt(), num(1))), 'FIRST'),
          ),
        ),
      },
    },
  },
  {
    type: 'controls_repeat_ext',
    inputs: {
      TIMES: restOfLine(),
      DO: {
        block: {
          type: 'controls_if',
          extraState: {hasElse: true},
          inputs: {
            IF0: compare(
              'LTE',
              sum('ADD', widthOf(linePrefix()), widthOf(linePrefixPlusOne())),
              sum('MULTIPLY', num(2), clickedAcross()),
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
  keepInView(),
];

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
    // What every key hat and the click do after moving the bar, said once.
    defineBlock({
      // THIS KIND'S OWN WORK, in nobody else's toolbox. A file that does not
      // know what a caret is can mean nothing by it.
      private: true,
      say: [KEEP_IN_VIEW],
      description:
        'Move the window over the words so the line the bar is on is ' +
        'showing, and so is the bar along it.',
      body: revealBody(),
    }),
    useTrait('Input#TakesKeyboardInputTrait'),
    useTrait('Mouse#CanBeClickedTrait'),
    // …and the wheel, now that there is something to scroll.
    useTrait('Mouse#CanBeScrolledTrait'),
    useTrait('Tab Navigation#CanBeFocusedTrait'),
    showAs('paragraph'),
    defineProperty('number', 'caret', '0'),
    // How far down the words the box is looking, in pixels. Kept in pixels
    // and not in lines for the reason the List keeps its in pixels: a drag is
    // a distance, and rounding one to whole lines makes a slow drag do
    // nothing and a fast one jump.
    defineProperty('number', 'scroll', '0'),
    // …and how far ACROSS them, which is the Text Input's `scroll` by another
    // name: a line longer than the box has to slide to keep the bar in view.
    // Called `slide` because `scroll` is taken by the other axis, and a
    // control with `scroll` and `scroll x` reads as though one of them were a
    // vector that is not.
    defineProperty('number', 'slide', '0'),
    defineEvent('changed'),
    {
      type: 'world_set_Boxed_WidthProperty',
      inputs: {
        ACTOR: me(),
        VALUE: {shadow: {type: 'math_number', fields: {NUM: WIDTH}}},
      },
    },
    {
      type: 'world_set_Boxed_HeightProperty',
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
      // The wheel, which reads the words without moving the bar — the one
      // way to look further down a paragraph than you are typing in.
      {
        type: 'world_on_Mouse_IsScrolledByEvent',
        inputs: {ACTOR: me()},
        next: {
          block: scrollTo(
            sum('ADD', scroll(), {block: {type: 'world_event_value'}}),
          ),
        },
      },
      // A click chooses this area, and puts the bar at the end.
      {
        type: 'world_on_Mouse_IsClickedWithEvent',
        fields: {FILTER0: ''},
        inputs: {ACTOR: me()},
        next: {block: chain([takeFocus(), ...placesTheCaret()])},
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
          keepInView(),
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
          // The caret has not moved, but the words below it have — a delete
          // that joins two lines makes the paragraph shorter, and a window
          // parked at the old bottom would be past the new one.
          keepInView(),
          emitChanged(),
        ]),
      ),
      key(
        'left arrow',
        onlyIf(both(focused(), compare('GT', caretAt(), num(0))), [
          setCaret(sum('MINUS', caretAt(), num(1))),
          keepInView(),
        ]),
      ),
      key(
        'right arrow',
        onlyIf(both(focused(), compare('LT', caretAt(), length())), [
          setCaret(sum('ADD', caretAt(), num(1))),
          keepInView(),
        ]),
      ),
      key('up arrow', lineAbove()),
      key('down arrow', lineBelow()),
    ],
    drawing: {
      width: width(),
      height: height(),
      commands: [
        fill(swatch(LOOK.field)),
        outline(swatch(LOOK.primaryStrong), BORDER),
        corner(RADIUS_TIGHT),
        useStyle('field'),
        rectangle(0, 0, width(), height()),
        noOutline(),
        // THE INK, AS A LITERAL, BEFORE THE CLASS. Every other row in this kit says
        // its own look and then offers to be overruled, and the caption was the one
        // that did not — it went straight to `use style ⟨caption⟩`, which leaves the
        // pen alone when no theme defines one. So in a project with NO theme the
        // caption inherited whatever the FACE had just set, and a Button drew its
        // words in the button colour: invisible (specs/STYLES_PLAN.md).
        fill(swatch(LOOK.ink)),
        useStyle('caption'),
        fill(textOf('TextColorProperty')),
        // From the corner, breaking on newlines only: a column of zero is
        // `draw paragraph`'s "do not wrap".
        //
        // LESS THE SCROLL, which is the whole of the scrolling: a drawing is
        // rasterised at the actor's own size, so what is laid above the top
        // or below the bottom is clipped by the texture and nothing else has
        // to be worked out (specs/DRAWING.md).
        drawParagraph(
          sum('MINUS', num(PAD), slid()),
          sum('MINUS', num(PAD), scroll()),
          0,
        ),
        // The bar, on the caret's line and after its prefix, blinking.
        onlyIf(blinking(), [
          rectangle(
            sum('MINUS', sum('ADD', num(PAD), caretAcross()), slid()),
            sum('MINUS', sum('ADD', num(PAD), lineTop(line())), scroll()),
            num(CARET_WIDTH),
            atSize(),
          ),
        ]),
      ],
    },
  },
);
