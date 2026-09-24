// "List" — a box of words you scroll, and choose one of.
//
// The Dropdown with the three things that make it a list rather than a menu:
// it is always open, it is as tall as it SAYS rather than as tall as its
// contents, and it scrolls (specs/LIST_PLAN.md).
//
// WHY IT DRAWS ITS OWN ROWS rather than holding children. A clip in this
// engine comes from a camera or from an actor's own canvas, and nothing else:
// a mask is a filter and does nothing in WebGL (`PhaserBinding`). Children are
// separate actors with canvases of their own, so a Panel whose children slide
// under a window would draw them over everything around it. A drawing is
// exactly the actor's size, so a list that draws its rows is clipped for free.
//
// THE SCROLL IS IN PIXELS, not in rows. A drag is a distance, and rounding it
// to whole rows makes a slow drag do nothing and a fast one jump; which row is
// under a point is arithmetic, as the Dropdown's already is.
//
// ONLY THE ROWS THAT SHOW ARE DRAWN. The loop runs over the window rather than
// over the list, so a thousand words cost the same as six. That is also why
// the scroll is clamped rather than the rows: there is nothing to draw past
// either end.
//
// A ROW CAN BE TAKEN OUT, when a project says so. Swiping a row sideways
// removes it — the phone idiom, and the first use of the swipe event — and so
// does Delete on the highlighted row. Off by default, because a list of
// answers to choose between is not one a player should be able to empty.
//
// IT CAN BE DRIVEN WITHOUT A POINTER. Tab reaches it, the arrows move the
// highlight and drag the window along with it, Page Up and Page Down move by a
// windowful, Enter chooses and Delete removes. The ring is drawn INSIDE the
// face, because outside is clipped away.

import {labelHalf, labelSizeOf} from './label';
import {BORDER, LOOK, RADIUS, RING_INSET, RING_WIDTH, ringRadius} from './look';
import {
  actorFile,
  actsLike,
  alongY,
  type BlockParam,
  chain,
  corner,
  defineBlock,
  defineEvent,
  defineProperty,
  fill,
  me,
  noFill,
  noOutline,
  num,
  outline,
  paramValue,
  rectangle,
  setText,
  showAs,
  swatch,
  textOf,
  useStyle,
  useTrait,
  words,
} from './workspace';

const OWN = 'ActorsList';

/** One row, and a window six of them tall. */
const ROW = 24;
const WIDTH = 160;
const ROWS = 6;
const HEIGHT = ROW * ROWS;
const PAD = 6;

/** The counter the rows are drawn by. */
const ROW_VARIABLE = {id: 'listRow', name: 'row', type: 'Number'};

/**
 * What `is chosen` carries, and what `is dragged by` hands over.
 *
 * A carried value is read by NAME on the workspace that hears it, so the
 * variable has to exist here even though the event was declared elsewhere
 * (specs/EVENT_VALUES_PLAN.md). `movement` is the Gestures rule's; `word` and
 * `place` are this file's own.
 */
const MOVEMENT: BlockParam = {
  id: 'listMovement',
  name: 'movement',
  type: 'vector',
  binds: 'Vector',
};
/** What `is scrolled by` hands over: pixels, positive downward. */
const BY: BlockParam = {
  id: 'listBy',
  name: 'by',
  type: 'number',
  binds: 'Number',
};
const WORD: BlockParam = {
  id: 'listWord',
  name: 'word',
  type: 'string',
  binds: 'String',
};
const PLACE: BlockParam = {
  id: 'listPlace',
  name: 'place',
  type: 'number',
  binds: 'Number',
};

/**
 * A parameter as the WORKSPACE's variable list wants it.
 *
 * The two `type`s differ and the difference is silent: a part's type is the
 * language's (`vector`), and a variable's is Blockly's own flavour tag
 * (`Vector`). Declared with the wrong one, the getter finds no variable of
 * its flavour and invents a fresh one — the handler then read `vec`, a name
 * nothing had ever written, and scrolled by `undefined`.
 */
const asVariable = (param: BlockParam) => ({
  id: param.id,
  name: param.name,
  type: param.binds,
});

