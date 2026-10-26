// What an actor is for: a game or an interface (SIMPLE_INTERFACE.md,
// "Interface, game, or both"). It decides which tab of the Actor Palette the
// actor is under (specs/SHELL_PLAN.md, step 2), what the shelves and the
// enhancements offer it, and whether a level with no game offers it at all.
//
// NEVER BOTH (specs/ACTORS_AS_DATA_PLAN.md, step 3). An interface actor is
// drawn and shown by its icon, a game actor wears pictures; and either tab is
// open on a Screen and on a Map, so an interface actor is placed in a level
// as it is. A rule or an enhancement may be for both: that is which kinds of
// actor it is OFFERED to (`OfferedTo`).
//
// Kept in the actor's file as a top-level key beside its workspace, which
// the Blockly editor carries through an edit (`blockly/documentExtras`). A
// file that says nothing is a game actor: everything a learner made before
// the flag existed was made for a game.

export type ActorPurpose = 'game' | 'interface';

/** The palette's two tabs, which are the two purposes. */
export type PaletteTab = ActorPurpose;

/** Which kinds of actor a rule or an enhancement is offered to. */
export type OfferedTo = ActorPurpose | 'both';

/** The key an actor file keeps its purpose under. */
export const PURPOSE_KEY = 'for';

const PURPOSES = new Set<string>(['game', 'interface']);

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

/** Whether a thing for `purpose` is under `tab`. One for both is under each. */
export const isUnder = (purpose: OfferedTo, tab: PaletteTab): boolean =>
  purpose === 'both' || purpose === tab;
