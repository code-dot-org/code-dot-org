/**
 * The shape of a Game2 project's persisted source JSON.
 */
export interface Game2Source {
  items?: Game2ItemEntry[];
  // Blockly workspace state (JSON serialization format).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blockly?: Record<string, any>;
  /**
   * World grid (GRID_COLS × GRID_ROWS).
   *
   * Each cell is one of:
   *   - '' (empty)
   *   - an item name (block-type for platforms, sprite-type for collectibles)
   */
  grid?: string[][];
}

/** The kind of item asset: sprite (transparent), block (replaces platforms), or background. */
export type Game2ItemType = 'sprite' | 'block' | 'background';

export interface Game2ItemEntry {
  /** User-facing display name for this item. */
  name: string;
  /** Asset filename stored in the project bucket. */
  filename: string;
  prompt?: string;
  itemType?: Game2ItemType;
}
