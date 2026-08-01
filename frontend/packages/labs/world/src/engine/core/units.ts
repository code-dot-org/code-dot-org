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
// The engine converts at the one place a rate meets a position: integrating
// velocity into position, and anything that asks where an actor was a moment ago
// (Motion's `position before`, which Collision and a landing rule both use).
// Nothing else needs to know, and nothing outside the engine should have to
// multiply by this by hand — if a rule needs to mix the two, that is a sign the
// engine is missing a query.

/**
 * Pixels in one world unit — the scale between rates and positions.
 *
 * A unit is a tenth of the screen's width, which is roughly what a walking actor
 * covers in a second at speed `1`.
 */
export const PIXELS_PER_UNIT = 100;
