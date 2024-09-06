import {COUNTRIES} from '@cdo/apps/geographyConstants';
import i18n from '@cdo/locale';

import {US_COUNTRY_CODE} from '../constants';

export function getCountriesUsFirst() {
  // Add 'Select a country' and 'United States' to the top of the country list
  const countries = [
    {value: 'selectCountry', text: i18n.selectCountry()},
    {value: US_COUNTRY_CODE, text: i18n.unitedStates()},
  ];

  // Pull in the rest of the countries after/below
  const nonUsCountries = COUNTRIES.filter(
    item => item.label !== US_COUNTRY_CODE
  );

  for (const nonUsCountry of nonUsCountries) {
    countries.push({value: nonUsCountry.label, text: nonUsCountry.value});
  }
  return countries;
}
