import firehoseClient from '@cdo/apps/lib/util/firehose';
import PropTypes from 'prop-types';
import React from 'react';
import {Button, Checkbox} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import _ from 'lodash';
import ValidationStep, {Status} from '@cdo/apps/lib/ui/ValidationStep';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';
import FieldGroup from '../../code-studio/pd/form_components/FieldGroup';
import SingleCheckbox from '../../code-studio/pd/form_components/SingleCheckbox';
import color from '@cdo/apps/util/color';
import {isEmail} from '@cdo/apps/util/formatValidation';
import {STATES} from '@cdo/apps/geographyConstants';
import DCDO from '@cdo/apps/dcdo';

const VALIDATION_STATE_ERROR = 'error';

const AMAZON_PRIVACY_POLICY_URL =
  'https://www.amazon.com/gp/help/customer/display.html?ie=UTF8&nodeId=468496';
const AFE_CONSENT_BODY = (
  <span>
    I give Code.org permission to share my name and email address, and my
    school's name, address, and NCES ID, with Amazon.com (required to
    participate). Use of your personal information is subject to{' '}
    <a
      href={AMAZON_PRIVACY_POLICY_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      Amazon’s Privacy Policy
    </a>
    .
  </span>
);

const CSTA_PRIVACY_POLICY_URL = 'https://csteachers.org/privacy-policy/';
const CSTA_CONSENT_BODY = (
  <span>
    I give Code.org permission to share my name and email address, and my
    school's name, address, and NCES ID, with the Computer Science Teachers
    Association (required if you want a CSTA+ membership). I provide my consent
    to the use of my personal data as described in the{' '}
    <a href={CSTA_PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer">
      CSTA Privacy Policy
    </a>
    .
  </span>
);

const CSTA_PROFESSIONAL_ROLES = [
  'K-12 Teacher',
  'Pre-Service Teacher',
  'School Administrator',
  'District Administrator',
  'State Department of Education',
  'Higher Education Faculty',
  'Non-Profit',
  'Corporate',
  'Other',
];

const CSTA_GRADE_BANDS = ['K-5', '6-8', '9-12'];

export default class AmazonFutureEngineerEligibilityForm extends React.Component {
  static propTypes = {
    email: PropTypes.string,
    schoolId: PropTypes.string,
    updateFormData: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      email: this.props.email,
      inspirationKit: false,
      csta: false,
      consentAFE: false,
      consentCSTA: false,
      gradeBands: [false, false, false],
      professionalRole: '',
      errors: {},
    };
  }

  handleChange = change => {
    this.setState(change);
  };

  handleRoleChange = change => {
    this.setState({professionalRole: change.target.value});
  };

  handleMultiSelectGradeBands = index => {
    let gradeBands = [...this.state.gradeBands];
    gradeBands[index] = !gradeBands[index];
    this.setState({gradeBands});
  };

  resetSchool = () =>
    this.props.updateFormData({schoolEligible: null, schoolId: null});

  submit = () => {
    const requiredFormData = _.pick(this.state, [
      'email',
      'firstName',
      'lastName',
      'inspirationKit',
      'csta',
      'consentAFE',
    ]);

    let shippingAddress = {};
    if (this.state.inspirationKit) {
      shippingAddress = _.pick(this.state, [
        'street1',
        'street2',
        'city',
        'state',
        'zip',
      ]);
    }

    let consentCSTA = {};
    if (this.state.csta) {
      consentCSTA = {consentCSTA: this.state.consentCSTA};
    }

    let roleCSTA = {};
    if (this.state.gradeBands || this.state.professionalRole) {
      let gradeBands = '';
      for (let i = 0; i < CSTA_GRADE_BANDS.length; i++) {
        if (this.state.gradeBands[i]) {
          gradeBands += CSTA_GRADE_BANDS[i] + ', ';
        }
      }
      roleCSTA = {
        gradesTeaching: gradeBands,
        primaryProfessionalRole: this.state.professionalRole,
      };
    }

    let submitData = {
      ...requiredFormData,
      ...shippingAddress,
      ...consentCSTA,
      ...roleCSTA,
    };

    firehoseClient.putRecord({
      study: 'amazon-future-engineer-eligibility',
      event: 'continue',
      data_json: JSON.stringify(submitData),
    });

    this.props.updateFormData(submitData);
    this.props.updateFormData(submitData);
  };

  onContinue = () => {
    if (this.validateRequiredFields()) {
      this.submit();
    }
  };

  checkValidationState = elementId => {
    return Object.prototype.hasOwnProperty.call(this.state.errors, elementId);
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
    const requiredFields = ['email', 'firstName', 'lastName', 'consentAFE'];

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
            validationState={
              Object.prototype.hasOwnProperty.call(this.state.errors, 'email')
                ? VALIDATION_STATE_ERROR
                : null
            }
            errorMessage={this.state.errors.email}
          />
          <SchoolAutocompleteDropdownWithLabel
            value={this.props.schoolId}
            disabled={true}
            includeSchoolNotFoundCheckbox={false}
          />
          <div style={styles.wrong_school}>
            Wrong school? <a onClick={this.resetSchool}>Go back</a>
            <br />
          </div>
          <FieldGroup
            id="firstName"
            label="First name"
            type="text"
            required={true}
            onChange={this.handleChange}
            validationState={
              Object.prototype.hasOwnProperty.call(
                this.state.errors,
                'firstName'
              )
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
              Object.prototype.hasOwnProperty.call(
                this.state.errors,
                'lastName'
              )
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
            label="Send me a Thank You Kit with Amazon Future Engineer-branded
            gear (t-shirts, drinkware, stickers, and more!)."
            onChange={this.handleChange}
            value={this.state.inspirationKit}
          />
          {this.state.inspirationKit && (
            <div>
              <ShippingAddressFormGroup
                handleChange={this.handleChange}
                checkValidationState={this.checkValidationState}
              />
            </div>
          )}
          <SingleCheckbox
            name="csta"
            label="Send me a free annual Computer Science Teachers Association Plus
            (CSTA+) membership - which includes access to Amazon expert-led
            webinars and other exclusive content."
            onChange={this.handleChange}
            value={this.state.csta}
          />
          {this.state.csta && (
            <div style={styles.consentIndent}>
              <p>
                Since you checked the box above, please consent to sharing your
                information with the CSTA.
              </p>
              <SingleCheckbox
                name="consentCSTA"
                label={CSTA_CONSENT_BODY}
                onChange={this.handleChange}
                value={this.state.consentCSTA}
                validationState={
                  Object.prototype.hasOwnProperty.call(
                    this.state.errors,
                    'consentCSTA'
                  )
                    ? VALIDATION_STATE_ERROR
                    : null
                }
              />
              {!!DCDO.get('csta-form-extension', true) && (
                <div>
                  <p>Tell CSTA a little bit about yourself:</p>
                  <label
                    style={styles.descriptiveText}
                    htmlFor="professionalRoleSelect"
                  >
                    What is your current role?
                  </label>
                  <select
                    style={styles.dropdownPadding}
                    id="professionalRoleSelect"
                    name="professionalRole"
                    value={this.state.professionalRole}
                    onChange={this.handleRoleChange}
                  >
                    {CSTA_PROFESSIONAL_ROLES.map(role => (
                      <option value={role} key={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <fieldset className="gradebands-group">
                    <legend style={styles.descriptiveText}>
                      What grade bands do you teach?
                    </legend>
                    {CSTA_GRADE_BANDS.map((grade, index) => (
                      <Checkbox
                        style={styles.checkboxItem}
                        key={index}
                        checked={this.state.gradeBands[index]}
                        onChange={() => this.handleMultiSelectGradeBands(index)}
                      >
                        <label style={styles.checkboxLabel} htmlFor={grade}>
                          {grade}
                        </label>
                      </Checkbox>
                    ))}
                  </fieldset>
                </div>
              )}
            </div>
          )}
          <hr style={styles.sectionBreak} />
          <SingleCheckbox
            name="consentAFE"
            label={AFE_CONSENT_BODY}
            onChange={this.handleChange}
            value={this.state.consentAFE}
            validationState={
              Object.prototype.hasOwnProperty.call(
                this.state.errors,
                'consentAFE'
              )
                ? VALIDATION_STATE_ERROR
                : null
            }
            required={true}
          />
          <div>
            By clicking Continue, you will receive an email from Amazon Future
            Engineer to claim your benefits. You will also receive occasional
            emails from Amazon Future Engineer about new opportunities, such as
            Amazon Future Engineer scholarships and grants. You always have the
            choice to adjust your interest settings or unsubscribe.
          </div>
          <Button id="continue" onClick={this.onContinue} style={styles.button}>
            Continue
          </Button>
        </form>
      </div>
    );
  }
}

const styles = {
  wrong_school: {
    textAlign: 'right',
  },
  sectionBreak: {
    borderColor: color.teal,
  },
  consentIndent: {
    marginLeft: '25px',
  },
  button: {
    backgroundColor: color.orange,
    color: color.white,
  },
  dropdownPadding: {
    marginTop: 10,
    marginBottom: 10,
  },
  descriptiveText: {
    display: 'block',
    fontFamily: '"Gotham 4r", sans-serif',
    fontWeight: 'bold',
    fontSize: 14,
    border: 'none',
    color: color.dimgray,
    margin: 0,
  },
  checkboxItem: {
    margin: 5,
  },
  checkboxLabel: {
    paddingLeft: 5,
  },
};

const ShippingAddressFormGroup = ({handleChange, checkValidationState}) => {
  const renderedStateOptions = STATES.map(state => (
    <option key={state} value={state}>
      {state}
    </option>
  ));

  return (
    <div>
      <div>
        By checking the box above, I consent to Amazon sharing my email address
        and school address with its third party vendor, Corporate Imaging
        Concepts, LLC, solely in order to fulfill my request. I understand
        Amazon's vendor will email me a promo code to allow me to select and
        redeem my Thank You Kit items.
      </div>
      <FieldGroup
        id="street1"
        label="Street 1"
        type="text"
        required={true}
        onChange={handleChange}
        validationState={
          checkValidationState('street1') ? VALIDATION_STATE_ERROR : null
        }
      />
      <FieldGroup
        id="street2"
        label="Street 2"
        type="text"
        required={false}
        onChange={handleChange}
      />
      <FieldGroup
        id="city"
        label="City"
        type="text"
        required={true}
        onChange={handleChange}
        validationState={
          checkValidationState('city') ? VALIDATION_STATE_ERROR : null
        }
      />
      <FieldGroup
        id="state"
        label="State"
        required={true}
        onChange={handleChange}
        validationState={
          checkValidationState('state') ? VALIDATION_STATE_ERROR : null
        }
        componentClass="select"
      >
        {renderedStateOptions}
      </FieldGroup>
      <FieldGroup
        id="zip"
        label="Zip code"
        type="number"
        required={true}
        onChange={handleChange}
        validationState={
          checkValidationState('zip') ? VALIDATION_STATE_ERROR : null
        }
      />
    </div>
  );
};
ShippingAddressFormGroup.propTypes = {
  handleChange: PropTypes.func.isRequired,
  checkValidationState: PropTypes.func.isRequired,
};
