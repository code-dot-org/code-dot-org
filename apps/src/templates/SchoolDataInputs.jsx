import PropTypes from 'prop-types';
import React from 'react';
import CountryAutocompleteDropdown from '@cdo/apps/templates/CountryAutocompleteDropdown';
import SchoolTypeDropdown from '@cdo/apps/templates/SchoolTypeDropdown';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';
import SchoolNotFound from '@cdo/apps/templates/SchoolNotFound';
import i18n from '@cdo/locale';

export const SCHOOL_TYPES_HAVING_NCES_SEARCH = ['charter', 'private', 'public'];

export const SCHOOL_TYPES_HAVING_NAMES = [
  'charter',
  'private',
  'public',
  'afterschool',
  'organization',
];

export default function SchoolDataInputs({
  onCountryChange,
  onSchoolTypeChange,
  onSchoolChange,
  onSchoolNotFoundChange,
  country,
  schoolType,
  ncesSchoolId,
  schoolName,
  schoolCity,
  schoolState,
  schoolZip,
  schoolLocation,
  useLocationSearch,
  fieldNames,
  showErrors,
  showRequiredIndicator,
  styles,
}) {
  const defaultProps = {
    schoolType: '',
    country: '',
    ncesSchoolId: '',
    schoolName: '',
    schoolCity: '',
    schoolState: '',
    schoolZip: '',
    schoolLocation: '',
    useLocationSearch: false,
    fieldNames: {
      schoolType: 'user[school_info_attributes][school_type]',
      country: 'user[school_info_attributes][country]',
      ncesSchoolId: 'user[school_info_attributes][school_id]',
      schoolName: 'user[school_info_attributes][school_name]',
      schoolState: 'user[school_info_attributes][school_state]',
      schoolZip: 'user[school_info_attributes][school_zip]',
      googleLocation: 'user[school_info_attributes][full_address]',
    },
  };

  const bindSchoolNotFound = snf => {
    this.schoolNotFound = snf;
  };

  const isSchoolAutocompleteDropdownValid = () => {
    if (!ncesSchoolId) {
      return false;
    }

    if (ncesSchoolId === '-1') {
      return isSchoolNotFoundValid();
    } else {
      return true;
    }
  };

  const isValid = () => {
    if (!country || !schoolType) {
      return false;
    }

    if (
      country === 'United States' &&
      SCHOOL_TYPES_HAVING_NCES_SEARCH.includes(schoolType)
    ) {
      return isSchoolAutocompleteDropdownValid();
    } else {
      return isSchoolNotFoundValid();
    }
  };

  const isSchoolNotFoundValid = () => {
    return this.schoolNotFound.isValid();
  };

  const isUS = country === 'United States';
  const outsideUS = !isUS;
  const ncesInfoNotFound = ncesSchoolId === '-1';
  const noDropdownForSchoolType =
    !SCHOOL_TYPES_HAVING_NCES_SEARCH.includes(schoolType) && schoolType !== '';
  const askForName = SCHOOL_TYPES_HAVING_NAMES.includes(schoolType);

  // Added condition to show required field indicator(asterisk)
  // only when type is NCES. If non-US or US, non-NCES school,
  // type field is not required (asterisk is not shown).
  let isNcesSchool = false;
  const ncesSchoolType = ['public', 'private', 'charter'];
  if (ncesSchoolType.includes(schoolType)) {
    isNcesSchool = true;
  }
  const schoolNameLabel = ['afterschool', 'organization'].includes(schoolType)
    ? i18n.signupFormSchoolOrOrganization()
    : i18n.schoolName();

  return (
    <div style={{width: 600, ...styles}}>
      <CountryAutocompleteDropdown
        onChange={onCountryChange}
        value={country}
        fieldName={fieldNames.country}
        showErrorMsg={showErrors}
        showRequiredIndicator={showRequiredIndicator}
        singleLineLayout
        maxHeight={160}
      />
      <SchoolTypeDropdown
        value={schoolType}
        fieldName={fieldNames.schoolType}
        country={country}
        onChange={onSchoolTypeChange}
        showErrorMsg={showErrors}
        showRequiredIndicator={showRequiredIndicator}
      />
      {isUS && SCHOOL_TYPES_HAVING_NCES_SEARCH.includes(schoolType) && (
        <SchoolAutocompleteDropdownWithLabel
          setField={onSchoolChange}
          value={ncesSchoolId}
          fieldName={fieldNames.ncesSchoolId}
          showErrorMsg={showErrors}
          singleLineLayout
          showRequiredIndicator={showRequiredIndicator}
        />
      )}
      {(outsideUS || ncesInfoNotFound || noDropdownForSchoolType) && (
        <SchoolNotFound
          ref={bindSchoolNotFound}
          onChange={onSchoolNotFoundChange}
          isNcesSchool={isNcesSchool}
          schoolName={askForName ? schoolName : SchoolNotFound.OMIT_FIELD}
          schoolType={SchoolNotFound.OMIT_FIELD}
          schoolCity={SchoolNotFound.OMIT_FIELD}
          schoolState={isUS ? schoolState : SchoolNotFound.OMIT_FIELD}
          schoolZip={isUS ? schoolZip : SchoolNotFound.OMIT_FIELD}
          schoolLocation={schoolLocation}
          country={country}
          controlSchoolLocation={true}
          fieldNames={fieldNames}
          showErrorMsg={showErrors}
          singleLineLayout
          showRequiredIndicators={showRequiredIndicator}
          schoolNameLabel={schoolNameLabel}
          useLocationSearch={useLocationSearch}
        />
      )}
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
