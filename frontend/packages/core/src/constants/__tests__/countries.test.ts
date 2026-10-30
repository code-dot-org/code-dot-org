import {describe, expect, it} from 'vitest';

import {COUNTRIES} from '../countries';

describe('COUNTRIES', () => {
  it('holds one entry per country', () => {
    expect(COUNTRIES).toHaveLength(246);
    expect(new Set(COUNTRIES.map(({value}) => value)).size).toBe(
      COUNTRIES.length,
    );
  });

  it('pairs an ISO code with a display name', () => {
    expect(
      COUNTRIES.every(
        ({value, text}) => /^[A-Z]{2}$/.test(value) && text.length > 0,
      ),
    ).toBe(true);
  });

  it('is sorted by display name', () => {
    expect(COUNTRIES[0]).toEqual({value: 'AF', text: 'Afghanistan'});
    expect(COUNTRIES.find(({value}) => value === 'US')).toEqual({
      value: 'US',
      text: 'United States',
    });
    expect(COUNTRIES.map(({text}) => text)).toEqual(
      [...COUNTRIES.map(({text}) => text)].sort((a, b) => a.localeCompare(b)),
    );
  });
});
