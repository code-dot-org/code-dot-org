import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import style from './school-association.module.scss';
import SimpleDropdown from '../componentLibrary/simpleDropdown/SimpleDropdown';
import {COUNTRIES} from '@cdo/apps/geographyConstants';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import SchoolNotFound from '@cdo/apps/templates/SchoolNotFound';

export default function SchoolDataInputs(
  onCountryChange,
  onSchoolChange,
  onSchoolNotFoundChange,
  country,
  ncesSchoolId,
  schoolName,
  schoolState,
  schoolZip,
  schoolLocation,
  useLocationSearch,
  fieldNames,
  showErrors,
  showRequiredIndicator
) {
  const [askForZip, setAskForZip] = useState(false);
  const [isOutsideUS, setIsOutsideUS] = useState(false);
  const [zip, setZip] = useState(schoolZip || '');
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

  const updateCountry = country => {
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
          items={COUNTRY_ITEMS}
          name="countryDropdown"
          selectedValue={country}
          onChange={e => {
            onCountryChange;
            updateCountry(e.target.value);
          }}
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
            <SchoolNotFound
              onChange={onSchoolNotFoundChange}
              isNcesSchool={false}
              schoolName={schoolName}
              schoolType={SchoolNotFound.OMIT_FIELD}
              schoolCity={SchoolNotFound.OMIT_FIELD}
              schoolState={SchoolNotFound.OMIT_FIELD}
              schoolZip={SchoolNotFound.OMIT_FIELD}
              schoolLocation={schoolLocation}
              country={country}
              controlSchoolLocation={true}
              fieldNames={fieldNames}
              showErrorMsg={showErrors}
              singleLineLayout
              showRequiredIndicators={showRequiredIndicator}
              schoolNameLabel={schoolName}
              useLocationSearch={useLocationSearch}
            />
          </div>
        )}
        {zipSearchReady && (
          <div>
            <BodyTwoText
              className={style.padding}
              visualAppearance={'heading-xs'}
            >
              {i18n.selectYourSchool()}
            </BodyTwoText>
            <SchoolAutocompleteDropdown
              value={ncesSchoolId}
              disabled={!zipSearchReady}
              onChange={onSchoolChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

SchoolDataInputs.propTypes = {
  onCountryChange: PropTypes.func.isRequired,
  onSchoolChange: PropTypes.func.isRequired,
  onSchoolNotFoundChange: PropTypes.func.isRequired,
  country: PropTypes.string,
  ncesSchoolId: PropTypes.string,
  schoolName: PropTypes.string,
  schoolCity: PropTypes.string,
  schoolState: PropTypes.string,
  schoolZip: PropTypes.string,
  schoolLocation: PropTypes.string,
  useLocationSearch: PropTypes.bool,
  fieldNames: PropTypes.object,
  showErrors: PropTypes.bool,
  showRequiredIndicator: PropTypes.bool,
};
