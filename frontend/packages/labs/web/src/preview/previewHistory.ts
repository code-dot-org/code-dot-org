// The preview's page history, as a value. Ported from the navigationHistory /
// navigationHistoryIndex pair in apps/src/weblab2/htmlPreview/HTMLPreview.tsx —
// legacy keeps them as two useStates and threads both through every call site to
// dodge stale closures; keeping one value keeps them in step by construction.

export interface PreviewHistory {
  /** Pages visited, oldest first. */
  entries: string[];
  /** Where in `entries` the preview currently is; -1 when empty. */
  index: number;
}

export const EMPTY_HISTORY: PreviewHistory = {entries: [], index: -1};

/**
 * Record a navigation. Re-reporting the current page is not a navigation, which
 * is also what makes this safe against the preview echoing back the page it just
 * served on our own back/forward. Navigating after going back drops the forward
 * entries, as a browser does.
 */
export function addToHistory(
  history: PreviewHistory,
  filePath: string,
): PreviewHistory {
  if (filePath === history.entries[history.index]) {
    return history;
  }
  const entries =
    history.index === history.entries.length - 1
      ? [...history.entries, filePath]
      : [...history.entries.slice(0, history.index + 1), filePath];
  return {entries, index: entries.length - 1};
}

export const canNavigateBack = (history: PreviewHistory) => history.index > 0;

export const canNavigateForward = (history: PreviewHistory) =>
  history.index < history.entries.length - 1;

/**
 * The history moved by `delta`, and the page that lands on — or null when that
 * would step outside the list, so the caller does nothing.
 */
export function navigate(
  history: PreviewHistory,
  delta: number,
): {history: PreviewHistory; filePath: string} | null {
  const index = history.index + delta;
  if (index < 0 || index >= history.entries.length) {
    return null;
  }
  return {history: {...history, index}, filePath: history.entries[index]};
}
