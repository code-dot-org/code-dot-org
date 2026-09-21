// What the interface kit paints with: the palette, and the shape of a control.
//
// IT WAS ALREADY A THEME, retyped. Eighteen colour literals appeared
// thirty-nine times across thirteen actor files, and they repeat — one edge
// colour on nine controls, one focus yellow on five, one surface on three. So
// the kit HAS a palette; it was just said once per file, which is the only
// reason it could not be changed (specs/STYLES_PLAN.md).
//
// Retyping had already gone wrong in both of the ways it goes wrong. It
// DRIFTED: `#10141c`, `#101828` and `#1a1a22` were three dark surfaces
// differing by a few points of blue, and nothing chose that. And constants got
// re-declared with different values: `RING_INSET` was written five times — 4
// in the Button, 1 in the Slider, 2 in the other three — so five controls that
// meant to draw one focus ring drew three.
//
// WHAT THIS IS NOT. These names are the lab's, at authoring time: an `.actor`
// file is GENERATED from them and ships with the colour baked in as a literal
// a learner can open and edit. So this makes the kit consistent; it does not
// make a learner's project themeable. That is the `.style` file, which is the
// step after this one and which will take its role names from this table.

/** The dark palette the kit already had, named. */
export const LOOK = {
  /** A raised sheet: a Panel, a Dropdown's face, a List's face. */
  surface: '#202840',
  /** …and its quiet edge. */
  surfaceEdge: '#8890b0',
  /** A recess — something is INSIDE this: a Scroll View, a Viewport, a Speech
   *  Box. One colour where there were three, within a few points of blue. */
  well: '#10141c',
  /** Something typed into, which is a well you may put a caret in. */
  field: '#1a1a22',
  /** The one colour that means "this is the thing to press". */
  accent: '#3050a0',
  /** …and the same thing lifted: the row a click would choose. */
  accentRaised: '#4050a0',
  /** A row merely under the pointer, which is the surface lifted rather than
   *  the accent: pointing at a thing is not choosing it. */
  surfaceRaised: '#303a58',
  /** Words, and the knob of a Toggle or a Slider. */
  ink: '#ffffff',
  /** Words that are a hint rather than an answer. */
  mutedInk: '#6b7394',
  /** A track, a scrollbar, a switch that is off: present and not the point. */
  muted: '#505870',
  /** The keyboard is HERE. Nothing else in the kit is this colour, which is
   *  the whole job: a thicker white edge reads as a rounding artifact. */
  focus: '#ffd45e',
  /** What a field says when it looks wrong. */
  danger: '#e06c75',
  /** A Toggle that is on. */
  positive: '#40c060',
} as const;

// THE SHAPE OF A CONTROL, which is the half that makes these look unfinished
// rather than merely plain. Every one of them was a square box with a hard
// 2px edge and nothing behind it.

/** A control you press or open: a Button, a Dropdown's face, a Panel. */
export const RADIUS = 8;
/** Something typed into or scrolled, which reads tighter. */
export const RADIUS_TIGHT = 4;
/** A bar or a track, where the corner is most of the height. */
export const RADIUS_BAR = 3;

/** A quiet edge. It was 2 everywhere, which is a border you read before the
 *  thing it is around. */
export const BORDER = 1;

// WHAT A RAISED THING CASTS. Down only, because the light is above the screen
// and an interface has never pretended otherwise.
//
// The colour is four floats rather than a swatch, because a shadow is the
// first thing in this kit that needs an ALPHA: an opaque black under a control
// on a dark page is a hole (`workspace.rgbaColor`).

/** What a RAISED control casts — a Button, which sits on the page. */
export const SHADOW = {color: [0, 0, 0, 0.35] as const, blur: 5, down: 2};

/** What something ON TOP casts — an open menu, a dialog over a screen. */
export const SHADOW_OVER = {
  color: [0, 0, 0, 0.55] as const,
  blur: 12,
  down: 4,
};

/** One focus ring, in one place, at one width. */
export const RING_INSET = 2;
export const RING_WIDTH = 2;
/** The ring follows the corner it is inset from, or it reads as a mistake. */
export const ringRadius = (radius: number) => Math.max(0, radius - RING_INSET);
