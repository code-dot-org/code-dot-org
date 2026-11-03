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

import {actorDocument} from '../actorDocument';

import {labelSizeOf} from './label';
import {BORDER, LOOK, RADIUS_TIGHT} from './look';
import {
  corner,
  drawing,
  fill,
  labelValue,
  outline,
  rectangle,
  swatch,
  useStyle,
} from './workspace';

/** How big a Viewport is unless a project says otherwise: most of a screen. */
const WIDTH = 240;
const HEIGHT = 180;

const width = () => labelSizeOf('Width');
const height = () => labelSizeOf('Height');

export const viewportActor = actorDocument({
  name: 'Viewport',
  actsLike: 'actors/label',
  icon: 'viewport',
  // Its camera is set up on its placement, in the camera's inspector
  // (specs/ONE_WORLD_PLAN.md); the kind elects none.
  traits: ['Viewport#ViewportTrait'],
  values: [
    {setter: 'world_set_Boxed_WidthProperty', type: 'number', value: WIDTH},
    {setter: 'world_set_Boxed_HeightProperty', type: 'number', value: HEIGHT},
    labelValue('TextProperty', {type: 'string', value: ''}),
  ],
  drawing: drawing({
    width: width(),
    height: height(),
    commands: [
      fill(swatch(LOOK.field)),
      outline(swatch(LOOK.primaryStrong), BORDER),
      corner(RADIUS_TIGHT),
      useStyle('inset'),
      rectangle(0, 0, width(), height()),
    ],
  }),
});
