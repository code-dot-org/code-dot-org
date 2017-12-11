import React, { Component, PropTypes } from 'react';
import CountryAutocompleteDropdown from '@cdo/apps/templates/CountryAutocompleteDropdown';
import SchoolTypeDropdown from '@cdo/apps/templates/SchoolTypeDropdown';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';
import SchoolNotFound from '@cdo/apps/templates/SchoolNotFound';
import i18n from "@cdo/locale";

const SCHOOL_TYPES_HAVING_NCES_SEARCH = ['charter', 'private', 'public'];

const SCHOOL_TYPES_HAVING_NAMES = [
  'charter',
  'private',
  'public',
  'afterschool',
  'organization',
];

export default class SchoolInfoInputs extends Component {
  static propTypes = {
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
    useGoogleLocationSearch: PropTypes.bool,
    fieldNames: PropTypes.object,
    showErrors: PropTypes.bool,
    showRequiredIndicator: PropTypes.bool,
  };

  static defaultProps = {
    schoolType: "",
    country: "",
    ncesSchoolId: "",
    schoolName: "",
    schoolCity: "",
    schoolState: "",
    schoolZip: "",
    useGoogleLocationSearch: false,
    fieldNames: {
      schoolType: "user[school_info_attributes][school_type]",
      country: "user[school_info_attributes][country]",
      ncesSchoolId: "user[school_info_attributes][school_id]",
      schoolName: "user[school_info_attributes][school_name]",
      schoolState: "user[school_info_attributes][school_state]",
      schoolZip: "user[school_info_attributes][school_zip]",
      googleLocation: "user[school_info_attributes][full_address]",
    },
  };

  constructor() {
    super();
    this.bindSchoolNotFound = this.bindSchoolNotFound.bind(this);
  }

  isSchoolNotFoundValid() {
    return this.schoolNotFound.isValid();
  }

  isSchoolAutocompleteDropdownValid() {
    if (!this.props.ncesSchoolId) {
      return false;
    }

    if (this.props.ncesSchoolId === "-1") {
      return this.isSchoolNotFoundValid();
    } else {
      return true;
    }
  }

  isValid() {
    if (!this.props.country || !this.props.schoolType) {
      return false;
    }

    if ((this.props.country === "United States") &&  SCHOOL_TYPES_HAVING_NCES_SEARCH.includes(this.props.schoolType)) {
      return this.isSchoolAutocompleteDropdownValid();
    } else {
      return this.isSchoolNotFoundValid();
    }
  }

  bindSchoolNotFound(snf) {
    this.schoolNotFound = snf;
  }

  render() {
    const isUS = this.props.country === 'United States';
    const outsideUS = !isUS;
    const ncesInfoNotFound = (this.props.ncesSchoolId === '-1');
    const noDropdownForSchoolType = (
      !SCHOOL_TYPES_HAVING_NCES_SEARCH.includes(this.props.schoolType)
      && this.props.schoolType !== ''
    );
    const askForName = SCHOOL_TYPES_HAVING_NAMES.includes(this.props.schoolType);
    const schoolNameLabel = ['afterschool', 'organization'].includes(this.props.schoolType)
                          ? i18n.signupFormSchoolOrOrganization()
                          : i18n.schoolName();

    return (
      <div style={{width: 600}}>
        <CountryAutocompleteDropdown
          onChange={this.props.onCountryChange}
          value={this.props.country}
          fieldName={this.props.fieldNames.country}
          showErrorMsg={this.props.showErrors}
          showRequiredIndicator={this.props.showRequiredIndicator}
          singleLineLayout
        />
        <SchoolTypeDropdown
          value={this.props.schoolType}
          fieldName={this.props.fieldNames.schoolType}
          onChange={this.props.onSchoolTypeChange}
          showErrorMsg={this.props.showErrors}
          showRequiredIndicator={this.props.showRequiredIndicator}
        />
        {isUS && SCHOOL_TYPES_HAVING_NCES_SEARCH.includes(this.props.schoolType) &&
         <SchoolAutocompleteDropdownWithLabel
           setField={this.props.onSchoolChange}
           value={this.props.ncesSchoolId}
           fieldName={this.props.fieldNames.ncesSchoolId}
           showErrorMsg={this.props.showErrors}
           singleLineLayout
           showRequiredIndicator={this.props.showRequiredIndicator}
         />
        }
        {(outsideUS || ncesInfoNotFound || noDropdownForSchoolType) &&
         !(outsideUS && !askForName) &&
         <SchoolNotFound
           ref={this.bindSchoolNotFound}
           onChange={this.props.onSchoolNotFoundChange}
           schoolName={askForName ? this.props.schoolName : SchoolNotFound.OMIT_FIELD}
           schoolType={SchoolNotFound.OMIT_FIELD}
           schoolCity={SchoolNotFound.OMIT_FIELD}
           schoolState={isUS ? this.props.schoolState : SchoolNotFound.OMIT_FIELD}
           schoolZip={isUS ? this.props.schoolZip : SchoolNotFound.OMIT_FIELD}
           fieldNames={this.props.fieldNames}
           showErrorMsg={this.props.showErrors}
           singleLineLayout
           showRequiredIndicators={this.props.showRequiredIndicator}
           schoolNameLabel={schoolNameLabel}
           useGoogleLocationSearch={this.props.useGoogleLocationSearch}
         />
        }
      </div>
    );
  }
}
