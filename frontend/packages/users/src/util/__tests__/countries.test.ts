import {describe, expect, it} from 'vitest';

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

  it('lists the remaining countries once each, alphabetically', () => {
    const rest = COUNTRIES_US_FIRST.slice(2);
    expect(rest.some(country => country.value === US_COUNTRY_CODE)).toBe(false);
    expect(rest.map(country => country.text)).toEqual(
      [...rest.map(country => country.text)].sort((a, b) => a.localeCompare(b)),
    );
    expect(new Set(rest.map(country => country.value)).size).toBe(rest.length);
  });

  it('keeps every country code paired with a display name', () => {
    expect(COUNTRIES_US_FIRST.every(({value, text}) => value && text)).toBe(
      true,
    );
    expect(
      COUNTRIES_US_FIRST.find(country => country.value === 'CA')?.text,
    ).toBe('Canada');
  });
});
