// The on-screen keyboard: a Panel holding five rows of Buttons, each of which
// types one thing.
//
// A phone has no keyboard until something draws one, and what it draws is a
// LAYOUT — which is what a map is, so there is no `Keyboard` actor here and
// nothing new on the shelf (specs/KEYBOARD_PLAN.md). The Button already knows
// it was clicked and the Panel already holds its children and comes and goes
// as one thing.
//
// EVERY KEY TYPES; NONE OF THEM NAMES A FIELD. The script on `a` is
// `when this actor is clicked: type ⟨a⟩`, which raises the same event the
// player's real keyboard raises — so a Text Input, a Text Area and a project's
// own `types ⟨character⟩` handler all hear it with no change, and a form with
// three fields needs no wiring, because whichever one has the focus is the one
// already listening. A keyboard that reached into a named field would work for
// that field and nothing else.
//
// BACKSPACE AND ENTER PRESS A KEY INSTEAD, because neither makes a character.
// A field handles both as `presses ⟨key⟩` (`actors/textInput`), and
// `press the ⟨…⟩ key` puts one frame of that key in front of the handler.
//
// AND NO KEY TAKES THE FOCUS. A Button takes the focus when it is clicked,
// which is right for every button in a menu and exactly wrong here: the field
// would lose the keyboard on the first keystroke and the rest of the word
// would go nowhere. So every key turns `takes the keyboard` off — the switch
// the Tab Navigation rule grew for this, which also keeps the keys out of the
// tab route, where they have no business: a keyboard user has a keyboard
// (`rules/tabNavigation`).
//
// AT THE BOTTOM OF THE WINDOW, holding on to the bottom edge, so a taller
// window puts it where a keyboard goes (specs/ANCHORS_PLAN.md). Whether it is
// on screen at all is the project's — `load map ⟨maps/keyboard⟩` when a field
// takes the focus. The field does not summon it, because a field that summoned
// a keyboard would summon one on a desktop too.

import {chain, me, words} from '../../actors/stock/workspace';
import {TILE_SIZE, VIEWPORT_TILES} from '../../runtime/viewport';

/** How far apart the keys sit, and how big the face inside that is. */
const PITCH = 32;
const KEY_WIDTH = 30;
const KEY_HEIGHT = 28;
/** Room above the first row and below the last. */
const PADDING = 6;

const VIEW = VIEWPORT_TILES * TILE_SIZE;

interface Key {
  /** What the face says. */
  cap: string;
  /** The character it types, or nothing when it presses a key instead. */
  types?: string;
  /** The key it presses, for the ones that type nothing. */
  presses?: string;
  /** In whole key widths — space is several of them. */
  span?: number;
  /**
   * What the placement is called, when the cap will not do.
   *
   * Ids have to be unique within a map and readable in the map editor's list;
   * a letter names itself, and the wide keys and the stop say what they are.
   */
  name?: string;
}

const letter = (cap: string): Key => ({cap, types: cap});

const row = (caps: string): Key[] => [...caps].map(letter);

/**
 * ONE ALPHABET, ONE SCREEN. No shift, no layout switch, no accents: a shift
 * key is a MODE, and a mode is state this map would have to carry and redraw —
 * every cap changes with it. This is a map a project edits, so a project that
 * wants another row adds one.
 */
const ROWS: Key[][] = [
  row('1234567890'),
  row('qwertyuiop'),
  row('asdfghjkl'),
  [
    ...row('zxcvbnm'),
    {cap: '⌫', presses: 'backspace', name: 'backspace', span: 2},
  ],
  [
    {cap: '.', types: '.', name: 'dot'},
    {cap: 'space', types: ' ', name: 'space', span: 6},
    {cap: 'enter', presses: 'enter', name: 'enter', span: 3},
  ],
];

const PANEL_HEIGHT = ROWS.length * PITCH + PADDING * 2;
/** The middle of the bottom row of tiles, which is where the panel sits. */
const PANEL_MIDDLE = VIEW - PANEL_HEIGHT / 2;

/** `when this actor is clicked with ⟨any⟩` — the Mouse rule's own hat. */
const whenClicked = () => ({
  type: 'world_on_Mouse_IsClickedWithEvent',
  fields: {FILTER0: ''},
  inputs: {ACTOR: me()},
});

/** What one key does: type a character, or press a key that types none. */
const action = (key: Key) =>
  key.presses
    ? {type: 'world_press_key', fields: {KEY: key.presses}}
    : {type: 'world_type', inputs: {TEXT: words(key.types ?? '')}};

const script = (key: Key) => ({
  blocks: {
    blocks: {
      blocks: [
        {...whenClicked(), x: 20, y: 20, next: {block: chain([action(key)])}},
      ],
    },
  },
});

/**
 * Where each key sits in the panel's frame, measured from its middle.
 *
 * A ROW IS CENTERED ON THE PANEL, so a row of nine and a row of ten both look
 * deliberate. Spans are counted in key widths, and a key's middle is half its
 * own span past where the row has got to.
 */
const placements = () => {
  const out: Array<{key: Key; at: {x: number; y: number}; id: string}> = [];
  ROWS.forEach((keys, line) => {
    const spans = keys.reduce((total, key) => total + (key.span ?? 1), 0);
    let x = -(spans * PITCH) / 2;
    const y = PADDING + line * PITCH + PITCH / 2 - PANEL_HEIGHT / 2;
    for (const key of keys) {
      const span = key.span ?? 1;
      const at = {x: x + (span * PITCH) / 2, y};
      out.push({key, at, id: `Key ${key.name ?? key.cap.toUpperCase()}`});
      x += span * PITCH;
    }
  });
  return out;
};

export const keyboardMap = JSON.stringify(
  {
    type: 'map',
    size: {width: VIEWPORT_TILES, height: VIEWPORT_TILES},
    tile: {width: TILE_SIZE, height: TILE_SIZE},
    actors: [
      {
        type: 'actors/panel',
        id: 'Keyboard',
        anchor: 'bottom',
        properties: {
          positional: {position: {x: VIEW / 2, y: PANEL_MIDDLE}},
          // No words of its own; the keys have them all.
          Label: {text: '', width: VIEW, height: PANEL_HEIGHT},
        },
      },
      ...placements().map(({key, at, id}) => ({
        type: 'actors/button',
        id,
        properties: {
          positional: {parent: 'Keyboard', position: at},
          // See the header: a key is pointed at, never focused.
          Can_Be_Focused: {takes_the_keyboard: false},
          Label: {
            text: key.cap,
            width: (key.span ?? 1) * PITCH - (PITCH - KEY_WIDTH),
            height: KEY_HEIGHT,
          },
        },
        ...script(key),
      })),
    ],
  },
  null,
  2,
);
