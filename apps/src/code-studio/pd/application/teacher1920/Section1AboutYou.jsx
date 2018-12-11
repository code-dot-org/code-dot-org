import React, {PropTypes} from 'react';
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import UsPhoneNumberInput from "../../form_components/UsPhoneNumberInput";
import {
  PageLabels, SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacher1920ApplicationConstants';
import {isEmail, isZipCode} from '@cdo/apps/util/formatValidation';
import {
  Row,
  Col,
  ControlLabel,
  FormGroup,
  Modal,
  Button
} from 'react-bootstrap';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';
import {styles} from "./TeacherApplicationConstants";
import _ from 'lodash';

const CSD_URL = 'https://code.org/educate/professional-learning/cs-discoveries';
const CSP_URL = 'https://code.org/educate/professional-learning/cs-principles';
const PD_RESOURCES_URL = 'https://support.code.org/hc/en-us/articles/115003865532';
const REGIONAL_PARTNER_URL = '/pd/regional_partner_contact/new';
const CS_TEACHERS_URL = 'https://code.org/educate/community';
const INTERNATIONAL = 'Other country';
const US = 'United States';

export default class Section1AboutYou extends LabeledFormComponent {
  static propTypes = {
    ...LabeledFormComponent.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static labels = PageLabels.section1AboutYou;

  static associatedFields = [
    // Gender Identity and Race are things we want rendered in Section 1 in the detail view
    // but we want to ask in section 5. So they need to be removed here
    ..._.difference(Object.keys(PageLabels.section1AboutYou), ['genderIdentity', 'race'])
  ];

  handleSchoolChange = selectedSchool => this.handleChange({school: selectedSchool && selectedSchool.value});

  resetCountry = () => this.handleChange({country: US});
  exitApplication = () => window.location = PD_RESOURCES_URL;

  renderInternationalModal() {
    return (
      <Modal
        show={this.props.data.country === INTERNATIONAL}
      >
        <Modal.Header>
          <Modal.Title>
            Thank you for your interest in Code.org’s Professional Learning Program.
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          At this time, we are only able to provide this program to teachers in the United States.
          Please visit our website for additional Code.org
          {' '}<a href={PD_RESOURCES_URL} target="_blank">professional development resources</a>{' '}
          and opportunities to connect with other
          {' '}<a href={CS_TEACHERS_URL} target="_blank">computer science teachers</a>.
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.resetCountry} bsStyle="primary">
            Continue as United States Teacher
          </Button>
          <Button onClick={this.exitApplication}>
            Exit Application
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  render() {
    return (
      <FormGroup>
        <p>
          Thanks for your interest in the Code.org Professional Learning Program!
          This application should take 10 - 15 minutes to complete. Fields marked with a
          {' '}<span style={{color: "red"}}>*</span>{' '} are required.
        </p>
        <p>
          If you need more information about the program before you apply,
          please visit
          {' '}<a href={CSD_URL} target="_blank">CS Discoveries</a>{' '}
          and
          {' '}<a href={CSP_URL} target="_blank">CS Principles</a>{' '}
          landing pages. If you’re not sure which program is the right fit for your
          classroom, we encourage you to{' '}
          <a href="https://docs.google.com/document/d/1ASRRQ8Cloyp9kXPBtxa8j5xmXQ0SgLyUCGx2h26WrkQ/edit" target="_blank">
            check out our course and professional learning options.
          </a>
          {' '}For additional questions regarding the program or application, please
          <a href={REGIONAL_PARTNER_URL} target="_blank">
            {' '}contact your Regional Partner.
          </a>
        </p>

        <h3>Section 1: {SectionHeaders.section1AboutYou}</h3>

        {this.radioButtonsFor("country")}

        {this.renderInternationalModal()}

        {this.selectFor("title", {
          required: false,
          placeholder: "Select a title"
        })}

        {this.inputFor("firstName")}
        {this.inputFor("lastName")}

        {this.inputFor("accountEmail", {
          value: this.props.accountEmail,
          readOnly: true
        })}

        {this.inputFor("alternateEmail", {required: false})}

        {this.usPhoneNumberInputFor("phone")}

        {this.inputFor("address")}
        {this.inputFor("city")}
        {this.selectFor("state", {placeholder: "Select a state"})}
        {this.inputFor("zipCode")}

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
        {this.inputFor("principalEmail", {autoComplete: "never"})}
        {this.inputFor("principalConfirmEmail", {autoComplete: "never"})}
        {this.usPhoneNumberInputFor("principalPhoneNumber", {autoComplete: "never"})}

        {this.radioButtonsWithAdditionalTextFieldsFor("currentRole", {
          [TextFields.otherPleaseList] : "other"
        })}
        {this.radioButtonsFor('completingOnBehalfOfSomeoneElse')}
        {
          this.props.data.completingOnBehalfOfSomeoneElse === 'Yes' &&
            this.largeInputFor('completingOnBehalfOfName')
        }
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];

    if (data.completingOnBehalfOfSomeoneElse === 'Yes') {
      requiredFields.push('completingOnBehalfOfName');
    }

    return requiredFields;
  }

  static processPageData(data) {
    const changes = {};
    if (data.completingOnBehalfOfSomeoneElse === 'No') {
      changes.completingOnBehalfOfName = undefined;
    }
  }

  /**
   * @override
   */
  static getErrorMessages(data) {
    const formatErrors = {};

    if (data.alternateEmail && !isEmail(data.alternateEmail)) {
      formatErrors.alternateEmail = "Must be a valid email address";
    }

    if (data.zipCode && !isZipCode(data.zipCode)) {
      formatErrors.zipCode = "Must be a valid zip code";
    }

    if (!UsPhoneNumberInput.isValid(data.phone)) {
      formatErrors.phone = "Must be a valid phone number including area code";
    }

    if (!UsPhoneNumberInput.isValid(data.principalPhoneNumber)) {
      formatErrors.principalPhoneNumber = "Must be a valid phone number including area code";
    }

    if (!isEmail(data.principalEmail)) {
      formatErrors.principalEmail = "Must be a valid email address";
    }

    if (data.principalEmail !== data.principalConfirmEmail) {
      formatErrors.principalConfirmEmail = "Must match above email";
    }

    return formatErrors;
  }
}
