// What an actor looks like, for the parts of Blockly that draw one.
//
// The sandbox renders these (it is the only thing that can: an actor's
// appearance is its rules, its traits and its animation frame resolved
// together), and the map editor asks for them through the runtime context. A
// Blockly field cannot reach that context — it is not in the React tree — so
// the editor pushes them here, the same arrangement the project dropdowns use
// (`moduleOptions`).
//
// Missing is a fine answer: the placement grid draws a plain marker for an
// actor it has no picture of, which still says the cell is taken.

/** Data URLs by actor type, as the sandbox rendered them. */
let thumbnails: Record<string, string> = {};

/** Replace what the fields draw actors with. */
export function setActorThumbnails(next: Record<string, string>): void {
  thumbnails = next;
}

/** Merge in more, keeping what is already known. */
export function addActorThumbnails(more: Record<string, string>): void {
  thumbnails = {...thumbnails, ...more};
}

/** The thumbnail for an actor type, or undefined if none has arrived. */
export function actorThumbnail(type: string): string | undefined {
  return thumbnails[type];
}

/** Everything known, for a caller that wants to draw several. */
export function actorThumbnails(): Record<string, string> {
  return thumbnails;
}
