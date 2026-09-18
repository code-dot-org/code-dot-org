// "Viewport" — a window onto a map of its own (specs/MAP_FIRST.md, "Levels:
// the Viewport"; specs/VIEWPORT_PLAN.md).
//
// A Panel in shape — a width and a height it acts like a Label to get, and a
// face — and one thing more: it Shows a Map, the engine's own trait
// (`rules/viewport`), whose one property is the map it holds by path. Set
// that in the map editor and the engine gives the Viewport a space of its
// own, loads the map into it on the first tick, and draws it inside the
// Viewport's rectangle through a camera of the space's own. `load map ⟨…⟩
// into ⟨this actor⟩` changes what it shows; `unload ⟨this actor⟩` empties it.
//
// The face is the window's own backdrop: a dark fill and an edge, drawn
// under whatever the map in it draws. The map's own backgrounds are step 4's.

import {labelSizeOf} from './label';
import {
  actorFile,
  actsLike,
  fill,
  me,
  outline,
  rectangle,
  setText,
  showAs,
  swatch,
  useTrait,
  words,
} from './workspace';

/** How big a Viewport is unless a project says otherwise: most of a screen. */
const WIDTH = 240;
const HEIGHT = 180;

const width = () => labelSizeOf('Width');
const height = () => labelSizeOf('Height');

const sized = (name: 'Width' | 'Height', value: number) => ({
  type: `world_set_ActorsLabel_${name}Property`,
  inputs: {
    ACTOR: me(),
    VALUE: {shadow: {type: 'math_number', fields: {NUM: value}}},
  },
});

export const viewportActor = actorFile(
  'Viewport',
  [
    actsLike('actors/label'),
    useTrait('Viewport#ViewportTrait'),
    showAs('viewport'),
    sized('Width', WIDTH),
    sized('Height', HEIGHT),
    setText('TextProperty', words('')),
  ],
  {
    drawing: {
      width: width(),
      height: height(),
      commands: [
        fill(swatch('#10141c')),
        outline(swatch('#8890b0'), 2),
        rectangle(0, 0, width(), height()),
      ],
    },
  },
);
