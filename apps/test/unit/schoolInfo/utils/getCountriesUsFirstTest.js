import {COUNTRIES} from '@cdo/apps/geographyConstants';
import {getCountriesUsFirst} from '@cdo/apps/schoolInfo/utils/getCountriesUsFirst';
import {US_COUNTRY_CODE} from '@cdo/apps/signUpFlow/signUpFlowConstants';
import i18n from '@cdo/locale';

describe('getCountriesUsFirst', () => {
  it('should return an array with "Select a country" and "United States" at the top', () => {
    const result = getCountriesUsFirst();

    expect(result[0]).toEqual({
      value: 'selectCountry',
      text: i18n.selectCountry(),
    });
    expect(result[1]).toEqual({
      value: US_COUNTRY_CODE,
      text: i18n.unitedStates(),
    });
  });

  it('should include all other countries after the United States', () => {
    const result = getCountriesUsFirst();

    // The first two countries should be "Select a country" and "United States"
    expect(result[0].text).toBe(i18n.selectCountry());
    expect(result[1].text).toBe(i18n.unitedStates());

    // The remaining countries should match the COUNTRIES array minus the United States
    const nonUsCountries = COUNTRIES.filter(
      item => item.label !== US_COUNTRY_CODE
    );

    nonUsCountries.forEach((country, index) => {
      expect(result[index + 2]).toEqual({
        value: country.label,
        text: country.value,
      });
    });
  });
});
