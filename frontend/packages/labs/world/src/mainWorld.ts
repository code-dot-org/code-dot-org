// Where a project's game lives.
//
// A project's game is its Main Screen — the game or app's general state — and
// maps for its levels, screens and dialogs (specs/SCREEN_MAP_PLAN.md). That
// decision has a consequence worth one constant: the Main Screen's module
// path is known ahead of time, so a file written before the project exists
// can refer to it.
//
// Which is what a stock map needs. A map raises the game's events, and an
// `emit` block's type is minted from the module the event is DECLARED in
// (`memberKey`) — so the Pause Menu's Quit button says
// `world_emit_ScreensMain_QuitEvent`, and it can say that in a shipped file
// only because every project's Main Screen is at the same path.
//
// A leaf on purpose: `constants.ts` would be the natural home and it imports
// every stock actor, which would make a cycle out of a string.

/** The Main Screen's module path: the game (specs/SCREEN_MAP_PLAN.md). */
export const MAIN_SCREEN_PATH = 'screens/main';

/** The file a project's game is compiled from: its Main Screen. */
export const entryFileOf = (): string => `${MAIN_SCREEN_PATH}.screen`;

/**
 * The game's module path, or nothing for a project with no Main Screen.
 * What a thumbnail manifest imports for the rules and animations an actor is
 * drawn with.
 */
export const gameModuleOf = (
  files: Readonly<Record<string, unknown>>,
): string | undefined =>
  `${MAIN_SCREEN_PATH}.screen` in files ? MAIN_SCREEN_PATH : undefined;
