export interface KeyboardShortcut {
  /** The key combination, e.g. "Arrow keys", "Ctrl / Cmd + Z", "[". */
  shortcut: string;
  explanation: string;
}

/** A dictionary of category name to the shortcuts under that category. */
export type KeyboardShortcutCategories = Record<string, KeyboardShortcut[]>;
