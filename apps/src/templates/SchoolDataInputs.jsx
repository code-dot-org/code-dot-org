import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import {Heading1, Heading2, Heading3} from '@cdo/apps/lib/ui/Headings';
import style from './school-association.module.scss';
import SimpleDropdown from '../componentLibrary/simpleDropdown/SimpleDropdown';
import {COUNTRIES} from '@cdo/apps/geographyConstants';
import SearchBar from './SearchBar';

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
      <Heading1>{i18n.censusHeading()}</Heading1>
      <Heading2>{i18n.findYourSchool()}</Heading2>
      <div className={style.inputContainer}>
        <Heading3>{i18n.whatCountry()}</Heading3>
        <SimpleDropdown
          items={COUNTRY_ITEMS}
          name="countryDropdown"
          selectedValue={country}
          onChange={onCountryChange}
          size="s"
        />
        <Heading3>{i18n.enterYourSchoolZip()}</Heading3>
        <SearchBar
          placeholderText={''}
          onChange={() => {}}
          clearButton={true}
        />
        <Heading3>{i18n.selectYourSchool()}</Heading3>
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
