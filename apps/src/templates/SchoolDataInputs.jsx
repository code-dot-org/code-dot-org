import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import style from './school-association.module.scss';
import SimpleDropdown from '../componentLibrary/simpleDropdown/SimpleDropdown';
import {COUNTRIES} from '@cdo/apps/geographyConstants';

export default function SchoolDataInputs(
  fieldNames = {
    country: 'user[school_info_attributes][country]',
    ncesSchoolId: 'user[school_info_attributes][school_id]',
    schoolName: 'user[school_info_attributes][school_name]',
    schoolZip: 'user[school_info_attributes][school_zip]',
  }
) {
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
    }
  }, [zip.length]);

  const onZipChange = e => {
    const newZip = e.target.value;
    setZip(newZip);
  };

  const onCountryChange = e => {
    const country = e.target.value;
    setCountry(country);
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
      <Heading2 className={style.topPadding}>{i18n.censusHeading()}</Heading2>
      <BodyTwoText>{i18n.schoolInfoInterstitialTitle()}</BodyTwoText>
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
          <div>
            <BodyTwoText
              className={style.padding}
              visualAppearance={'heading-xs'}
            >
              {i18n.enterYourSchoolZip()}
            </BodyTwoText>
            <input
              type="text"
              name={fieldNames.schoolZip}
              placeholder={'i.e. 98104'}
              onChange={onZipChange}
              value={zip}
            />
            {zip && !zipSearchReady && 'Please enter a 5 digit zip code'}
          </div>
        )}
        {isOutsideUS && (
          <div>
            <BodyTwoText
              className={style.padding}
              visualAppearance={'heading-xs'}
            >
              {i18n.schoolOrganizationQuestion()}
            </BodyTwoText>
            {/*<EnterSchoolNameManually fieldName={fieldNames.schoolName} /> Write new component to gather school name*/}
          </div>
        )}
        {askForZip && zipSearchReady && (
          <div>
            <BodyTwoText
              className={style.padding}
              visualAppearance={'heading-xs'}
            >
              {i18n.selectYourSchool()}
            </BodyTwoText>
            {/*<SchoolZipSearch fieldName={fieldNames.ncesSchoolId} /> Write new component to search with zip*/}
          </div>
        )}
      </div>
    </div>
  );
}

SchoolDataInputs.propTypes = {
  fieldNames: PropTypes.object,
};
