import {COUNTRIES} from '@cdo/apps/geographyConstants';
import {
  SELECT_COUNTRY,
  US_COUNTRY_CODE,
} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import i18n from '@cdo/locale';

export function getCountriesUsFirst() {
  // Add 'Select a country' and 'United States' to the top of the country list
  const countries = [
    {value: SELECT_COUNTRY, text: i18n.selectCountry()},
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
