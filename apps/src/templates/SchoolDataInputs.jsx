import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import {
  Heading2,
  BodyOneText,
  Heading6,
} from '@cdo/apps/componentLibrary/typography';
import style from './school-association.module.scss';
import SimpleDropdown from '../componentLibrary/simpleDropdown/SimpleDropdown';
import {COUNTRIES} from '@cdo/apps/geographyConstants';

const TEST_SCHOOL_DATA = [{value: 'test', text: 'TestSchool'}];
export default function SchoolDataInputs({
  onCountryChange,
  onSchoolChange,
  onSchoolNotFoundChange,
  country = '',
  schoolType = '',
  ncesSchoolId = '',
  schoolName = '',
  schoolCity = '',
  schoolState = '',
  schoolZip = '',
  schoolLocation = '',
  useLocationSearch = false,
  fieldNames = {
    schoolType: 'user[school_info_attributes][school_type]',
    country: 'user[school_info_attributes][country]',
    ncesSchoolId: 'user[school_info_attributes][school_id]',
    schoolName: 'user[school_info_attributes][school_name]',
    schoolState: 'user[school_info_attributes][school_state]',
    schoolZip: 'user[school_info_attributes][school_zip]',
    googleLocation: 'user[school_info_attributes][full_address]',
  },
  showErrors,
  showRequiredIndicator,
}) {
  let COUNTRY_ITEMS = [];
  for (const item of Object.values(COUNTRIES)) {
    COUNTRY_ITEMS.push({value: item.label, text: item.value});
  }

  return (
    <div className={style.outerContainer}>
      <Heading2>{i18n.censusHeading()}</Heading2>
      <BodyOneText>{i18n.findYourSchool()}</BodyOneText>
      <div className={style.inputContainer}>
        <Heading6 className={style.topPadding}>{i18n.whatCountry()}</Heading6>
        <SimpleDropdown
          items={COUNTRY_ITEMS}
          name="countryDropdown"
          selectedValue={country}
          onChange={onCountryChange}
          size="s"
        />
        <Heading6 className={style.topPadding}>
          {i18n.enterYourSchoolZip()}
        </Heading6>
        <input
          type="text"
          placeholder={'i.e. 98104'}
          onChange={() => {}}
          value={null}
        />
        <Heading6 className={style.topPadding}>
          {i18n.selectYourSchool()}
        </Heading6>
        <SimpleDropdown
          items={TEST_SCHOOL_DATA}
          name="schoolDropdown"
          selectedValue={'test'}
          onChange={() => {}}
          size="s"
        />
      </div>
    </div>
  );
}

SchoolDataInputs.propTypes = {
  onCountryChange: PropTypes.func.isRequired,
  onSchoolTypeChange: PropTypes.func.isRequired,
  onSchoolChange: PropTypes.func.isRequired,
  onSchoolNotFoundChange: PropTypes.func.isRequired,
  country: PropTypes.string,
  schoolType: PropTypes.string,
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
  styles: PropTypes.object,
};
