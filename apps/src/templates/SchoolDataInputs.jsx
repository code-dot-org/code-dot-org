import React, {useState} from 'react';
import i18n from '@cdo/locale';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import style from './school-association.module.scss';
import SimpleDropdown from '../componentLibrary/simpleDropdown/SimpleDropdown';
import {COUNTRIES} from '@cdo/apps/geographyConstants';

const TEST_SCHOOL_DATA = [{value: 'test', text: 'VeryLongNameTestSchool'}];

export default function SchoolDataInputs() {
  const [country, setCountry] = useState('');
  const [zip, setZip] = useState('');
  const [schoolData, setSchoolData] = useState({
    ncesSchoolId: '',
    schoolName: '',
    schoolCity: '',
    schoolState: '',
    schoolLocation: '',
    displayData: '',
  });
  let COUNTRY_ITEMS = [];
  for (const item of Object.values(COUNTRIES)) {
    COUNTRY_ITEMS.push({value: item.label, text: item.value});
  }

  const onCountryChange = e => {
    const newCountry = e.target.value;
    setCountry(newCountry);
  };

  const onZipChange = e => {
    const newZip = e.target.value;
    setZip(newZip);
  };

  const onSchoolChange = e => {
    const newSchool = e.target.value;
    setSchoolData(newSchool);
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
          onChange={onCountryChange}
          size="m"
        />
        <BodyTwoText className={style.padding} visualAppearance={'heading-xs'}>
          {i18n.enterYourSchoolZip()}
        </BodyTwoText>
        <input
          type="text"
          placeholder={'i.e. 98104'}
          onChange={onZipChange}
          value={zip}
        />
        <BodyTwoText className={style.padding} visualAppearance={'heading-xs'}>
          {i18n.selectYourSchool()}
        </BodyTwoText>
        <SimpleDropdown
          className={style.dropdown}
          items={TEST_SCHOOL_DATA}
          name="schoolDropdown"
          selectedValue={schoolData.displayData}
          onChange={onSchoolChange}
          size="m"
        />
      </div>
    </div>
  );
}
