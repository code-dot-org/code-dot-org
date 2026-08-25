// What the keyboard cursor says about a Neighborhood (Painter) cell.

export type SpriteMap = Record<string, {name: string} | undefined>;

// Sprite names are art ids, not words: a taxi spans six tiles, a house sixty.
// The first token found gives the noun; "sidewalk" beats "grass" on corners.
const ASSET_NAMES: [token: string, noun: string][] = [
  ['sidewalk', 'Sidewalk'],
  ['bench', 'Bench'],
  ['bush', 'Bush'],
  ['flower-planter', 'Flower planter'],
  ['brick', 'Wall'],
  ['taxi', 'Taxi'],
  ['donuttruck', 'Donut truck'],
  ['cone', 'Traffic cone'],
  ['grass', 'Grass'],
  ['street', 'Street'],
  ['bodega', 'Bodega'],
  ['redhouse', 'Red house'],
  ['bluehouse', 'Blue house'],
];

// Names the scenery. Null for the painter avatar and the paint can.
export function describeAsset(
  spriteMap: SpriteMap | undefined,
  assetId: number | undefined
): string | null {
  const name = spriteMap?.[String(assetId)]?.name.toLowerCase();
  if (!name) {
    return null;
  }
  const match = ASSET_NAMES.find(([token]) => name.includes(token));
  return match ? `${match[1]}.` : null;
}

export interface NeighborhoodCellState {
  // Set by paint(), absent until the student's program paints the cell.
  color?: string;
  // Paint left in the bucket here, 0 when there is no bucket.
  paintCount?: number;
  assetId?: number;
}

// Paint is the student's own work and covers the scenery, so it comes first.
export function describeNeighborhoodCell(
  spriteMap: SpriteMap | undefined,
  {color, paintCount, assetId}: NeighborhoodCellState
): string | null {
  const parts = [];
  if (color) {
    parts.push(`Painted ${color}.`);
  }
  if (paintCount) {
    parts.push(`Paint bucket, ${paintCount} paint.`);
  }
  return parts.join(' ') || describeAsset(spriteMap, assetId);
}
