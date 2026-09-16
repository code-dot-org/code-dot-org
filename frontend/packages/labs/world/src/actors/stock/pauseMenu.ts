// "Pause Menu" — a Panel that says PAUSED and carries a way back.
//
// The first stock interface MAP's own actor (specs/UI_ACTORS.md, "The second
// axis"). A pause menu is three or four controls arranged on a panel, and
// what makes them one thing is that the panel is their parent
// (specs/PARENTING.md): load the map and the menu appears, remove the panel
// and the menu goes, buttons and all.
//
// IT IS A PANEL WITH TWO EVENTS. `resumed` and `quit` are what a pause menu
// is FOR, and they are the menu's own so that a project answers the menu and
// not its buttons: `when ⟨any Pause Menu⟩ resumed` is one hat about one
// kind, where `when ⟨any Button⟩ is clicked` would fire for every button in
// the game. The buttons that raise them are kinds of their own
// (`menuButtons`), each a Button whose one row of behavior is to tell its
// parent.
//
// IT DOES NOT PAUSE ANYTHING ITSELF. Pausing is the world's, in one block
// (`pause the game`), and which key opens the menu and what "quit" does are
// the project's — a breakout restarts, an adventure goes to its title. The
// menu says what happened; the world decides what it means.

import {labelHalf, labelSizeOf} from './label';
import {
  actorFile,
  actsLike,
  defineEvent,
  drawParagraph,
  fill,
  me,
  noOutline,
  outline,
  rectangle,
  setText,
  showAs,
  swatch,
  textOf,
  words,
} from './workspace';

const WIDTH = 200;
const HEIGHT = 120;
/** Where the title sits: near the top, so the buttons have the rest. */
const TITLE_Y = 20;

const width = () => labelSizeOf('Width');
const height = () => labelSizeOf('Height');

const sized = (name: 'Width' | 'Height', value: number) => ({
  type: `world_set_ActorsLabel_${name}Property`,
  inputs: {
    ACTOR: me(),
    VALUE: {shadow: {type: 'math_number', fields: {NUM: value}}},
  },
});

export const pauseMenuActor = actorFile(
  'Pause Menu',
  [
    actsLike('actors/panel'),
    defineEvent('resumed'),
    defineEvent('quit'),
    showAs('pause'),
    sized('Width', WIDTH),
    sized('Height', HEIGHT),
    // The panel's own words are its title.
    setText('TextProperty', words('PAUSED')),
  ],
  {
    // The Panel's face, with the title near the top rather than in the
    // middle, so the buttons below have the rest of the box.
    drawing: {
      width: width(),
      height: height(),
      commands: [
        fill(swatch('#202840')),
        outline(swatch('#8890b0'), 2),
        rectangle(0, 0, width(), height()),
        noOutline(),
        fill(textOf('TextColorProperty')),
        drawParagraph(labelHalf(width()), TITLE_Y, width()),
      ],
    },
  },
);
