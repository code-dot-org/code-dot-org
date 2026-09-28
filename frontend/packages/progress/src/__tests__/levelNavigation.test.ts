import {afterEach, describe, expect, it, vi} from 'vitest';

import {
  canChangeLevelInPage,
  configureLevelNavigation,
  getLevelNavigationHooks,
  levelPageUrl,
  resetLevelNavigation,
} from '../levelNavigation';
import type {NumberedLevel} from '../types';

const lab2 = {usesLab2: true} as NumberedLevel;
const legacy = {usesLab2: false} as NumberedLevel;

afterEach(() => {
  resetLevelNavigation();
  window.history.replaceState({}, '', '/');
});

describe('configureLevelNavigation', () => {
  it('keeps hooks it is not given, and removes one given as undefined', () => {
    const confirmNavigation = vi.fn();
    const onLevelChange = vi.fn();
    configureLevelNavigation({confirmNavigation, onLevelChange});
    configureLevelNavigation({confirmNavigation: undefined});
    expect(getLevelNavigationHooks().confirmNavigation).toBeUndefined();
    expect(getLevelNavigationHooks().onLevelChange).toBe(onLevelChange);
  });
});

describe('canChangeLevelInPage', () => {
  it('allows two Lab2 levels', () => {
    expect(canChangeLevelInPage(lab2, lab2)).toBe(true);
  });

  it('refuses when either level is not Lab2, or there is no current level', () => {
    expect(canChangeLevelInPage(lab2, legacy)).toBe(false);
    expect(canChangeLevelInPage(legacy, lab2)).toBe(false);
    expect(canChangeLevelInPage(undefined, lab2)).toBe(false);
  });

  it('refuses on a summary page', () => {
    window.history.replaceState({}, '', '/s/csd1/lessons/2/levels/3/summary');
    expect(canChangeLevelInPage(lab2, lab2)).toBe(false);
  });
});

describe('levelPageUrl', () => {
  it('keeps the current query string', () => {
    window.history.replaceState(
      {},
      '',
      '/start?section_id=5&viewAs=Instructor',
    );
    expect(levelPageUrl('/courses/x/levels/2')).toBe(
      '/courses/x/levels/2?section_id=5&viewAs=Instructor',
    );
  });

  it('drops version, which names another level project version', () => {
    window.history.replaceState({}, '', '/start?version=abc&section_id=5');
    expect(levelPageUrl('/courses/x/levels/2')).toBe(
      '/courses/x/levels/2?section_id=5',
    );
  });

  it("lets the level's own parameters win", () => {
    window.history.replaceState({}, '', '/start?user_id=1');
    expect(levelPageUrl('/courses/x/levels/2?user_id=2&a=b')).toBe(
      '/courses/x/levels/2?user_id=2&a=b',
    );
  });

  it('adds no query string when there is none', () => {
    expect(levelPageUrl('/courses/x/levels/2')).toBe('/courses/x/levels/2');
  });
});
