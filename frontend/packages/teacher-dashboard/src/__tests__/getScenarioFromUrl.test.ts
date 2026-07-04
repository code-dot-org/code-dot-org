// TDF-SHELL-02: the dev shell switches scenario on `?scenario=<tag>`.

import {describe, expect, it} from 'vitest';

import {getScenarioFromUrl, isDevChromeOff} from '../getScenarioFromUrl';
import {DEFAULT_SECTIONS_SCENARIO} from '../mocks/scenarios';

describe('getScenarioFromUrl', () => {
  it('reads the tag from ?scenario=', () => {
    expect(getScenarioFromUrl('?scenario=sections-empty')).toBe(
      'sections-empty',
    );
  });

  it('defaults when no ?scenario= param is present', () => {
    expect(getScenarioFromUrl('')).toBe(DEFAULT_SECTIONS_SCENARIO);
  });
});

describe('isDevChromeOff', () => {
  it('is true for ?devChrome=off', () => {
    expect(isDevChromeOff('?devChrome=off')).toBe(true);
  });

  it('is false otherwise', () => {
    expect(isDevChromeOff('')).toBe(false);
    expect(isDevChromeOff('?devChrome=on')).toBe(false);
  });
});
