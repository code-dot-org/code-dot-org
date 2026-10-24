// What an actor is for: a game, an interface, or both (SIMPLE_INTERFACE.md,
// "Interface, game, or both"). It decides which tab of the Actor Palette the
// actor is under (specs/SHELL_PLAN.md, step 2).
//
// Kept in the actor's file as a top-level key beside its workspace, which
// the Blockly editor carries through an edit (`blockly/documentExtras`). A
// file that says nothing is a game actor: everything a learner made before
// the flag existed was made for a game.

export type ActorPurpose = 'game' | 'interface' | 'both';

/** The palette's two tabs. */
export type PaletteTab = 'game' | 'interface';

/** The key an actor file keeps its purpose under. */
export const PURPOSE_KEY = 'for';

const PURPOSES = new Set<string>(['game', 'interface', 'both']);

/** What an actor file says it is for, or `game` when it says nothing. */
export function purposeOf(contents: string | undefined): ActorPurpose {
  try {
    const held = (JSON.parse(contents ?? '') as Record<string, unknown>)?.[
      PURPOSE_KEY
    ];
    return typeof held === 'string' && PURPOSES.has(held)
      ? (held as ActorPurpose)
      : 'game';
  } catch {
    return 'game';
  }
}

/** The actor file with its purpose written in, or as it was if unreadable. */
export function withPurpose(contents: string, purpose: ActorPurpose): string {
  try {
    const parsed = JSON.parse(contents) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return contents;
    }
    const rest = {...parsed};
    delete rest[PURPOSE_KEY];
    // First, so a reader of the file sees it before the workspace; indented
    // as the file was.
    return JSON.stringify(
      {[PURPOSE_KEY]: purpose, ...rest},
      null,
      contents.includes('\n') ? 2 : undefined,
    );
  } catch {
    return contents;
  }
}

/** Whether an actor for `purpose` is under `tab`. One for both is under each. */
export const isUnder = (purpose: ActorPurpose, tab: PaletteTab): boolean =>
  purpose === 'both' || purpose === tab;
