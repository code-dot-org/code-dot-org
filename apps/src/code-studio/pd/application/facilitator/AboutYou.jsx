import PropTypes from 'prop-types';
import React from 'react';
import {FormGroup} from 'react-bootstrap';
import LabeledFormComponent from '../../form_components/LabeledFormComponent';
import UsPhoneNumberInput from '../../form_components/UsPhoneNumberInput';
import {
  PageLabels,
  SectionHeaders,
  TextFields
} from '@cdo/apps/generated/pd/facilitatorApplicationConstants';
import {isEmail, isZipCode} from '@cdo/apps/util/formatValidation';

const FACILITATOR_URL = 'https://code.org/educate/facilitator';
const FACILITATOR_EMAIL = 'facilitators@code.org';

export default class AboutYou extends LabeledFormComponent {
  static propTypes = {
    ...LabeledFormComponent.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static labels = PageLabels.aboutYou;

  static associatedFields = [
    ...Object.keys(PageLabels.aboutYou).slice(0, 13),
    'institutionType_other'
  ];

  render() {
    return (
      <FormGroup>
        <p>
          Thanks for your interest in the Code.org Facilitator Development
          Program!
        </p>
        <p>
          This application should take 30 - 45 minutes to complete and includes
          both multiple choice and free response questions. The application
          should be submitted during a single session. An incomplete application
          will not be saved. Fields marked with a{' '}
          <span style={{color: 'red'}}>*</span> are required. If you need more
          information about the program before you apply, please visit{' '}
          <a href={FACILITATOR_URL} target="_blank" rel="noopener noreferrer">
            {FACILITATOR_URL}
          </a>
          . If you have questions regarding the Facilitator Development Program
          or application, please contact{' '}
          <a href={`mailto:${FACILITATOR_EMAIL}`}>{FACILITATOR_EMAIL}</a>.
        </p>
        <p>
          <strong>The deadline to apply is Jan. 31, 2019.</strong>
        </p>

        <h3>Section 1: {SectionHeaders.aboutYou}</h3>
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

        {this.checkBoxesWithAdditionalTextFieldsFor('institutionType', {
          [TextFields.otherWithText]: 'other'
        })}

        {this.inputFor('currentEmployer')}
        {this.inputFor('jobTitle')}
      </FormGroup>
    );
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
