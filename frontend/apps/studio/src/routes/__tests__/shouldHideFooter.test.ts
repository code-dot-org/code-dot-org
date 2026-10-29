import {describe, expect, it} from 'vitest';

import {shouldHideFooter} from '../shouldHideFooter';

describe('shouldHideFooter', () => {
  it('is false when no match declares hideFooter', () => {
    expect(shouldHideFooter([{staticData: {}}, {staticData: {}}])).toBe(false);
  });

  it('is false for an empty match list', () => {
    expect(shouldHideFooter([])).toBe(false);
  });

  it('is true when any matched route declares hideFooter', () => {
    expect(
      shouldHideFooter([{staticData: {}}, {staticData: {hideFooter: true}}]),
    ).toBe(true);
  });

  it('is false when a match explicitly sets hideFooter to false', () => {
    expect(shouldHideFooter([{staticData: {hideFooter: false}}])).toBe(false);
  });
});
