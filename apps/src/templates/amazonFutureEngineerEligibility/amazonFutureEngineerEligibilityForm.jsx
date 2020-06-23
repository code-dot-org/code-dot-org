import firehoseClient from '@cdo/apps/lib/util/firehose';
import PropTypes from 'prop-types';
import React from 'react';
import {Button} from 'react-bootstrap';
import _ from 'lodash';
import ValidationStep, {Status} from '@cdo/apps/lib/ui/ValidationStep';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';
import FieldGroup from '../../code-studio/pd/form_components/FieldGroup';
import SingleCheckbox from '../../code-studio/pd/form_components/SingleCheckbox';
import color from '@cdo/apps/util/color';
import {isEmail} from '@cdo/apps/util/formatValidation';

const VALIDATION_STATE_ERROR = 'error';

const styles = {
  wrong_school: {
    textAlign: 'right'
  },
  sectionBreak: {
    borderColor: color.teal
  },
  consentIndent: {
    marginLeft: '25px'
  }
};

export default class AmazonFutureEngineerEligibilityForm extends React.Component {
  static propTypes = {
    email: PropTypes.string,
    schoolId: PropTypes.string,
    onContinue: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      email: this.props.email,
      inspirationKit: false,
      csta: false,
      awsEducate: false,
      consentAFE: false,
      consentCSTA: false,
      errors: {}
    };
  }

  handleChange = change => {
    this.setState(change);
  };

  submit = () => {
    const requiredFormData = _.pick(this.state, [
      'firstName',
      'lastName',
      'inspirationKit',
      'csta',
      'awsEducate',
      'consentAFE'
    ]);

    let shippingAddress = {};
    if (this.state.inspirationKit) {
      shippingAddress = _.pick(this.state, [
        'street1',
        'street2',
        'city',
        'state',
        'zip'
      ]);
    }

    let consentCSTA = {};
    if (this.state.csta) {
      consentCSTA = {consentCSTA: this.state.consentCSTA};
    }

    let submitData = {
      ...requiredFormData,
      ...shippingAddress,
      ...consentCSTA
    };

    firehoseClient.putRecord({
      study: 'amazon-future-engineer-eligibility',
      event: 'continue',
      data_json: JSON.stringify(submitData)
    });

    this.props.onContinue(submitData);
  };

  onContinue = () => {
    if (this.validateRequiredFields()) {
      this.submit();
    }
  };

  checkValidationState = elementId => {
    return this.state.errors.hasOwnProperty(elementId);
  };

  validateRequiredFields = () => {
    let errors = this.getErrors();
    const missingRequiredFields = this.getMissingRequiredFields();

    if (missingRequiredFields.length || Object.keys(errors).length) {
      let requiredFieldsErrors = {};
      missingRequiredFields.forEach(f => {
        requiredFieldsErrors[f] = '';
      });
      errors = {...errors, ...requiredFieldsErrors};
      this.setState({errors: errors});
      return false;
    }
    return true;
  };

  getErrors = () => {
    const errors = {};

    if (this.state.email) {
      if (!isEmail(this.state.email)) {
        errors.email = 'Must be a valid email address';
      }
    }

    return errors;
  };

  getMissingRequiredFields() {
    const requiredFields = ['firstName', 'lastName', 'consentAFE'];

    if (this.state.csta) {
      requiredFields.push('consentCSTA');
    }

    if (this.state.inspirationKit) {
      requiredFields.push('street1', 'city', 'state', 'zip');
    }

    const missingRequiredFields = requiredFields.filter(f => {
      return !this.state[f];
    });

    return missingRequiredFields;
  }

  render() {
    // TO DO: gray out school dropdown and disable editing
    // TO DO: Add "Not your school? go back" link below school dropdown
    // TO DO: Enforce that these required fields are actually required
    return (
      <div>
        <div>
          <ValidationStep
            stepStatus={Status.SUCCEEDED}
            stepName="You teach at an eligible school!"
          />
          We invite you to enroll in the Amazon Future Engineer program by
          completing the information below.
        </div>
        <form>
          <FieldGroup
            id="email"
            label="Email"
            type="text"
            required={true}
            onChange={this.handleChange}
            defaultValue={this.props.email}
          />
          <SchoolAutocompleteDropdownWithLabel
            value={this.props.schoolId}
            disabled={true}
            includeSchoolNotFoundCheckbox={false}
          />
          <div style={styles.wrong_school}>
            Wrong school? Go back
            <br />
          </div>
          <FieldGroup
            id="firstName"
            label="First name"
            type="text"
            required={true}
            onChange={this.handleChange}
            validationState={
              this.state.errors.hasOwnProperty('firstName')
                ? VALIDATION_STATE_ERROR
                : null
            }
          />
          <FieldGroup
            id="lastName"
            label="Last name"
            type="text"
            required={true}
            onChange={this.handleChange}
            validationState={
              this.state.errors.hasOwnProperty('lastName')
                ? VALIDATION_STATE_ERROR
                : null
            }
          />
          <div>
            How can Amazon Future Engineer help you grow computer science at
            your school?
          </div>
          <hr style={styles.sectionBreak} />
          <SingleCheckbox
            name="inspirationKit"
            label="Send my school an Inspiration Kit with posters and stickers to
              help promote computer science to students and parents."
            onChange={this.handleChange}
            value={this.state.inspirationKit}
          />
          {this.state.inspirationKit && (
            <ShippingAddressFormGroup
              handleChange={this.handleChange}
              checkValidationState={this.checkValidationState}
            />
          )}
          <SingleCheckbox
            name="csta"
            label="Send me a free annual Computer Science Teachers Association (CSTA)
              Plus membership - which includes access to Amazon expert-led
              webinars and other exclusive content."
            onChange={this.handleChange}
            value={this.state.csta}
          />
          {this.state.csta && (
            <div style={styles.consentIndent}>
              <div>
                Since you checked the box above, please consent to the sharing
                and use of your personal data with the CSTA. Your information
                will be shared as described in accordance with the{' '}
                <a href="https://csteachers.org/privacy-policy/">
                  CSTA Privacy Policy.
                </a>
              </div>
              <SingleCheckbox
                name="consentCSTA"
                label="I give Code.org permission to share my name, email address, and school name, address, and NCES ID with the Computer Science Teachers Association. I provide my consent to the use of my personal data as described in the CSTA Privacy Policy (required if you want a CSTA Plus membership)."
                onChange={this.handleChange}
                value={this.state.consentCSTA}
                validationState={
                  this.state.errors.hasOwnProperty('consentCSTA')
                    ? VALIDATION_STATE_ERROR
                    : null
                }
              />
            </div>
          )}
          <SingleCheckbox
            name="awsEducate"
            label="Send me a free membership to Amazon Web Services Educate to access
              free content and cloud computing credits to help my students learn
              to build in the cloud."
            onChange={this.handleChange}
            value={this.state.awsEducate}
          />
          <hr style={styles.sectionBreak} />
          <SingleCheckbox
            name="consentAFE"
            label="I give Code.org permission to share my name, email address, and
              school name, address, and ID with Amazon.com (required to
              participate). Use of your personal information is subject to
              Amazon’s Privacy Policy."
            onChange={this.handleChange}
            value={this.state.consentAFE}
            validationState={
              this.state.errors.hasOwnProperty('consentAFE')
                ? VALIDATION_STATE_ERROR
                : null
            }
            required={true}
          />
          <div>
            By clicking Continue, you will receive an email from Amazon Future
            Engineer to claim your benefits. You will also receive occasional
            emails from Amazon Future Engineer about new opportunities. You
            always have the choice to adjust your interest settings or
            unsubscribe.
          </div>
          <Button id="continue" onClick={this.onContinue}>
            Continue
          </Button>
        </form>
      </div>
    );
  }
}

