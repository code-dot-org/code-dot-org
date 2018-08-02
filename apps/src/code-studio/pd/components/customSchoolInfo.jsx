import React, {PropTypes} from 'react';
import {FormGroup, ControlLabel, HelpBlock} from 'react-bootstrap';
import Select from "react-select";
import {ButtonList} from '../form_components/ButtonList.jsx';
import FieldGroup from '../form_components/FieldGroup';
import {STATES} from '../../../geographyConstants';
import {SCHOOL_TYPES, ERROR} from '../workshop_enrollment/enrollmentConstants';

export default class CustomSchoolInfo extends React.Component {
  static propTypes = {
    schoolInfo: PropTypes.object,
    handleSchoolInfoChange: PropTypes.func,
    handleSchoolStateChange: PropTypes.func,
    handleSchoolDistrictChange: PropTypes.func,
    handleSchoolTypeChange: PropTypes.func,
    errors: PropTypes.object
  };

  render() {
    return (
      <FormGroup>
        <FieldGroup
          id="school_name"
          label="School Name"
          type="text"
          required={true}
          onChange={this.props.handleSchoolInfoChange}
          validationState={this.props.errors.hasOwnProperty("school_name") ? ERROR : null}
          errorMessage={this.props.errors.school_name}
        />
        <ButtonList
          key="school_type"
          answers={Object.values(SCHOOL_TYPES)}
          groupName="school_type"
          label="My school is a"
          onChange={this.props.handleSchoolTypeChange}
          selectedItems={this.props.schoolInfo ? this.props.schoolInfo.school_type : null}
          validationState={this.props.errors.hasOwnProperty("school_type") ? ERROR : null}
          errorText={this.props.errors.school_type}
          type="radio"
          required={true}
        />
        {
          [SCHOOL_TYPES.PUBLIC, SCHOOL_TYPES.CHARTER].includes(this.props.schoolInfo.school_type) &&
          <FieldGroup
            id="school_district_name"
            label="School District"
            type="text"
            required={true}
            onChange={this.props.handleSchoolDistrictChange}
            validationState={this.props.errors.hasOwnProperty("school_district_name") ? ERROR : null}
            errorMessage={this.props.errors.school_district}
          />
        }
        {
          this.props.schoolInfo.school_type &&
          <FormGroup>
            <FormGroup
              id="school_state"
              validationState={this.props.errors.hasOwnProperty("school_state") ? ERROR : null}
            >
              <ControlLabel>School State<span className="form-required-field"> *</span></ControlLabel>
              <Select
                value={this.props.schoolInfo ? this.props.schoolInfo.school_state : null}
                onChange={this.props.handleSchoolStateChange}
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
              onChange={this.props.handleSchoolInfoChange}
              validationState={this.props.errors.hasOwnProperty("school_zip") ? ERROR : null}
              errorMessage={this.props.errors.school_zip}
            />
          </FormGroup>
        }
      </FormGroup>
    );
  }
}
