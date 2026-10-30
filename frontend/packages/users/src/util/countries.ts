import {COUNTRIES} from '@code-dot-org/core/constants';

import {SELECT_COUNTRY, US_COUNTRY_CODE, type SchoolOption} from './schoolInfo';

export const COUNTRIES_US_FIRST: SchoolOption[] = [
  {value: SELECT_COUNTRY, text: 'Select a country'},
  {value: US_COUNTRY_CODE, text: 'United States'},
  ...COUNTRIES.filter(({value}) => value !== US_COUNTRY_CODE),
];
