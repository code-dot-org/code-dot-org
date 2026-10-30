import {describe, expect, it} from 'vitest';

import {COUNTRIES} from '@code-dot-org/core/constants';

import {COUNTRIES_US_FIRST} from '../countries';
import {SELECT_COUNTRY, US_COUNTRY_CODE} from '../schoolInfo';

describe('COUNTRIES_US_FIRST', () => {
  it('leads with the placeholder, then the United States', () => {
    expect(COUNTRIES_US_FIRST[0]).toEqual({
      value: SELECT_COUNTRY,
      text: 'Select a country',
    });
    expect(COUNTRIES_US_FIRST[1]).toEqual({
      value: US_COUNTRY_CODE,
      text: 'United States',
    });
  });

  it('then lists the core countries with the United States removed', () => {
    expect(COUNTRIES_US_FIRST.slice(2)).toEqual(
      COUNTRIES.filter(country => country.value !== US_COUNTRY_CODE),
    );
    expect(
      COUNTRIES_US_FIRST.find(country => country.value === 'CA')?.text,
    ).toBe('Canada');
  });
});
