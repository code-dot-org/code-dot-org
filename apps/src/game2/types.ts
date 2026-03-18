/**
 * The shape of a Game2 project's persisted source JSON.
 */
export interface Game2Source {
  images?: Game2ImageEntry[];
  // Blockly workspace state (JSON serialization format).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blockly?: Record<string, any>;
  // 50x50 world grid. true = on, false/missing = off.
  grid?: boolean[][];
}

export interface Game2ImageEntry {
  /** User-facing display name for this image. */
  name: string;
  /** Asset filename stored in the project bucket. */
  filename: string;
  prompt?: string;
}
