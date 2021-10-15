import PropTypes from 'prop-types';
import React from 'react';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import UsPhoneNumberInput from '../../form_components/UsPhoneNumberInput';
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/teacherApplicationConstants';
import {isEmail, isZipCode} from '@cdo/apps/util/formatValidation';
import {
  FormGroup,
  Modal,
  Button,
  ControlLabel,
  FormControl,
  HelpBlock,
  Row,
  Col
} from 'react-bootstrap';
import {RegionalPartnerMiniContactPopupLink} from '@cdo/apps/code-studio/pd/regional_partner_mini_contact/RegionalPartnerMiniContact';
import queryString from 'query-string';
import {styles} from './TeacherApplicationConstants';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';

const CSD_URL = 'https://code.org/educate/csd';
const CSP_URL = 'https://code.org/educate/csp';
const PD_RESOURCES_URL =
  'https://support.code.org/hc/en-us/articles/115003865532';
const CS_TEACHERS_URL = 'https://code.org/educate/community';
const INTERNATIONAL = 'Other country';
const US = 'United States';

export default class AboutYou extends LabeledFormComponent {
  static propTypes = {
    ...LabeledFormComponent.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static labels = PageLabels.aboutYou;

  static associatedFields = [...Object.keys(PageLabels.aboutYou)];

  resetCountry = () => this.handleChange({country: US});
  exitApplication = () => (window.location = PD_RESOURCES_URL);

  renderInternationalModal() {
    return (
      <Modal show={this.props.data.country === INTERNATIONAL}>
        <Modal.Header>
          <Modal.Title>
            Thank you for your interest in Code.org’s Professional Learning
            Program.
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          At this time, we are only able to provide this program to teachers in
          the United States. Please visit our website for additional Code.org{' '}
          <a href={PD_RESOURCES_URL} target="_blank" rel="noopener noreferrer">
            professional development resources
          </a>{' '}
          and opportunities to connect with other{' '}
          <a href={CS_TEACHERS_URL} target="_blank" rel="noopener noreferrer">
            computer science teachers
          </a>
          .
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.resetCountry} bsStyle="primary">
            Continue as United States Teacher
          </Button>
          <Button onClick={this.exitApplication}>Exit Application</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  nameInput(id) {
    return (
      <NameInput
        id={id}
        label={this.labelFor(id)}
        validationState={this.getValidationState(id)}
        errorMessage={this.props.errorMessages[id]}
        value={this.props.data[id] || ''}
        handleChange={this.handleChange}
      />
    );
  }

  handleSchoolChange = selectedSchool => {
    this.handleChange({
      school: selectedSchool && selectedSchool.value,
      schoolZipCode:
        selectedSchool && selectedSchool.school && selectedSchool.school.zip
    });
  };

  render() {
    const nominated = queryString.parse(window.location.search).nominated;

    return (
      <FormGroup>
        {nominated && (
          <p>
            Congratulations on being nominated for a scholarship to cover the
            costs of the Code.org Professional Learning Program! We will let
            your local partner know that you’ve been nominated as they consider
            your application for the regional scholarship or discounts they have
            available.
          </p>
        )}

        <p>
          Thanks for your interest in the Code.org Professional Learning
          Program! This application should take 10 - 15 minutes to complete.
          Fields marked with a <span style={{color: 'red'}}>*</span> are
          required.
        </p>

        <h3>Need more information? </h3>
        <p>
          If you need more information about the program before you apply,
          please visit the{' '}
          <a href={CSD_URL} target="_blank" rel="noopener noreferrer">
            CS Discoveries
          </a>{' '}
          and{' '}
          <a href={CSP_URL} target="_blank" rel="noopener noreferrer">
            CS Principles
          </a>{' '}
          landing pages. For additional questions regarding the program or
          application, please{' '}
          <RegionalPartnerMiniContactPopupLink
            sourcePageId="teacher-application-first-page"
            notes="Please tell me more about the professional learning program for grades 6-12!"
          >
            <span style={styles.linkLike}>contact your Regional Partner</span>
          </RegionalPartnerMiniContactPopupLink>
          .
        </p>

        <h3>Section 1: {SectionHeaders.aboutYou}</h3>

        {this.radioButtonsFor('country')}

        {this.renderInternationalModal()}

        {this.radioButtonsFor('completingOnBehalfOfSomeoneElse')}
        {this.props.data.completingOnBehalfOfSomeoneElse === 'Yes' &&
          this.largeInputFor('completingOnBehalfOfName')}

        <Row>
          <Col md={3}>{this.nameInput('firstName')}</Col>
          <Col md={3}>{this.nameInput('lastName')}</Col>
        </Row>

        {this.inputFor('accountEmail', {
          value: this.props.accountEmail,
          readOnly: true
        })}

        {this.inputFor('alternateEmail', {required: false})}

        {this.usPhoneNumberInputFor('phone')}

        <p>
          Code.org or your Regional Partner may need to ship workshop materials
          to you. Please provide the address where you can receive mail when
          school is not in session.
        </p>
        {this.inputFor('streetAddress')}
        {this.inputFor('city')}
        {this.inputFor('state')}

        {this.inputFor('zipCode')}

        {this.checkBoxesFor('previousUsedCurriculum')}
        {this.checkBoxesFor('previousYearlongCdoPd')}
        {this.radioButtonsWithAdditionalTextFieldsFor('currentRole', {
          [TextFields.otherPleaseList]: 'other'
        })}

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
            {this.inputFor('schoolDistrictName', {required: false})}
            {this.inputFor('schoolAddress', {required: false})}
            {this.inputFor('schoolCity', {required: false})}
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

    if (data.school === '-1') {
      requiredFields.push('schoolName');
      requiredFields.push('schoolState');
      requiredFields.push('schoolZipCode');
      requiredFields.push('schoolType');
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
      formatErrors.alternateEmail = 'Must be a valid email address';
    }

    if (data.zipCode && !isZipCode(data.zipCode)) {
      formatErrors.zipCode = 'Must be a valid zip code';
    }

    if (!UsPhoneNumberInput.isValid(data.phone)) {
      formatErrors.phone = 'Must be a valid phone number including area code';
    }

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

    if (data.schoolZipCode && !isZipCode(data.schoolZipCode)) {
      formatErrors.schoolZipCode = 'Must be a valid zip code';
    }

    return formatErrors;
  }
}

const NameInput = ({
  id,
  validationState,
  label,
  value,
  handleChange,
  errorMessage
}) => (
  <FormGroup controlId={id} validationState={validationState}>
    <ControlLabel>
      {label}
      {REQUIRED}
    </ControlLabel>
    <FormControl
      type="text"
      componentClass="input"
      bsClass="form-control"
      value={value}
      onChange={e => handleChange({[id]: e.target.value})}
    />
    <HelpBlock>{errorMessage}</HelpBlock>
  </FormGroup>
);
NameInput.propTypes = {
  id: PropTypes.string,
  label: PropTypes.node,
  value: PropTypes.any,
  validationState: PropTypes.any,
  errorMessage: PropTypes.node,
  handleChange: PropTypes.func
};

const REQUIRED = <span style={{color: 'red'}}>&nbsp;*</span>;
