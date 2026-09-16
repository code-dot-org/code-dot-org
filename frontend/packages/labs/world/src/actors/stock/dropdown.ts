// "Dropdown" — a list of words, one of them chosen.
//
// The control whose answer is ONE OF SEVERAL. Closed, it is a Label showing
// the choice; open, it is that and a row per choice below it, and a click on
// a row makes that the choice (specs/UI_ACTORS.md, "The rest of the
// toolkit"). It acts like a Label so the chosen word IS its `text`, and a
// project reads a dropdown the way it reads any label: `text of ⟨any
// ⟨Dropdown⟩⟩`.
//
// THE CHOICES ARE A LIST OF WORDS, the Dropdown's own property, and the first
// list an actor keeps for itself. A list's default is always empty, so the
// file fills its own with three placeholders; a project replaces them with
// `set choices of ⟨…⟩ to make a list of ⟨…⟩`. The map editor cannot author a
// list yet, so a placement's choices are set in blocks rather than in the
// inspector.
//
// IT GROWS WHEN IT OPENS. The rows are drawn on the same canvas, so opening
// sets the height to hold them — and moves the actor down by half the growth,
// because a box grows about its centre and the closed face should stay where
// it was. Closing undoes both. Everything that asks how big the actor is
// (the click box, the map editor's outline) then agrees with what is drawn.
//
// DRAWING THE ROWS is what forced `item ⟨n⟩ of ⟨list⟩` into the language:
// a `count with` over the rows and the word at each place (`core/lists`). The
// same block answers a click, which is a row worked out from the pointer.
//
// A CLICK ANYWHERE ELSE CLOSES IT. The Mouse rule announces `presses mouse
// button` to everything that takes mouse input before it announces `is
// clicked with` to what is under the pointer, so a press outside the box
// closes an open menu and a press inside it is left for the click to answer.
//
// IT CAN BE REACHED WITHOUT A MOUSE: Enter opens it and chooses the
// highlighted row, and the arrows move the highlight while it is open.

