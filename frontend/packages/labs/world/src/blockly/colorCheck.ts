// The Blockly connection type for a color value.
//
// `Colour`, with the British spelling, because it is BLOCKLY'S name and not
// ours. `colour_picker`, `colour_random` and `colour_blend` declare
// `output: 'Colour'`, and a connection check is a string equality — so an
// effect's color socket has to ask for the same string those blocks offer, or
// none of them can plug in:
//
//   Output Connection of "colour_picker" expected Colour, found Color
//
// It lives in a constant of its own because it was got wrong exactly once, by a
// sweep that Americanized the lab's spelling and could not tell a word a
// learner reads from a word two blocks use to agree with each other. Naming it
// gives the next such sweep something to not rename.

/**
 * The type both an effect's color socket checks and `world_rgba` outputs.
 *
 * Do not Americanize. See above — and the tests in `domainBlocks.test.ts`,
 * which pin it against the stock blocks it has to match.
 */
export const COLOUR_CHECK = 'Colour';