const read = (own: string, exportName: string) => ({
  block: {type: `world_get_${own}_${exportName}`, inputs: {ACTOR: me()}},
});
const width = () => labelSizeOf('Width');
const height = () => labelSizeOf('Height');
const items = () => read(OWN, 'ItemsProperty');
const canRemove = () => read(OWN, 'CanRemoveProperty');
const scroll = () => read(OWN, 'ScrollProperty');
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
const floor = (of: object) => ({
  block: {type: 'math_round', fields: {OP: 'ROUNDDOWN'}, inputs: {NUM: of}},
});
const clamp = (value: object, low: object, high: object) => ({
  block: {type: 'math_constrain', inputs: {VALUE: value, LOW: low, HIGH: high}},
});

/** `how many in ⟨items⟩`. */
const count = () => ({
  block: {type: 'lists_length', inputs: {VALUE: items()}},
});
/** `item ⟨n⟩ of ⟨items⟩`. */
const item = (n: object) => ({
  block: {type: 'world_list_item', inputs: {N: n, LIST: items()}},
});

const set = (exportName: string, value: object, own = OWN) => ({
  type: `world_set_${own}_${exportName}`,
  inputs: {ACTOR: me(), VALUE: value},
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

/** How far down the last row reaches, past the window's bottom. */
const overflow = () =>
  arithmetic('MINUS', arithmetic('MULTIPLY', count(), num(ROW)), height());
/**
 * Put the window here, kept between the top and the bottom of the list.
 *
 * The `if` is not decoration: a list SHORTER than its box overflows by a
 * negative amount, and a clamp whose bottom is above its top answers with the
 * bottom — which would park the window below the only rows there are.
 */
const scrollTo = (to: object) =>
  either(
    compare('GT', overflow(), num(0)),
    [set('ScrollProperty', clamp(to, num(0), overflow()))],
    [set('ScrollProperty', num(0))],
  );

/** Which row the pointer is on, counting from one. */
const rowUnderPointer = () =>
  arithmetic(
    'ADD',
    floor(
      arithmetic(
        'DIVIDE',
        // …measured from the TOP of the box, which is half its height up its
        // own axis from the middle, and then down by however far it has been
        // scrolled.
        arithmetic(
          'ADD',
          arithmetic('ADD', alongY(), labelHalf(height())),
          scroll(),
        ),
        num(ROW),
      ),
    ),
    num(1),
  );

/** The top of row `n`, in the list's own coordinates. */
const rowTop = (n: object) =>
  arithmetic('MULTIPLY', arithmetic('MINUS', n, num(1)), num(ROW));

/**
 * Bring row `n` into the window, moving as little as possible.
 *
 * One clamp rather than two tests: above the window and the window comes up
 * to it, below and the window goes down to its bottom, inside and nothing
 * moves. The low is never above the high while the box holds a whole row.
 */
const reveal = (n: () => object) =>
  scrollTo(
    clamp(
      scroll(),
      arithmetic('MINUS', arithmetic('ADD', rowTop(n()), num(ROW)), height()),
      rowTop(n()),
    ),
  );

/**
 * `choose row ⟨n⟩` — row `n` taken as the choice, if there is such a row.
 *
 * A BLOCK OF ITS OWN, and the row is its PARAMETER, for the reason `take out
 * row` is one: the body names the row THREE times — to check it is in range, to
 * set the highlight, and to say which word was chosen — so a call site that
 * passed an expression expanded that expression three times. One of the two
 * sites passes `which row is the pointer over`, which is forty blocks of
 * arithmetic about the box's height and how far it has scrolled, and the click
 * handler carried it in triplicate: a hundred and seventy-nine blocks for an
 * event that does two things.
 *
 * As a parameter it is worked out once where the call is made and read as a
 * name inside. The click says `choose row ⟨which row is the pointer over⟩` and
 * Enter says `choose row ⟨highlighted⟩`, which is also what each of them means.
 *
 * PRIVATE: what a list does with a row of its own is nobody else's block
 * (`extensions/blockVisibility`).
 */
const CHOSEN: BlockParam = {
  id: 'listChosen',
  name: 'row',
  type: 'number',
  binds: 'Number',
};

/** `⟨row⟩` — which row `choose row` was called about. */
const chosen = () => paramValue(CHOSEN);

/** `choose row ⟨n⟩` — the call, which is what the two sites say. */
const chooseRow = (n: object) => ({
  type: `world_do_${OWN}_ChooseRowAction`,
  inputs: {VALUE: n, ACTOR: me()},
});

const chooseBody = () =>
  either(
    both(compare('GTE', chosen(), num(1)), compare('LTE', chosen(), count())),
    [
      set('HighlightedProperty', chosen()),
      {
        // NAMED BY ITS LABELS JOINED, which is "is chosen at" and not "is
        // chosen": a carried value is not part of the name (`designedName`).
        type: `world_emit_${OWN}_IsChosenAtEvent`,
        inputs: {ACTOR: me(), WORD: item(chosen()), PLACE: chosen()},
      },
    ],
  );

/**
 * `take out row ⟨n⟩` — a row removed, if a project allows it and it exists.
 *
 * The word is read BEFORE the row goes, which is the whole of why the emit
 * comes first: `item ⟨n⟩ of` after the removal answers with whatever moved up
 * into its place.
 *
 * A BLOCK OF ITS OWN, and the row is its PARAMETER, which is the point. Three
 * sites take a row out — a swipe either way, and Delete — and each wrote the
 * body out in full; worse, the body names the row five times, so each swipe
 * expanded `which row is the pointer over` five times over. As a parameter it
 * is worked out once at the call site and read as a name inside, and the file
 * says `take out row ⟨…⟩` where it used to carry two hundred blocks.
 *
 * PRIVATE: a file that does not hold a list can mean nothing by it
 * (`extensions/blockVisibility`).
 */
const TAKEN: BlockParam = {
  id: 'listTaken',
  name: 'row',
  type: 'number',
  binds: 'Number',
};

/** `⟨row⟩` — which row `take out row` was called about. */
const taken = () => paramValue(TAKEN);

/** `take out row ⟨n⟩` — the call, which is what the three sites say. */
const takeOutRow = (n: object) => ({
  type: `world_do_${OWN}_TakeOutRowAction`,
  inputs: {VALUE: n, ACTOR: me()},
});

const removeBody = () =>
  either(
    both(
      canRemove(),
      both(compare('GTE', taken(), num(1)), compare('LTE', taken(), count())),
    ),
    [
      {
        type: `world_emit_${OWN}_LosesAtEvent`,
        inputs: {ACTOR: me(), WORD: item(taken()), PLACE: taken()},
      },
      {
        type: `world_cut_${OWN}_ItemsProperty`,
        inputs: {ACTOR: me(), PLACE: taken()},
      },
      // The highlight cannot point past the end, and the window cannot sit
      // below a list that just got shorter.
      // `count` is read after the cut, so this is the list as it now is. An
      // emptied list leaves the highlight on nothing, which every use of it
      // already guards against.
      set('HighlightedProperty', clamp(highlighted(), num(1), count())),
      scrollTo(scroll()),
    ],
  );

const MOVED_BY: BlockParam = {
  id: 'listMovedBy',
  name: 'rows',
  type: 'number',
  binds: 'Number',
};

/** `⟨rows⟩` — how far `move the highlight by` was asked to move. */
const movedBy = () => paramValue(MOVED_BY);

/** `move the highlight by ⟨n⟩` — the call, which is what the eight hats say. */
const moveHighlight = (by: object) => ({
  type: `world_do_${OWN}_MoveTheHighlightByAction`,
  inputs: {VALUE: by, ACTOR: me()},
});

/**
 * `move the highlight by ⟨rows⟩` — and bring it into view.
 *
 * A BLOCK OF ITS OWN BECAUSE IT IS SAID EIGHT TIMES, and for a reason a reader
 * should not have to see: four keys — the two arrows and the two page keys —
 * each need a hat on the PRESS and another on the REPEAT, because a key held
 * raises `presses` exactly once (`World.repeatingKeys`). One body, two hats,
 * four times over, and the body carries the clamp and the reveal.
 *
 * The distance is the parameter, which is what makes the eight call sites one
 * line each: a row for the arrows, a windowful for the page keys.
 *
 * PRIVATE: a file with no list in it can mean nothing by it
 * (`extensions/blockVisibility`).
 */
const moveBody = () => [
  set(
    'HighlightedProperty',
    clamp(arithmetic('ADD', highlighted(), movedBy()), num(1), count()),
  ),
  reveal(highlighted),
];

/** The first row the window shows, counting from one. */
const firstShown = () =>
  arithmetic('ADD', floor(arithmetic('DIVIDE', scroll(), num(ROW))), num(1));
/**
 * How many rows this box is tall enough to show.
 *
 * FROM THE BOX, not from `ROWS`, which is only what the DEFAULT box holds.
 * Every other measurement here already reads `height()` — the scroll limit,
 * the reveal, the border — and the window alone was written as though every
 * List were the size the first one was. A List given a taller box scrolled
 * through all of its rows and drew six of them: Notes' list is 320 tall,
 * showed SEVEN, and looked as though it had stopped accepting new notes,
 * with the empty band below the last row reading as room to spare.
 */
const rowsShown = () => floor(arithmetic('DIVIDE', height(), num(ROW)));

/**
 * …and the last, never past the end of the list.
 *
 * One row further than fits, because a window scrolled half a row deep shows
 * part of one more. Clamped rather than `min`-ed: the first row shown is
 * never below one, so the bottom of the clamp does nothing and the top is the
 * end of the list.
 */
const lastShown = () =>
  clamp(arithmetic('ADD', firstShown(), rowsShown()), num(1), count());

/** The y of the middle of row `n`, once the window has moved. */
const rowMiddle = (n: object) =>
  arithmetic('ADD', arithmetic('MINUS', rowTop(n), scroll()), num(ROW / 2));

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

export const listActor = actorFile(
  'List',
  [
    // FIRST, so everything below overrides it: the size, the anchor and the
    // colours this paints with.
    actsLike('actors/label'),
    defineProperty('words', 'items'),
    // What a swipe and Delete both do, said once. Its row is a PARAMETER, so
    // `which row is the pointer over` is worked out at the call site instead
    // of five times inside the body.
    defineBlock({
      private: true,
      say: ['move the highlight by', MOVED_BY],
      description:
        'Move which row is highlighted, keeping it inside the list and ' +
        'bringing the window to it.',
      body: moveBody(),
    }),
    defineBlock({
      private: true,
      say: ['take out row', TAKEN],
      description:
        'Take a row out of this list, if the project allows it and there is ' +
        'such a row — saying which word went, before it goes.',
      body: [removeBody()],
    }),
    defineBlock({
      private: true,
      say: ['choose row', CHOSEN],
      description:
        'Take a row as the choice, if there is such a row — highlighting it ' +
        'and saying which word was chosen.',
      body: [chooseBody()],
    }),
    defineProperty('number', 'scroll', '0'),
    defineProperty('number', 'highlighted', '1'),
    // Whether a row may be taken out. FALSE unless a project says otherwise:
    // a list of answers is not one a player should be able to empty.
    defineProperty('boolean', 'can remove', 'false'),
    defineEvent('is chosen', WORD, 'at', PLACE),
    defineEvent('loses', WORD, 'at', PLACE),
    useTrait('Mouse#CanBeClickedTrait'),
    // …and the WHEEL, which is a trait of its own: a thing you scroll is not a
    // thing you click, and a Button electing this would swallow the page's
    // scroll to no purpose (specs/UI_ACTORS.md).
    useTrait('Mouse#CanBeScrolledTrait'),
    // …and the drag that scrolls it, which is the whole reason this actor
    // could not exist before (specs/GESTURES_PLAN.md).
    useTrait('Gestures#TakesGesturesTrait'),
    useTrait('Tab Navigation#CanBeFocusedTrait'),
    useTrait('Input#TakesKeyboardInputTrait'),
    showAs('list'),
    set('WidthProperty', num(WIDTH), 'Boxed'),
    set('HeightProperty', num(HEIGHT), 'Boxed'),
    setText('TextAnchorProperty', words('left')),
    // Placeholders, so a List dragged onto a map has something to show; a
    // project replaces them.
    set('ItemsProperty', {
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
  ],
  {
    variables: [
      ROW_VARIABLE,
      asVariable(MOVEMENT),
      asVariable(BY),
      asVariable(TAKEN),
      asVariable(CHOSEN),
      asVariable(MOVED_BY),
      asVariable(WORD),
      asVariable(PLACE),
    ],
    handlers: [
      // A click chooses the row it landed on, and brings the keyboard here.
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
            chooseRow(rowUnderPointer()),
          ]),
        },
      },
      // A drag moves the window the other way, which is what makes the
      // content feel stuck to the finger.
      // The wheel, which is the drag said another way: both are a distance in
      // pixels, and `scrollTo` clamps either to the ends of the list. The sign
      // differs because they are opposite idioms — a drag carries the content
      // with the finger, a wheel pushes it away.
      {
        type: 'world_on_Mouse_IsScrolledByEvent',
        inputs: {ACTOR: me()},
        next: {
          block: scrollTo(arithmetic('ADD', scroll(), paramValue(BY))),
        },
      },
      {
        type: 'world_on_Gestures_IsDraggedByEvent',
        inputs: {ACTOR: me()},
        next: {
          block: chain([
            scrollTo(
              arithmetic('MINUS', scroll(), {
                block: {
                  type: 'world_vector_component',
                  fields: {COMPONENT: 'y'},
                  inputs: {VEC: paramValue(MOVEMENT)},
                },
              }),
            ),
          ]),
        },
      },
      // A swipe takes the row it began on out — the phone idiom, and the
      // first thing in the lab to use the swipe event. Either way sideways:
      // which way a row is flicked is not a second meaning.
      ...(['left', 'right'] as const).map(way => ({
        type: 'world_on_Gestures_IsSwipedEvent',
        fields: {FILTER0: way},
        inputs: {ACTOR: me()},
        next: {block: takeOutRow(rowUnderPointer())},
      })),
      // …and Delete does it from the keyboard, on the highlighted row.
      {
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: 'delete'},
        inputs: {ACTOR: me()},
        next: {block: either(focused(), [takeOutRow(highlighted())])},
      },
      // Enter chooses whatever the highlight is on.
      {
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: 'enter'},
        inputs: {ACTOR: me()},
        next: {block: either(focused(), [chooseRow(highlighted())])},
      },
      // The arrows move it by one, the page keys by a windowful — the only
      // thing that makes a long list bearable without a pointer.
      //
      // TWICE OVER, on the press AND on the repeat. Holding an arrow should
      // walk the list the way holding it walks a text caret, and a key held
      // raises `presses` exactly once — so a hat on the press alone moves one
      // row however long the key is down (specs/UI_ACTORS.md).
      ...(
        [
          ['up arrow', () => num(-1)],
          ['down arrow', () => num(1)],
          // A WINDOWFUL, which is what the box holds rather than what the
          // default box holds — the same correction as `rowsShown` above.
          ['page up', () => arithmetic('MULTIPLY', rowsShown(), num(-1))],
          ['page down', () => rowsShown()],
        ] as const
      ).flatMap(([key, by]) =>
        ['world_on_Input_PressesEvent', 'world_on_Input_RepeatsEvent'].map(
          hat => ({
            type: hat,
            fields: {FILTER0: key},
            inputs: {ACTOR: me()},
            next: {block: either(focused(), [moveHighlight(by())])},
          }),
        ),
      ),
    ],
    drawing: {
      width: width(),
      height: height(),
      commands: [
        // The box.
        fill(swatch(LOOK.primary)),
        outline(swatch(LOOK.primaryStrong), BORDER),
        corner(RADIUS),
        useStyle('surface'),
        rectangle(0, 0, width(), height()),
        noOutline(),
        // …and the rows that show, which is a window over the list rather
        // than the whole of it.
        {
          type: 'world_count_with',
          fields: {VAR: ROW_VARIABLE},
          inputs: {
            FROM: firstShown(),
            TO: lastShown(),
            BY: num(1),
            DO: {
              block: chain([
                either(compare('EQ', row(), highlighted()), [
                  fill(swatch(LOOK.accentLight)),
                  useStyle('chosen'),
                  rectangle(
                    num(0),
                    arithmetic('MINUS', rowMiddle(row()), num(ROW / 2)),
                    width(),
                    ROW,
                  ),
                ]),
                // THE INK, AS A LITERAL, BEFORE THE CLASS. Every other row in this kit says
                // its own look and then offers to be overruled, and the caption was the one
                // that did not — it went straight to `use style ⟨caption⟩`, which leaves the
                // pen alone when no theme defines one. So in a project with NO theme the
                // caption inherited whatever the FACE had just set, and a Button drew its
                // words in the button colour: invisible (specs/STYLES_PLAN.md).
                fill(swatch(LOOK.ink)),
                useStyle('caption'),
                fill(textOf('TextColorProperty')),
                drawWords(item(row()), rowMiddle(row())),
              ]),
            },
          },
        },
        // …and the ring, when the keyboard is on this one.
        either(focused(), [
          noFill(),
          outline(swatch(LOOK.focus), RING_WIDTH),
          corner(ringRadius(RADIUS)),
          useStyle('ring'),
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
