// Choosing what a `set sprite` block draws, by looking at it.
//
// A dropdown of file names is the one thing a name is bad at, and a spritesheet
// makes it worse: six entries reading "coinSpin 1…6" say nothing about which
// frame is the one turned edge-on. So the field opens the pickers the rest of
// the lab already uses — the pictures, then (for a sheet) the cells.
//
// A Blockly field cannot reach React, so it asks through a handler the editor
// registers and waits on the promise (the same seam as the stock imports:
// appearance/appearanceImport).

/** Ask for a picture, given what the field holds now. Undefined = cancelled. */
export type SpritePickHandler = (
  current: string,
) => Promise<string | undefined>;

let handler: SpritePickHandler | null = null;

/** The editor installs this while it is mounted. */
export function setSpritePickHandler(next: SpritePickHandler | null): void {
  handler = next;
}

/** Whether anything can answer — a field falls back to its menu when not. */
export function canPickSprite(): boolean {
  return handler !== null;
}

/** Open the picker. Resolves to a field value (`player.png`, `sheet.png#3`). */
export function requestSpritePick(
  current: string,
): Promise<string | undefined> {
  return handler ? handler(current) : Promise.resolve(undefined);
}
