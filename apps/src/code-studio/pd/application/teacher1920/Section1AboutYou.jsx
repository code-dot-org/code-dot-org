import PropTypes from 'prop-types';
import React from 'react';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import UsPhoneNumberInput from '../../form_components/UsPhoneNumberInput';
import {
  PageLabels,
  SectionHeaders
} from '@cdo/apps/generated/pd/teacher1920ApplicationConstants';
import {isEmail, isZipCode} from '@cdo/apps/util/formatValidation';
import {FormGroup, Modal, Button} from 'react-bootstrap';
import queryString from 'query-string';
import {styles} from './TeacherApplicationConstants';
import _ from 'lodash';

const CSD_URL = 'https://code.org/educate/professional-learning/cs-discoveries';
const CSP_URL = 'https://code.org/educate/professional-learning/cs-principles';
const PD_RESOURCES_URL =
  'https://support.code.org/hc/en-us/articles/115003865532';
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

        <h3>What’s in this application and how long will it take?</h3>
        <p>
          This application should take 10 - 15 minutes to complete. Fields
          marked with a <span style={{color: 'red'}}>*</span> are required. Here
          are the sections you will be asked to fill out:
        </p>
        <ul>
          <li>
            <span style={styles.bold}>Section 1: About you</span>
            &nbsp; (Your contact info)
          </li>
          <li>
            <span style={styles.bold}>
              Section 2: Teaching and school background
            </span>
            &nbsp; (Principal contact info, your subject areas, and what CS
            courses are offered in your school)
          </li>
          <li>
            <span style={styles.bold}>Section 3: Choose your program</span>
            &nbsp; (Which program you want to join and how you plan on teaching
            the course)
          </li>
          <li>
            <span style={styles.bold}>
              Section 4: Professional Learning Program commitments
            </span>
            &nbsp; (Your interest and ability to participate in the whole
            program)
          </li>
          <li>
            <span style={styles.bold}>
              Section 5: Additional demographic information
            </span>
            &nbsp; (Optional: your gender identity and race)
          </li>
          <li>
            <span style={styles.bold}>Section 6: Submission</span>
            &nbsp; (Confirm and submit)
          </li>
        </ul>

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
          please visit{' '}
          <a href={CSD_URL} target="_blank">
            CS Discoveries
          </a>{' '}
          and{' '}
          <a href={CSP_URL} target="_blank">
            CS Principles
          </a>{' '}
          landing pages. If you’re not sure which program is the right fit for
          your classroom, we encourage you to{' '}
          <a
            href="https://docs.google.com/document/d/1ASRRQ8Cloyp9kXPBtxa8j5xmXQ0SgLyUCGx2h26WrkQ/edit"
            target="_blank"
          >
            check out our course and professional learning options.
          </a>{' '}
          For additional questions regarding the program or application, please
          <a href={REGIONAL_PARTNER_URL} target="_blank">
            {' '}
            contact your Regional Partner.
          </a>
        </p>

        <h3>Section 1: {SectionHeaders.section1AboutYou}</h3>

        {this.radioButtonsFor('country')}

        {this.renderInternationalModal()}

        {this.selectFor('title', {
          required: false,
          placeholder: 'Select a title'
        })}

        {this.inputFor('firstName')}
        {this.inputFor('lastName')}

        {this.inputFor('accountEmail', {
          value: this.props.accountEmail,
          readOnly: true
        })}

        {this.inputFor('alternateEmail', {required: false})}

        {this.usPhoneNumberInputFor('phone')}

        {this.inputFor('address')}
        {this.inputFor('city')}
        {this.selectFor('state', {placeholder: 'Select a state'})}
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
