// Where a project's one world lives.
//
// A project holds ONE world — the game or app's general state — and maps for
// its levels, screens and dialogs (specs/MAP_EVENTS_PLAN.md). That decision
// has a consequence worth one constant: the world's module path is known
// ahead of time, so a file written before the project exists can refer to it.
//
// Which is what a stock map needs. A map raises the world's events, and an
// `emit` block's type is minted from the module the event is DECLARED in
// (`memberKey`) — so the Pause Menu's Quit button says
// `world_emit_WorldsMain_QuitEvent`, and it can say that in a shipped file
// only because every project's world is at the same path.
//
// A leaf on purpose: `constants.ts` would be the natural home and it imports
// every stock actor, which would make a cycle out of a string.

/** The module path of the world every project starts with. */
export const MAIN_WORLD_PATH = 'worlds/main';

/**
 * The Main Screen's module path: the game in the shape that replaces a world
 * (specs/SCREEN_MAP_PLAN.md, step 4). A project holds one or the other.
 */
export const MAIN_SCREEN_PATH = 'screens/main';

/**
 * The file a project's game is compiled from: its Main Screen if it holds
 * one, else its world. Both shapes compile until the lessons are rewritten,
 * and then the world goes.
 */
export const entryFileOf = (
  files: Readonly<Record<string, unknown>>,
): string =>
  `${MAIN_SCREEN_PATH}.screen` in files
    ? `${MAIN_SCREEN_PATH}.screen`
    : `${MAIN_WORLD_PATH}.world`;
