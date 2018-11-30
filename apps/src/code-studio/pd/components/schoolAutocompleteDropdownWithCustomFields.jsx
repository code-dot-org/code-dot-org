/*
 * Autocomplete school dropdown with
 * custom fields if school not found
 */
import React, {PropTypes} from 'react';
import {FormGroup, Row, Col, ControlLabel, HelpBlock} from 'react-bootstrap';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import CustomSchoolInfo from './customSchoolInfo';
import {SchoolInfoPropType} from './constants';
import {isZipCode} from '@cdo/apps/util/formatValidation';


const VALIDATION_STATE_ERROR = "error";
const OTHER_SCHOOL_VALUE = "-1";

export default class SchoolAutocompleteDropdownWithCustomFields extends React.Component {
  static propTypes = {
    school_info: SchoolInfoPropType,
    onSchoolInfoChange: PropTypes.func.isRequired,
    errors: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      showCustomFields: false
    };
  }

  handleSchoolDropdownChange = (selection) => {
    const showCustomFields = !!(selection && selection.value === OTHER_SCHOOL_VALUE);
    this.setState({showCustomFields});
    if (!showCustomFields && selection) {
        this.props.onSchoolInfoChange({
          school_info: {
            school_id: selection.school.nces_id,
            school_name: selection.school.name,
            school_state: selection.school.state,
            school_zip: selection.school.zip,
            school_type: selection.school.school_type
          }
        });
    } else {
      this.props.onSchoolInfoChange({school_info: {}});
    }
  };

  render() {
    return (
      <div>
        {!this.state.showCustomFields &&
          <FormGroup
            id="school_id"
            validationState={this.props.errors.hasOwnProperty("school_id") ? VALIDATION_STATE_ERROR : null}
          >
            <Row>
              <Col md={6}>
                <ControlLabel>
                  School
                  <span className="form-required-field"> *</span>
                </ControlLabel>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <SchoolAutocompleteDropdown
                  value={this.props.school_info && this.props.school_info.school_id}
                  onChange={this.handleSchoolDropdownChange}
                />
              </Col>
            </Row>
            <HelpBlock>{this.props.errors.school_id}</HelpBlock>
          </FormGroup>
        }
        {this.state.showCustomFields &&
          <CustomSchoolInfo
            school_info={this.props.school_info}
            onSchoolInfoChange={this.props.onSchoolInfoChange}
            errors={this.props.errors}
          />
        }
      </div>
    );
  }

 /*
  * Returns an object containing the fields with errors in the form
  * {"field_id": "error message"}
  * If a required field is missing, the error message is an empty string
  */
  static validate(school_info) {
    let errors = [];

    if (!school_info) {
      return {school_id: ''};
    }

    const requiredFields = [
      'school_name',
      'school_state',
      'school_zip',
      'school_type'
    ];

    if (["Public school", "Charter school"].includes(school_info.school_type)) {
      requiredFields.push('school_district_name');
    }

    const missingRequiredFields = requiredFields.filter(f => {
      if (school_info && requiredFields.includes(f)) {
        return !school_info[f];
      }
    });

    if (school_info && school_info.school_zip) {
      if (!isZipCode(school_info.school_zip)) {
        errors.school_zip = "Must be a valid zip code";
      }
    }

    if (missingRequiredFields.length || Object.keys(errors).length) {
      let requiredFieldsErrors = {};
      missingRequiredFields.forEach((f) => {
        requiredFieldsErrors[f] = '';
      });
      errors = {...errors, ...requiredFieldsErrors};
    }
    return errors;
  }
}