// This might be better as pure functional component?
// Just takes handleChange as argument, returns form?
class ShippingAddressFormGroup extends React.Component {
  static propTypes = {
    handleChange: PropTypes.func.isRequired,
    checkValidationState: PropTypes.func.isRequired
  };

  handleChange = change => {
    this.props.handleChange(change);
  };

  render() {
    // TO DO: Maybe outermost element should be FormGroup, not div
    return (
      <div>
        <div>
          Since you checked the box above, please verify your school address
          below.
        </div>
        <FieldGroup
          id="street1"
          label="Street 1"
          type="text"
          required={true}
          onChange={this.handleChange}
          validationState={
            this.props.checkValidationState('street1')
              ? VALIDATION_STATE_ERROR
              : null
          }
        />
        <FieldGroup
          id="street2"
          label="Street 2"
          type="text"
          required={false}
          onChange={this.handleChange}
        />
        <FieldGroup
          id="city"
          label="City"
          type="text"
          required={true}
          onChange={this.handleChange}
          validationState={
            this.props.checkValidationState('city')
              ? VALIDATION_STATE_ERROR
              : null
          }
        />
        <FieldGroup
          id="state"
          label="State"
          type="text"
          required={true}
          onChange={this.handleChange}
          validationState={
            this.props.checkValidationState('state')
              ? VALIDATION_STATE_ERROR
              : null
          }
        />
        <FieldGroup
          id="zip"
          label="Zip code"
          type="number"
          required={true}
          onChange={this.handleChange}
          validationState={
            this.props.checkValidationState('zip')
              ? VALIDATION_STATE_ERROR
              : null
          }
        />
      </div>
    );
  }
}
