import {describe, expect, it} from 'vitest';

import {
  addToHistory,
  canNavigateBack,
  canNavigateForward,
  EMPTY_HISTORY,
  navigate,
} from '../preview/previewHistory';

/** Visit each page in turn, starting from empty. */
const visit = (...paths: string[]) => paths.reduce(addToHistory, EMPTY_HISTORY);

describe('previewHistory', () => {
  it('starts with nowhere to go', () => {
    expect(canNavigateBack(EMPTY_HISTORY)).toBe(false);
    expect(canNavigateForward(EMPTY_HISTORY)).toBe(false);
  });

  it('appends visited pages and points at the newest', () => {
    expect(visit('index.html', 'about.html')).toEqual({
      entries: ['index.html', 'about.html'],
      index: 1,
    });
  });

  it('cannot go back from the only page', () => {
    const history = visit('index.html');
    expect(canNavigateBack(history)).toBe(false);
    expect(navigate(history, -1)).toBeNull();
  });

  it('goes back and forward across visited pages', () => {
    const history = visit('index.html', 'about.html');

    const back = navigate(history, -1);
    expect(back).toEqual({
      history: {entries: ['index.html', 'about.html'], index: 0},
      filePath: 'index.html',
    });
    expect(canNavigateForward(back!.history)).toBe(true);

    expect(navigate(back!.history, 1)?.filePath).toBe('about.html');
  });

  it('refuses to step past either end', () => {
    const history = visit('index.html', 'about.html');
    expect(navigate(history, 1)).toBeNull();
    expect(navigate({...history, index: 0}, -1)).toBeNull();
  });

  // The guard that makes back/forward safe: the preview reports every page it
  // serves, including the one we just asked it for.
  it('ignores a report of the page already showing', () => {
    const history = visit('index.html', 'about.html');
    expect(addToHistory(history, 'about.html')).toBe(history);

    const back = navigate(history, -1)!.history;
    expect(addToHistory(back, 'index.html')).toBe(back);
  });

  it('drops forward entries when navigating after going back', () => {
    const history = visit('index.html', 'about.html', 'contact.html');
    const back = navigate(history, -2)!.history;

    expect(addToHistory(back, 'other.html')).toEqual({
      entries: ['index.html', 'other.html'],
      index: 1,
    });
  });

  it('records a revisit that is not the current page', () => {
    // Back to index, then follow a link to about again: about is appended
    // rather than treated as a no-op, so forward history is replaced.
    const history = visit('index.html', 'about.html');
    const back = navigate(history, -1)!.history;

    expect(addToHistory(back, 'about.html')).toEqual({
      entries: ['index.html', 'about.html'],
      index: 1,
    });
  });
});
