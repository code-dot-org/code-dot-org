import React from 'react';
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacher1819ApplicationConstants';
import {isEmail, isZipCode} from '@cdo/apps/util/formatValidation';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import {
  Row,
  Col,
  ControlLabel,
  FormGroup
} from 'react-bootstrap';
import {styles} from './TeacherApplicationConstants';

export default class Section2YourSchool extends LabeledFormComponent {
  static labels = PageLabels.section2YourSchool;

  static associatedFields = [
    ...Object.keys(PageLabels.section2YourSchool),
    "currentRole_other",
    "gradesTeaching_notTeachingExplanation",
    "gradesTeaching_other",
    "gradesExpectToTeach_notExpectingToTeachExplanation",
    "gradesExpectToTeach_other",
    "subjectsTeaching_other",
    "subjectsExpectToTeach_other",
    "subjectsLicensedToTeach_other",
    "taughtInPast_other",
    "csOfferedAtSchool_other",
    "csOpportunitiesAtSchool_other"
  ];

  /**
   * @override
   */
  handleChange(newState) {
    if (newState.school || newState.schoolState || newState.schoolZipCode) {
      // School info changed? Clear page 4 partner and workshop mapping
      newState.ableToAttendSingle = undefined;
      newState.ableToAttendMultiple = undefined;
      newState.alternateWorkshops = undefined;
    }

    super.handleChange(newState);
  }

  handleSchoolChange = selectedSchool => {
    this.handleChange({school: selectedSchool && selectedSchool.value});
  };

  render() {
    return (
      <FormGroup>
        <h3>Section 2: {SectionHeaders.section2YourSchool}</h3>

        <p>
          If you work in a school district, please select your district and school below:
        </p>

        <FormGroup
          id="school"
          controlId="school"
          validationState={this.getValidationState("school")}
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

        {this.props.data.school && this.props.data.school === '-1' &&
          <div style={styles.indented}>
            {this.inputFor("schoolName")}
            {this.inputFor("schoolDistrictName")}
            {this.inputFor("schoolAddress")}
            {this.inputFor("schoolCity")}
            {this.selectFor("schoolState", {placeholder: "Select a state"})}
            {this.inputFor("schoolZipCode")}
            {this.radioButtonsFor("schoolType")}
          </div>
        }

        {
          // Disable auto complete for principal fields, so they are not filled with the teacher's details.
          // Using a custom unmatched string "never" instead of "off" for wider browser compatibility.
          // See https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion#Disabling_autocompletion
        }
        {this.inputFor("principalFirstName", {autoComplete: "never"})}
        {this.inputFor("principalLastName", {autoComplete: "never"})}
        {this.selectFor("principalTitle", {
          placeholder: "Select a title",
          required: false,
          autoComplete: "never"
        })}
        {this.inputFor("principalEmail", {autoComplete: "never"})}
        {this.inputFor("principalConfirmEmail", {autoComplete: "never"})}
        {this.usPhoneNumberInputFor("principalPhoneNumber", {autoComplete: "never"})}

        {this.radioButtonsWithAdditionalTextFieldsFor("currentRole", {
          [TextFields.otherPleaseList] : "other"
        })}

        {this.checkBoxesFor("gradesAtSchool")}

        {this.checkBoxesWithAdditionalTextFieldsFor("gradesTeaching", {
          [TextFields.notTeachingThisYear] : "notTeachingExplanation",
          [TextFields.otherPleaseExplain] : "other"
        })}

        {this.checkBoxesWithAdditionalTextFieldsFor("gradesExpectToTeach", {
          [TextFields.notTeachingNextYear] : "notExpectingToTeachExplanation",
          [TextFields.otherPleaseExplain] : "other"
        })}

        {this.checkBoxesWithAdditionalTextFieldsFor("subjectsTeaching", {
          [TextFields.otherPleaseList] : "other"
        })}

        {this.checkBoxesWithAdditionalTextFieldsFor("subjectsExpectToTeach", {
          [TextFields.otherPleaseList] : "other"
        })}

        <p style={styles.formText}>
          Requirements for licensing, certifications, and endorsements to teach computer science vary widely
          across the country. Please answer the following questions to the best of your knowledge, so that
          your Regional Partner can ensure that teachers selected for this program will be able to teach the
          course in the coming school year.
        </p>
        <p style={styles.formText}>
          Note: Code.org does not require specific licenses to teach these courses, but to participate in this
          program, you must be able to teach this course during the 2018-19 school year.
        </p>

        {this.radioButtonsFor("doesSchoolRequireCsLicense")}
        {this.props.data.doesSchoolRequireCsLicense && this.props.data.doesSchoolRequireCsLicense === 'Yes' &&
          <div style={styles.indented}>
            {this.inputFor("whatLicenseRequired")}
          </div>
        }

        {this.radioButtonsFor("haveCsLicense")}

        {this.checkBoxesWithAdditionalTextFieldsFor("subjectsLicensedToTeach", {
          [TextFields.otherPleaseList] : "other"
        })}

        {this.checkBoxesWithAdditionalTextFieldsFor("taughtInPast", {
          [TextFields.otherPleaseList] : "other"
        })}

        {this.checkBoxesFor("previousYearlongCdoPd")}

        {this.checkBoxesWithAdditionalTextFieldsFor("csOfferedAtSchool", {
          [TextFields.otherPleaseList] : "other"
        })}

        {this.checkBoxesWithAdditionalTextFieldsFor("csOpportunitiesAtSchool", {
          [TextFields.otherWithText] : "other"
        })}

      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];

    if (data.doesSchoolRequireCsLicense === 'Yes') {
      requiredFields.push(
        "whatLicenseRequired"
      );
    }

    if (data.school && data.school === '-1') {
      requiredFields.push(
        "schoolName",
        "schoolDistrictName",
        "schoolAddress",
        "schoolCity",
        "schoolState",
        "schoolZipCode",
        "schoolType"
      );
    }

    return requiredFields;
  }

  /**
   * @override
   */
  static getErrorMessages(data) {
    const formatErrors = {};

    if (data.school && data.school === '-1' && data.schoolZipCode && !isZipCode(data.schoolZipCode)) {
      formatErrors.schoolZipCode = "Must be a valid zip code";
    }

    if (data.principalEmail) {
      if (!isEmail(data.principalEmail)) {
        formatErrors.principalEmail = "Must be a valid email address";
      }
      if (data.principalConfirmEmail && data.principalEmail !== data.principalConfirmEmail) {
        formatErrors.principalConfirmEmail = "Must match the principal email";
      }
    }

    return formatErrors;
  }

  /**
   * @override
   */
  static processPageData(data) {
    const changes = {};

    if (data.school && data.school !== '-1') {
      changes.schoolName = undefined;
      changes.schoolDistrictName = undefined;
      changes.schoolAddress = undefined;
      changes.schoolCity = undefined;
      changes.schoolState = undefined;
      changes.schoolZipCode = undefined;
      changes.schoolType = undefined;
    }

    if (data.doesSchoolRequireCsLicense !== 'Yes') {
      changes.whatLicenseRequired = undefined;
    }

    return changes;
  }
}
