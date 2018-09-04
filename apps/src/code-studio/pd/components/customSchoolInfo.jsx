import React, {PropTypes} from 'react';
import {FormGroup, ControlLabel, HelpBlock} from 'react-bootstrap';
import Select from "react-select";
import {ButtonList} from '../form_components/ButtonList.jsx';
import FieldGroup from '../form_components/FieldGroup';
import {STATES} from '../../../geographyConstants';
import {SchoolInfoPropType} from './constants';

const VALIDATION_STATE_ERROR = "error";

const SCHOOL_TYPES = {
  PUBLIC: "Public school",
  PRIVATE: "Private school",
  CHARTER: "Charter school",
  OTHER: "Other"
};

export default class CustomSchoolInfo extends React.Component {
  static propTypes = {
    school_info: SchoolInfoPropType,
    onSchoolInfoChange: PropTypes.func.isRequired,
    errors: PropTypes.object
  };

  handleSchoolStateChange = (selection) => {
    const school_info = {...this.props.school_info, ...{school_state: selection.value}};
    this.props.onSchoolInfoChange({school_info});
  };

  handleSchoolInfoChange = (change) => {
    const school_info = {...this.props.school_info, ...change};
    this.props.onSchoolInfoChange({school_info});
  };

  handleSchoolDistrictChange = (change) => {
    const school_info = {...this.props.school_info, ...change};
    school_info.school_district_other = "true";
    this.props.onSchoolInfoChange({school_info});
  };

  handleSchoolTypeChange = (change) => {
    const school_info = {...this.props.school_info, ...change};
    if ([SCHOOL_TYPES.PRIVATE, SCHOOL_TYPES.OTHER].includes(change["school_type"])) {
      delete(school_info.school_district_other);
      delete(school_info.school_district_name);
    }
    this.props.onSchoolInfoChange({school_info});
  };

  render() {
    return (
      <FormGroup>
        <FieldGroup
          id="school_name"
          label="School Name"
          type="text"
          required={true}
          onChange={this.handleSchoolInfoChange}
          validationState={this.props.errors.hasOwnProperty("school_name") ? VALIDATION_STATE_ERROR : null}
          errorMessage={this.props.errors.school_name}
        />
        <ButtonList
          key="school_type"
          answers={Object.values(SCHOOL_TYPES)}
          groupName="school_type"
          label="My school is a"
          onChange={this.handleSchoolTypeChange}
          selectedItems={this.props.school_info ? this.props.school_info.school_type : null}
          validationState={this.props.errors.hasOwnProperty("school_type") ? VALIDATION_STATE_ERROR : null}
          errorText={this.props.errors.school_type}
          type="radio"
          required={true}
        />
        {
          this.props.school_info && [SCHOOL_TYPES.PUBLIC, SCHOOL_TYPES.CHARTER].includes(this.props.school_info.school_type) &&
          <FieldGroup
            id="school_district_name"
            label="School District"
            type="text"
            required={true}
            onChange={this.handleSchoolDistrictChange}
            validationState={this.props.errors.hasOwnProperty("school_district_name") ? VALIDATION_STATE_ERROR : null}
            errorMessage={this.props.errors.school_district}
          />
        }
        {
          this.props.school_info && this.props.school_info.school_type &&
          <FormGroup>
            <FormGroup
              id="school_state"
              validationState={this.props.errors.hasOwnProperty("school_state") ? VALIDATION_STATE_ERROR : null}
            >
              <ControlLabel>School State<span className="form-required-field"> *</span></ControlLabel>
              <Select
                value={this.props.school_info ? this.props.school_info.school_state : null}
                onChange={this.handleSchoolStateChange}
                options={STATES.map(v => ({value: v, label: v}))}
                clearable={false}
              />
              <HelpBlock>{this.props.errors.school_state}</HelpBlock>
            </FormGroup>
            <FieldGroup
              id="school_zip"
              label="School Zip Code"
              type="text"
              required={true}
              onChange={this.handleSchoolInfoChange}
              validationState={this.props.errors.hasOwnProperty("school_zip") ? VALIDATION_STATE_ERROR : null}
              errorMessage={this.props.errors.school_zip}
            />
          </FormGroup>
        }
      </FormGroup>
    );
  }
}
