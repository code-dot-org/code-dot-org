import PropTypes from 'prop-types';
import React, {useState} from 'react';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import {COUNTRIES} from '@cdo/apps/geographyConstants';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import SchoolNameInput from '@cdo/apps/templates/SchoolNameInput';
import SchoolZipSearch from '@cdo/apps/templates/SchoolZipSearch';
import i18n from '@cdo/locale';

import style from './school-association.module.scss';

const SCHOOL_COUNTRY = 'schoolCountry';
const US_COUNTRY_CODE = 'US';

export default function SchoolDataInputs({
  usIp,
  includeHeaders = true,
  fieldNames = {
    country: 'user[school_info_attributes][country]',
    ncesSchoolId: 'user[school_info_attributes][school_id]',
    schoolName: 'user[school_info_attributes][school_name]',
    schoolZip: 'user[school_info_attributes][school_zip]',
  },
}) {
  // If the user filled out country before or we are detecting a US IP address
  const detectedCountry =
    sessionStorage.getItem(SCHOOL_COUNTRY) || (usIp ? US_COUNTRY_CODE : '');
  const [country, setCountry] = useState(detectedCountry);
  const [askForZip, setAskForZip] = useState(
    detectedCountry === US_COUNTRY_CODE
  );
  const [isOutsideUS, setIsOutsideUS] = useState(
    detectedCountry && detectedCountry !== US_COUNTRY_CODE
  );

  // Add 'Select a country' and 'United States' to the top of the country list
  let COUNTRY_ITEMS = [
    {value: 'selectCountry', text: i18n.selectCountry()},
    {value: US_COUNTRY_CODE, text: i18n.unitedStates()},
  ];
  // Pull in the rest of the countries after/below
  const nonUsCountries = Object.values(COUNTRIES).filter(
    item => item.label !== US_COUNTRY_CODE
  );
  for (const item of nonUsCountries) {
    COUNTRY_ITEMS.push({value: item.label, text: item.value});
  }

  const onCountryChange = e => {
    const country = e.target.value;
    setCountry(country);
    sessionStorage.setItem(SCHOOL_COUNTRY, country);
    analyticsReporter.sendEvent(
      EVENTS.COUNTRY_SELECTED,
      {country: country},
      PLATFORMS.BOTH
    );
    // We don't want to display any fields to start that won't eventually be
    // necessary, so updating both of these any time country changes
    if (country === US_COUNTRY_CODE) {
      setAskForZip(true);
      setIsOutsideUS(false);
    } else {
      setAskForZip(false);
      setIsOutsideUS(true);
    }
  };

  return (
    <div className={style.schoolAssociationWrapper}>
      {includeHeaders && (
        <div>
          <Heading2 className={style.topPadding}>
            {i18n.censusHeading()}
          </Heading2>
          <BodyTwoText>{i18n.schoolInfoInterstitialTitle()}</BodyTwoText>
        </div>
      )}
      <div className={style.inputContainer}>
        <BodyTwoText className={style.padding} visualAppearance={'heading-xs'}>
          {i18n.whatCountry()}
        </BodyTwoText>
        <SimpleDropdown
          id="uitest-country-dropdown"
          name={fieldNames.country}
          items={COUNTRY_ITEMS}
          selectedValue={country}
          onChange={onCountryChange}
          size="m"
        />
        {askForZip && (
          <div className={style.schoolZipSearch}>
            <SchoolZipSearch
              fieldNames={{
                schoolZip: fieldNames.schoolZip,
                ncesSchoolId: fieldNames.ncesSchoolId,
                schoolName: fieldNames.schoolName,
              }}
            />
          </div>
        )}
        {isOutsideUS && (
          <SchoolNameInput
            fieldNames={{
              schoolName: fieldNames.schoolName,
            }}
          />
        )}
      </div>
    </div>
  );
}

SchoolDataInputs.propTypes = {
  usIp: PropTypes.bool,
  includeHeaders: PropTypes.bool,
  fieldNames: PropTypes.object,
  overrideStyles: PropTypes.object,
};
