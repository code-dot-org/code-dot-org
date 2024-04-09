import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {
  Heading2,
  BodyTwoText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import style from './school-association.module.scss';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {COUNTRIES} from '@cdo/apps/geographyConstants';
import SchoolZipSearch from '@cdo/apps/templates/SchoolZipSearch';
import SchoolNameInput from '@cdo/apps/templates/SchoolNameInput';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';

export default function SchoolDataInputs({
  includeHeaders = true,
  fieldNames = {
    country: 'user[school_info_attributes][country]',
    ncesSchoolId: 'user[school_info_attributes][school_id]',
    schoolName: 'user[school_info_attributes][school_name]',
    schoolZip: 'user[school_info_attributes][school_zip]',
  },
}) {
  const [askForZip, setAskForZip] = useState(false);
  const [isOutsideUS, setIsOutsideUS] = useState(false);
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [zipSearchReady, setZipSearchReady] = useState(false);

  let COUNTRY_ITEMS = [{value: 'selectCountry', text: i18n.selectCountry()}];
  for (const item of Object.values(COUNTRIES)) {
    COUNTRY_ITEMS.push({value: item.label, text: item.value});
  }

  useEffect(() => {
    if (zip.length === 5) {
      setZipSearchReady(true);
      analyticsReporter.sendEvent(
        EVENTS.ZIP_CODE_ENTERED,
        {zip: zip},
        PLATFORMS.BOTH
      );
    } else {
      // Removes the school dropdown if you delete part of the zip
      setZipSearchReady(false);
    }
  }, [zip]);

  const onCountryChange = e => {
    const country = e.target.value;
    setCountry(country);
    analyticsReporter.sendEvent(
      EVENTS.COUNTRY_SELECTED,
      {country: country},
      PLATFORMS.BOTH
    );
    // We don't want to display any fields to start that won't eventually be
    // necessary, so updating both of these any time country changes
    if (country === 'US') {
      setAskForZip(true);
      setIsOutsideUS(false);
    } else {
      setAskForZip(false);
      setIsOutsideUS(true);
    }
  };

  return (
    <div className={style.outerContainer}>
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
          className={style.dropdown}
          name={fieldNames.country}
          items={COUNTRY_ITEMS}
          selectedValue={country}
          onChange={onCountryChange}
          size="m"
        />
        {askForZip && (
          <label>
            <BodyTwoText
              className={style.padding}
              visualAppearance={'heading-xs'}
            >
              {i18n.enterYourSchoolZip()}
            </BodyTwoText>
            <input
              type="text"
              name={fieldNames.schoolZip}
              onChange={e => {
                setZip(e.target.value);
              }}
              value={zip}
            />
            {zip && !zipSearchReady && (
              <BodyThreeText>{i18n.zipInvalidMessage()}</BodyThreeText>
            )}
          </label>
        )}
        {isOutsideUS && (
          <SchoolNameInput
            fieldNames={{
              schoolName: fieldNames.schoolName,
            }}
          />
        )}
        {askForZip && zipSearchReady && (
          <SchoolZipSearch
            fieldNames={{
              ncesSchoolId: fieldNames.ncesSchoolId,
              schoolName: fieldNames.schoolName,
            }}
            zip={zip}
          />
        )}
      </div>
    </div>
  );
}

SchoolDataInputs.propTypes = {
  includeHeaders: PropTypes.bool,
  fieldNames: PropTypes.object,
};
