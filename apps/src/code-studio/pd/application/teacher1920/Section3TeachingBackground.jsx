import React from 'react';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import UsPhoneNumberInput from '../../form_components/UsPhoneNumberInput';
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacher1920ApplicationConstants';
import {Row, Col, ControlLabel, FormGroup} from 'react-bootstrap';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import {isEmail} from '@cdo/apps/util/formatValidation';
import {styles} from './TeacherApplicationConstants';

export default class Section3TeachingBackground extends LabeledFormComponent {
  static labels = {
    ...PageLabels.section3TeachingBackground,
    ...PageLabels.section1AboutYou
  };

  static associatedFields = [
    ...Object.keys(PageLabels.section3TeachingBackground),
    'school',
    'schoolName',
    'schoolDistrictName',
    'schoolAddress',
    'schoolCity',
    'schoolState',
    'schoolZipCode',
    'schoolType',
    'principalTitle',
    'principalFirstName',
    'principalLastName',
    'principalEmail',
    'principalConfirmEmail',
    'principalPhoneNumber',
    'currentRole'
  ];

  handleSchoolChange = selectedSchool =>
    this.handleChange({school: selectedSchool && selectedSchool.value});

  render() {
    return (
      <FormGroup>
        <h3>Section 2: {SectionHeaders.section3TeachingBackground}</h3>

        <p>Please provide your school and principal information below:</p>

        <FormGroup
          id="school"
          controlId="school"
          validationState={this.getValidationState('school')}
        >
          <Row>
            <Col md={6}>
              <ControlLabel>
                School
                <span style={{color: 'red'}}> *</span>
              </ControlLabel>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <SchoolAutocompleteDropdown
                value={this.props.data.school}
                onChange={this.handleSchoolChange}
              />
            </Col>
          </Row>
        </FormGroup>

        {this.props.data.school && this.props.data.school === '-1' && (
          <div style={styles.indented}>
            {this.inputFor('schoolName')}
            {this.inputFor('schoolDistrictName')}
            {this.inputFor('schoolAddress')}
            {this.inputFor('schoolCity')}
            {this.selectFor('schoolState', {placeholder: 'Select a state'})}
            {this.inputFor('schoolZipCode')}
            {this.radioButtonsFor('schoolType')}
          </div>
        )}

        {
          // Disable auto complete for principal fields, so they are not filled with the teacher's details.
          // Using a custom unmatched string "never" instead of "off" for wider browser compatibility.
          // See https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion#Disabling_autocompletion
        }
        {this.inputFor('principalFirstName', {autoComplete: 'never'})}
        {this.inputFor('principalLastName', {autoComplete: 'never'})}
        {this.inputFor('principalEmail', {autoComplete: 'never'})}
        {this.inputFor('principalConfirmEmail', {autoComplete: 'never'})}
        {this.usPhoneNumberInputFor('principalPhoneNumber', {
          autoComplete: 'never'
        })}

        {this.radioButtonsWithAdditionalTextFieldsFor('currentRole', {
          [TextFields.otherPleaseList]: 'other'
        })}

        {this.checkBoxesWithAdditionalTextFieldsFor(
          'subjectsTeaching',
          {
            [TextFields.otherPleaseList]: 'other'
          },
          {
            columnCount: 3
          }
        )}
        <p>
          Requirements for licensing, certifications, and endorsements to teach
          computer science vary widely across the country. Please answer the
          following questions to the best of your knowledge, so that your
          Regional Partner can ensure that teachers selected for this program
          will be able to teach the course in the coming school year.
        </p>
        <p>
          Note: Code.org does not require specific licenses to teach these
          courses, but to participate in this program, you should be planning to
          teach this course during the 2019-20 school year.
        </p>
        {this.radioButtonsFor('doesSchoolRequireCsLicense')}
        {this.props.data.doesSchoolRequireCsLicense === 'Yes' &&
          this.largeInputFor('whatLicenseRequired')}
        {this.radioButtonsFor('haveCsLicense')}
        {this.checkBoxesWithAdditionalTextFieldsFor(
          'subjectsLicensedToTeach',
          {
            [TextFields.otherPleaseList]: 'other'
          },
          {
            columnCount: 3
          }
        )}
        {this.checkBoxesWithAdditionalTextFieldsFor(
          'taughtInPast',
          {
            [TextFields.otherPleaseList]: 'other'
          },
          {
            columnCount: 3
          }
        )}
        {this.checkBoxesFor('previousYearlongCdoPd')}
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];

    if (data.doesSchoolRequireCsLicense === 'Yes') {
      requiredFields.push('whatLicenseRequired');
    }
    return requiredFields;
  }

  /**
   * @override
   */
  static processPageData(data) {
    const changes = {};

    if (data.doesSchoolRequireCsLicense !== 'Yes') {
      changes.whatLicenseRequired = undefined;
    }

    return changes;
  }

  /**
   * @override
   */
  static getErrorMessages(data) {
    const formatErrors = {};

    if (!UsPhoneNumberInput.isValid(data.principalPhoneNumber)) {
      formatErrors.principalPhoneNumber =
        'Must be a valid phone number including area code';
    }

    if (!isEmail(data.principalEmail)) {
      formatErrors.principalEmail = 'Must be a valid email address';
    }

    if (data.principalEmail !== data.principalConfirmEmail) {
      formatErrors.principalConfirmEmail = 'Must match above email';
    }

    return formatErrors;
  }
}
