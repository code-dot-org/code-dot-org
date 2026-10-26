// Type declarations for the plain-JS sprite generator, so TypeScript callers
// (the sync test) can import it without an implicit-any error.

export const SPRITE_SIZE: number;
export const SPRITE_NAMES: string[];
export const ANIMATION_SPECS: Record<
  string,
  {frames: number; frameRate: number}
>;
/** Every stock drawing as RGBA pixels — what the encoder is handed. */
export function stockPixels(): Record<
  string,
  {width: number; height: number; data: Uint8Array}
>;
export function stockImages(): Record<string, Buffer>;
export function encodePng(
  rgba: Uint8Array,
  width: number,
  height: number,
): Buffer;
export function generateSprites(outDir: string): {
  sprites: string[];
  animations: string[];
};
