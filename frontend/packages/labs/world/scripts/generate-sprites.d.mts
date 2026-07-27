// Type declarations for the plain-JS sprite generator, so TypeScript callers
// (the sync test) can import it without an implicit-any error.

export const SPRITE_SIZE: number;
export const SPRITE_NAMES: string[];
export const ANIMATION_SPECS: Record<string, {frames: number; frameRate: number}>;
export function generateSprites(outDir: string): {
  sprites: string[];
  animations: string[];
};
