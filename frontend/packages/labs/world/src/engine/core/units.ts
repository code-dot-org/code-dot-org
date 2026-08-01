// What a rate is measured in.
//
// Positions and sizes are pixels, because that is what a map, a sprite and the
// map editor all deal in. Rates are not: a screen is 960 pixels across and a
// thing crosses it in about a second, so anything expressed as pixels per second
// comes out in the hundreds. Gravity's strength read `900`. A move speed read
// `150`. A jump was `-500`. Numbers like that are hard to reason about, hard to
// nudge (is the next value up 901?), and they made every physics knob look like
// a magic constant rather than a setting.
//
// So a rate — a velocity, a force, an acceleration — is in UNITS per second,
// where a unit is this many pixels. Gravity is `9`, a walk is `1.5`, a jump is
// `-5`, and the interesting range of each is a single digit or two.
//
// The conversion happens at the one place a rate meets a position: turning
// velocity into a change of position, and asking where an actor was a moment ago
// (`rules/stock/motion`'s `reposition` and `position before`). That rule is
// AUTHORED now, so this is exported and reachable from blocks as `pixels per
// unit` — a fact about the coordinate system, which the renderer draws in
// pixels, rather than a knob any one rule owns.

/**
 * Pixels in one world unit — the scale between rates and positions.
 *
 * A unit is a tenth of the screen's width, which is roughly what a walking actor
 * covers in a second at speed `1`.
 */
export const PIXELS_PER_UNIT = 100;
