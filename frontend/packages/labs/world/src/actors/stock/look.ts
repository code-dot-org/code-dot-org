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

/**
 * The dark palette the kit already had, named.
 *
 * NAMED AS A PALETTE IS NAMED, which the first cut was not: it had `surface`,
 * `surface edge`, `surface raised`, `well`, `muted` and `muted ink` — six
 * words for what is really two families with a light and a strong end. The
 * names here are the ones a theme file uses, so the lab's own authoring and a
 * learner's file say the same words (specs/STYLES_PLAN.md).
 *
 * `light` and `strong` are said RELATIVE TO THE SURFACE rather than as
 * absolute lightness, which is what lets one pair of names serve a dark theme
 * and a light one: on Modern the strong end is lighter than the panel, on
 * Classic it is darker, and in both it is the one with contrast enough to be
 * a border.
 */
export const LOOK = {
  /** Behind everything. What the controls are read against. */
  background: '#141826',
  /** The main surface: a Panel, a Dropdown's face, a List's face. */
  primary: '#202840',
  /** …a gentle lift off it — the row under the pointer. */
  primaryLight: '#303a58',
  /** …and the end with contrast enough for a border. */
  primaryStrong: '#8890b0',
  /** The quiet furniture: a track, a scrollbar, a switch that is off. */
  secondary: '#505870',
  /** The one colour that means "this is the thing to press". */
  accent: '#3050a0',
  /** …and the same lifted: the row a click would take, a button held down. */
  accentLight: '#4050a0',
  /** Words, and the knob of a Toggle or a Slider. */
  ink: '#ffffff',
  /** …and words that are a prompt rather than an answer. */
  inkLight: '#6b7394',
  /**
   * The inside of anything that HOLDS content: a Text Input's words, a Scroll
   * View's rows, a Viewport's map.
   *
   * IT ABSORBED `well`, which was a second name for the same idea and was one
   * nobody could read off the page. The two values differed by a few points
   * in both themes, which is the drift this whole module exists to stop.
   */
  field: '#1a1a22',
  /** The keyboard is HERE. Nothing else in the kit is this colour. */
  focus: '#ffd45e',
  /** What a field says when it looks wrong. */
  danger: '#e06c75',
  /** A Toggle that is on. */
  positive: '#40c060',
  /**
   * …and the third of that set, which nothing reads yet.
   *
   * Here because a palette with a danger and a positive and no warning is a
   * palette a theme author has to extend before they can say the ordinary
   * thing. A token costs a line and no behaviour.
   */
  warning: '#e0a030',
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
