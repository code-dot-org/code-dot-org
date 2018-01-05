import React, {PropTypes} from 'react';
import ApplicationFormComponent from "../ApplicationFormComponent";
import UsPhoneNumberInput from "../../form_components/UsPhoneNumberInput";
import {PageLabels, SectionHeaders} from '@cdo/apps/generated/pd/teacher1819ApplicationConstants';
import {isEmail, isZipCode} from '@cdo/apps/util/formatValidation';
import {
  FormGroup,
  Modal,
  Button
} from 'react-bootstrap';

const CSD_URL = 'https://code.org/educate/professional-learning/cs-discoveries';
const CSP_URL = 'https://code.org/educate/professional-learning/cs-principles';
const PD_RESOURCES_URL = 'https://code.org/educate';
const CS_TEACHERS_URL = 'https://code.org/educate/community';
const WHICH_PROGRAM_URL = 'https://code.org/files/PL-Program-for-Me.pdf';
const TEACHER_EMAIL = 'teacher@code.org';
const INTERNATIONAL = 'International';
const US = 'United States';

export default class Section1AboutYou extends ApplicationFormComponent {
  static propTypes = {
    ...ApplicationFormComponent.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static labels = PageLabels.section1AboutYou;

  static associatedFields = [
    ...Object.keys(PageLabels.section1AboutYou)
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
        </p>
        <p>
          This application should take 10 - 15 minutes to complete,
          and will require your principal’s approval. Fields marked with a
          {' '}<span style={{color: "red"}}>*</span>{' '}
          are required.
        </p>
        <p>
          <strong>
            Applications are reviewed on a rolling basis, and spots will fill quickly.
            The priority deadline to apply is March 30, 2018.
            All applications received after March 30 will only be considered if space is available.
          </strong>
        </p>
        <p>
          If you need more information on the program before you apply,
          please visit
          {' '}<a href={CSD_URL} target="_blank">CS Discoveries</a>{' '}
          and
          {' '}<a href={CSP_URL} target="_blank">CS Principles</a>.{' '}
          If you’re not sure which program is the right fit for your classroom,
          we encourage you to check our guidance in
          {' '}<a href={WHICH_PROGRAM_URL} target="_blank">Which Program is Right for Me?</a>.{' '}
          For additional questions regarding the program or application,
          please contact
          {' '}<a href={`mailto:${TEACHER_EMAIL}`}>{TEACHER_EMAIL}</a>.
        </p>

        <h3>Section 1: {SectionHeaders.section1AboutYou}</h3>

        {this.radioButtonsFor("country")}

        {this.renderInternationalModal()}

        {this.selectFor("title", {
          required: false,
          placeholder: "Select a title"
        })}

        {this.inputFor("firstName")}
        {this.inputFor("preferredFirstName", {required: false})}
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

        {this.radioButtonsFor("genderIdentity")}
        {this.checkBoxesFor("race")}
      </FormGroup>
    );
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

    return formatErrors;
  }
}