import {labelHalf, labelSizeOf} from './label';
import {
  actorFile,
  actsLike,
  chain,
  defineEvent,
  defineProperty,
  fill,
  me,
  noFill,
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

const OWN = 'ActorsDropdown';

/** The closed face, which is also one row of the open menu. */
const ROW = 24;
const WIDTH = 120;
const PAD = 6;
const RING_INSET = 2;
const RING_WIDTH = 2;

/** The counter the rows are drawn and picked by. */
const ROW_VARIABLE = {id: 'dropdownRow', name: 'row', type: 'Number'};

const read = (own: string, exportName: string) => ({
  block: {type: `world_get_${own}_${exportName}`, inputs: {ACTOR: me()}},
});
const width = () => labelSizeOf('Width');
const height = () => labelSizeOf('Height');
const choices = () => read(OWN, 'ChoicesProperty');
const open = () => read(OWN, 'OpenProperty');
const highlighted = () => read(OWN, 'HighlightedProperty');
const focused = () => ({
  block: {
    type: 'world_get_TabNavigation_FocusedProperty',
    inputs: {ACTOR: me()},
  },
});
const row = () => ({
  block: {type: 'variables_get_Number', fields: {VAR: ROW_VARIABLE}},
});

const arithmetic = (
  op: 'ADD' | 'MINUS' | 'MULTIPLY' | 'DIVIDE',
  a: object,
  b: object,
) => ({
  block: {type: 'math_arithmetic', fields: {OP: op}, inputs: {A: a, B: b}},
});
const compare = (
  op: 'EQ' | 'LT' | 'LTE' | 'GT' | 'GTE',
  a: object,
  b: object,
) => ({block: {type: 'logic_compare', fields: {OP: op}, inputs: {A: a, B: b}}});
const both = (a: object, b: object) => ({
  block: {type: 'logic_operation', fields: {OP: 'AND'}, inputs: {A: a, B: b}},
});
const not = (a: object) => ({block: {type: 'logic_negate', inputs: {BOOL: a}}});
const floor = (of: object) => ({
  block: {type: 'math_round', fields: {OP: 'ROUNDDOWN'}, inputs: {NUM: of}},
});
const clamp = (value: object, low: object, high: object) => ({
  block: {type: 'math_constrain', inputs: {VALUE: value, LOW: low, HIGH: high}},
});

/** `how many in ⟨choices⟩`. */
const count = () => ({
  block: {type: 'lists_length', inputs: {VALUE: choices()}},
});
/** `item ⟨n⟩ of ⟨choices⟩`. */
const choice = (n: object) => ({
  block: {type: 'world_list_item', inputs: {N: n, LIST: choices()}},
});

/** The pointer, in the world's coordinates. */
const pointer = (axis: 'x' | 'y') => ({
  block: {
    type: 'world_vector_component',
    fields: {COMPONENT: axis},
    inputs: {VEC: {block: {type: 'world_mouse_position'}}},
  },
});
/** Where this actor is, which is its MIDDLE. */
const middle = (axis: 'x' | 'y') => ({
  block: {
    type: 'world_get_Space_PositionProperty',
    fields: {COMPONENT: axis},
    inputs: {ACTOR: me()},
  },
});

const set = (exportName: string, value: object, own = OWN) => ({
  type: `world_set_${own}_${exportName}`,
  inputs: {ACTOR: me(), VALUE: value},
});
const setBoolean = (exportName: string, to: boolean) =>
  set(exportName, {
    block: {type: 'logic_boolean', fields: {BOOL: to ? 'TRUE' : 'FALSE'}},
  });
const setHeight = (to: object) => set('HeightProperty', to, 'ActorsLabel');
/** `set position of this to x ⟨x⟩ y ⟨y⟩`. */
const moveTo = (x: object, y: object) => ({
  type: 'world_set_position',
  inputs: {ACTOR: me(), X: x, Y: y},
});

const either = (test: object, then: object[], otherwise?: object[]) => ({
  type: 'controls_if',
  ...(otherwise ? {extraState: {hasElse: true}} : {}),
  inputs: {
    IF0: test,
    DO0: {block: chain(then)},
    ...(otherwise ? {ELSE: {block: chain(otherwise)}} : {}),
  },
});

/** How much taller the open menu is than the closed face. */
const growth = () => arithmetic('MULTIPLY', count(), num(ROW));

/**
 * Open: hold every row, and shift down by half the growth so the closed face
 * stays where it was.
 */
const openUp = () => [
  setBoolean('OpenProperty', true),
  setHeight(arithmetic('ADD', num(ROW), growth())),
  moveTo(
    middle('x'),
    arithmetic('ADD', middle('y'), arithmetic('DIVIDE', growth(), num(2))),
  ),
];
/** Close: back to one row, shifted up by the same half. */
const closeUp = () => [
  setBoolean('OpenProperty', false),
  moveTo(
    middle('x'),
    arithmetic('MINUS', middle('y'), arithmetic('DIVIDE', growth(), num(2))),
  ),
  setHeight(num(ROW)),
];

/** The top edge of the box, wherever it is. */
const top = () => arithmetic('MINUS', middle('y'), labelHalf(height()));
/** Which row the pointer is on, counting from one below the face. */
const rowUnderPointer = () =>
  arithmetic(
    'ADD',
    floor(
      arithmetic(
        'DIVIDE',
        arithmetic('MINUS', pointer('y'), arithmetic('ADD', top(), num(ROW))),
        num(ROW),
      ),
    ),
    num(1),
  );

/** Take row `n` as the choice, if there is such a row, and say so. */
const choose = (n: () => object) =>
  either(both(compare('GTE', n(), num(1)), compare('LTE', n(), count())), [
    set('HighlightedProperty', n()),
    setText('TextProperty', choice(n())),
    {type: `world_emit_${OWN}_ChosenEvent`, inputs: {ACTOR: me()}},
  ]);

/** Whether the pointer is inside the box, whatever size it is. */
const pointerInside = () =>
  both(
    compare(
      'LTE',
      {
        block: {
          type: 'math_single',
          fields: {OP: 'ABS'},
          inputs: {NUM: arithmetic('MINUS', pointer('x'), middle('x'))},
        },
      },
      labelHalf(width()),
    ),
    compare(
      'LTE',
      {
        block: {
          type: 'math_single',
          fields: {OP: 'ABS'},
          inputs: {NUM: arithmetic('MINUS', pointer('y'), middle('y'))},
        },
      },
      labelHalf(height()),
    ),
  );

const circleArrow = () => [
  // A caret: two strokes meeting at the bottom, in the outline colour.
  noFill(),
  outline(swatch('#8890b0'), 2),
  {
    type: 'world_draw_line',
    inputs: {
      X1: arithmetic('MINUS', width(), num(16)),
      Y1: num(ROW / 2 - 3),
      X2: arithmetic('MINUS', width(), num(10)),
      Y2: num(ROW / 2 + 3),
    },
  },
  {
    type: 'world_draw_line',
    inputs: {
      X1: arithmetic('MINUS', width(), num(10)),
      Y1: num(ROW / 2 + 3),
      X2: arithmetic('MINUS', width(), num(4)),
      Y2: num(ROW / 2 - 3),
    },
  },
  noOutline(),
];

/** `draw text ⟨words⟩ at x ⟨x⟩ y ⟨y⟩ size ⟨text size⟩ anchored ⟨left⟩`. */
const drawWords = (text: object, y: object) => ({
  type: 'world_draw_text',
  inputs: {
    TEXT: text,
    X: num(PAD),
    Y: y,
    SIZE: textOf('TextSizeProperty'),
    ANCHOR: {block: {type: 'text', fields: {TEXT: 'left'}}},
  },
});

/** The y of the middle of row `n`, counting from one below the face. */
const rowMiddle = (n: object) =>
  arithmetic(
    'ADD',
    num(ROW + ROW / 2),
    arithmetic('MULTIPLY', arithmetic('MINUS', n, num(1)), num(ROW)),
  );

export const dropdownActor = actorFile(
  'Dropdown',
  [
    // FIRST, so everything below overrides it: the size, the anchor, the
    // choices and the face this paints.
    actsLike('actors/label'),
    defineProperty('words', 'choices', ''),
    defineProperty('boolean', 'open', 'false'),
    defineProperty('number', 'highlighted', '1'),
    defineEvent('chosen'),
    // A click on it, and every press anywhere, so it can close.
    useTrait('Mouse#CanBeClickedTrait'),
    useTrait('Mouse#TakesMouseInputTrait'),
    useTrait('Tab Navigation#CanBeFocusedTrait'),
    useTrait('Input#TakesKeyboardInputTrait'),
    showAs('dropdown'),
    set('WidthProperty', num(WIDTH), 'ActorsLabel'),
    setHeight(num(ROW)),
    setText('TextAnchorProperty', words('left')),
    // Three placeholders, so a Dropdown dragged onto a map has something
    // to open; a project replaces them.
    set('ChoicesProperty', {
      block: {
        type: 'lists_create_with',
        extraState: {itemCount: 3},
        inputs: {
          ADD0: {block: {type: 'text', fields: {TEXT: 'ONE'}}},
          ADD1: {block: {type: 'text', fields: {TEXT: 'TWO'}}},
          ADD2: {block: {type: 'text', fields: {TEXT: 'THREE'}}},
        },
      },
    }),
    setText('TextProperty', words('ONE')),
  ],
  {
    variables: [ROW_VARIABLE],
    handlers: [
      // A click: on a row, that is the choice and the menu closes; on the
      // face, it opens or closes. The keyboard comes here either way.
      {
        type: 'world_on_Mouse_IsClickedWithEvent',
        fields: {FILTER0: ''},
        inputs: {ACTOR: me()},
        next: {
          block: chain([
            {
              type: 'world_do_TabNavigation_TakeTheFocusAction',
              inputs: {ACTOR: me()},
            },
            either(open(), [choose(rowUnderPointer), ...closeUp()], openUp()),
          ]),
        },
      },
      // A press anywhere else closes an open menu. The Mouse rule announces
      // this before the click, to everything that takes mouse input.
      {
        type: 'world_on_Mouse_PressesMouseButtonEvent',
        fields: {FILTER0: ''},
        inputs: {ACTOR: me()},
        next: {
          block: either(both(open(), not(pointerInside())), closeUp()),
        },
      },
      // Enter: open, or choose the highlighted row and close.
      {
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: 'enter'},
        inputs: {ACTOR: me()},
        next: {
          block: either(focused(), [
            either(open(), [choose(highlighted), ...closeUp()], openUp()),
          ]),
        },
      },
      // The arrows move the highlight while it is open.
      ...(['up arrow', 'down arrow'] as const).map(key => ({
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: key},
        inputs: {ACTOR: me()},
        next: {
          block: either(both(focused(), open()), [
            set(
              'HighlightedProperty',
              clamp(
                arithmetic(
                  'ADD',
                  highlighted(),
                  num(key === 'up arrow' ? -1 : 1),
                ),
                num(1),
                count(),
              ),
            ),
          ]),
        },
      })),
    ],
    drawing: {
      width: width(),
      height: height(),
      commands: [
        // The face: a box, the chosen word, and a caret.
        fill(swatch('#202840')),
        outline(swatch('#8890b0'), 2),
        rectangle(0, 0, width(), ROW),
        noOutline(),
        fill(textOf('TextColorProperty')),
        drawWords(textOf('TextProperty'), num(ROW / 2)),
        ...circleArrow(),
        // …and the rows, when it is open: a darker sheet, the highlighted
        // row lit, and one word per row.
        either(open(), [
          fill(swatch('#303a58')),
          rectangle(0, ROW, width(), arithmetic('MINUS', height(), num(ROW))),
          {
            type: 'world_count_with',
            fields: {VAR: ROW_VARIABLE},
            inputs: {
              FROM: num(1),
              TO: count(),
              BY: num(1),
              DO: {
                block: chain([
                  either(compare('EQ', row(), highlighted()), [
                    fill(swatch('#4050a0')),
                    rectangle(
                      num(0),
                      arithmetic('MINUS', rowMiddle(row()), num(ROW / 2)),
                      width(),
                      ROW,
                    ),
                  ]),
                  fill(textOf('TextColorProperty')),
                  drawWords(choice(row()), rowMiddle(row())),
                ]),
              },
            },
          },
        ]),
        // …and the ring, when the keyboard is on this one.
        either(focused(), [
          noFill(),
          outline(swatch('#ffd45e'), RING_WIDTH),
          rectangle(
            num(RING_INSET),
            num(RING_INSET),
            arithmetic('MINUS', width(), num(RING_INSET * 2)),
            arithmetic('MINUS', height(), num(RING_INSET * 2)),
          ),
        ]),
      ],
    },
  },
);
