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
   * New format: string[][] where each cell is one of:
   *   - '' (empty)
   *   - 'solid' (default impassable block)
   *   - an item name (placed item)
   *
   * Legacy format: boolean[][] — migrated at load time.
   */
  grid?: (string | boolean)[][];
}

/** The kind of item asset: sprite (transparent), block (replaces platforms), or background. */
export type Game2ItemType = 'sprite' | 'block' | 'background';

export interface Game2ItemEntry {
  /** User-facing display name for this item. */
  name: string;
  /** Asset filename stored in the project bucket. */
  filename: string;
  prompt?: string;
  /** Defaults to 'sprite' for legacy entries without this field. */
  itemType?: Game2ItemType;
}

// Legacy aliases for backwards compatibility during migration.
export type Game2ImageType = Game2ItemType;
export type Game2ImageEntry = Game2ItemEntry;
