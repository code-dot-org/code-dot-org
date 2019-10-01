import PropTypes from 'prop-types';
import React from 'react';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import UsPhoneNumberInput from '../../form_components/UsPhoneNumberInput';
import {
  PageLabels,
  SectionHeaders
} from '@cdo/apps/generated/pd/teacher2021ApplicationConstants';
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
import _ from 'lodash';

const CSD_URL = 'https://code.org/educate/csd';
const CSP_URL = 'https://code.org/educate/csp';
const PD_RESOURCES_URL =
  'https://support.code.org/hc/en-us/articles/115003865532';
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
    // but we want to ask in section 5. So they need to be removed here.
    // Also remove a whole mess of fields (from school to principal to role) which we have
    // moved to Section 3, and therefore don't want to validate here in Section 1.
    ..._.difference(Object.keys(PageLabels.section1AboutYou), [
      'genderIdentity',
      'race',
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
    ])
  ];

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
          <a href={PD_RESOURCES_URL} target="_blank">
            professional development resources
          </a>{' '}
          and opportunities to connect with other{' '}
          <a href={CS_TEACHERS_URL} target="_blank">
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

  render() {
    const nominated = queryString.parse(window.location.search).nominated;

    return (
      <FormGroup>
        {nominated && (
          <p>
            Congratulations on your nomination for a scholarship to the Code.org
            Professional Learning Program! We will let your local partner know
            that you’ve been nominated as they consider your application for the
            regional scholarship or discounts they have available.
          </p>
        )}

        <p>
          Thanks for your interest in the Professional Learning Program! This
          application should take 10 - 15 minutes to complete. Fields marked
          with a <span style={{color: 'red'}}>*</span> are required.
        </p>

        {!nominated && (
          <div>
            <h3> When will I hear back?</h3>
            <p>
              In most regions, applications are accepted on a rolling basis. And
              in most cases, our local partner will get back to you within 2
              weeks to let you know your application status.
            </p>
          </div>
        )}

        {nominated && (
          <div>
            <h3>When will I hear back about the scholarships and discounts?</h3>
            <p>
              In most regions, applications are accepted on a rolling basis. And
              in most cases, our local partner will get back to you within 2
              weeks to let you know your application status. Even if you don’t
              get selected for the scholarship, you will still be able to attend
              if you are an eligible teacher and your school can pay a
              discounted price (thanks to generous donors).
            </p>
          </div>
        )}

        <h3>Need more information? </h3>
        <p>
          If you need more information about the program before you apply,
          please visit the{' '}
          <a href={CSD_URL} target="_blank">
            CS Discoveries
          </a>{' '}
          and{' '}
          <a href={CSP_URL} target="_blank">
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

        <h3>Section 1: {SectionHeaders.section1AboutYou}</h3>

        {this.radioButtonsFor('country')}

        {this.renderInternationalModal()}

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

        {this.inputFor('zipCode')}

        {this.radioButtonsFor('completingOnBehalfOfSomeoneElse')}
        {this.props.data.completingOnBehalfOfSomeoneElse === 'Yes' &&
          this.largeInputFor('completingOnBehalfOfName')}
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
      formatErrors.alternateEmail = 'Must be a valid email address';
    }

    if (data.zipCode && !isZipCode(data.zipCode)) {
      formatErrors.zipCode = 'Must be a valid zip code';
    }

    if (!UsPhoneNumberInput.isValid(data.phone)) {
      formatErrors.phone = 'Must be a valid phone number including area code';
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
