import classnames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {Button} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import ValidationStep, {
  Status,
} from '@cdo/apps/sharedComponents/ValidationStep';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';
import color from '@cdo/apps/util/color';
import {isEmail} from '@cdo/apps/util/formatValidation';
import i18n from '@cdo/locale';

import FieldGroup from '../../code-studio/pd/form_components/FieldGroup';
import SingleCheckbox from '../../code-studio/pd/form_components/SingleCheckbox';

const VALIDATION_STATE_ERROR = 'error';

const INPUT_HEIGHT = 34;

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
    I opt-in for a free CSTA+ membership and access to Amazon webinars and
    content. I authorize Code.org to share my personal information with CSTA for
    membership purposes, as outlined in the{' '}
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
    isSignedIn: PropTypes.bool,
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

    let consentCSTA = {};
    if (this.state.csta) {
      consentCSTA = {consentCSTA: true};
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
      ...consentCSTA,
      ...roleCSTA,
    };
    analyticsReporter.sendEvent(EVENTS.AFE_CONTINUE, {
      submitData: JSON.stringify(submitData),
      isSignedIn: this.props.isSignedIn,
    });

    this.props.updateFormData(submitData);
  };

  onContinue = () => {
    if (this.validateRequiredFields()) {
      this.submit();
    }
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

    const missingRequiredFields = requiredFields.filter(f => {
      return !this.state[f];
    });

    return missingRequiredFields;
  }

  // Collapse dropdown if 'Escape' is pressed
  onKeyDown(e) {
    if (e.keyCode === 27) {
      e.currentTarget.classList.remove('open');
    }
  }

  render() {
    return (
      <div>
        <div style={styles.standardPadding}>
          <ValidationStep
            stepStatus={Status.SUCCEEDEDTEAL}
            stepName="You teach at an eligible school!"
          />
          {i18n.afeCompleteTheFormBelow()}
        </div>
        <form>
          <FieldGroup
            id="email"
            label={i18n.coteacherEmailAddress()}
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
          <div style={styles.inputBoxes}>
            <div style={styles.fillSpace}>
              <FieldGroup
                id="firstName"
                label={i18n.afeFirstName()}
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
            </div>
            <div style={styles.fillSpace}>
              <FieldGroup
                id="lastName"
                label={i18n.afeLastName()}
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
            </div>
          </div>
          <div style={styles.inputBoxes}>
            <div style={styles.dropdownContainer}>
              <label
                style={styles.descriptiveText}
                htmlFor="professionalRoleSelect"
              >
                {i18n.afeWhatIsYourRole()}
              </label>
              <select
                style={styles.dropdown}
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
            </div>
            <div style={styles.halfWidth}>
              <label>{i18n.afeWhatGradeBands()}</label>
              <div
                className="dropdown show"
                style={styles.fullWidth}
                id={'gradeBands'}
                onKeyDown={this.onKeyDown}
              >
                <button
                  style={{...styles.fullWidth, ...styles.gradeBandButton}}
                  className="btn btn-secondary dropdown-toggle"
                  id="dropdownMenuButton"
                  type="button"
                  data-toggle="dropdown"
                  aria-haspopup={true}
                  aria-label="gradeband dropdown"
                >
                  {this.state.gradeBands.includes(true) && (
                    <FontAwesome
                      style={styles.alignCenter}
                      id={'check-icon'}
                      icon="check-circle"
                      title={'grades'}
                    />
                  )}
                  <div style={{...styles.alignCenter, ...styles.buttonLabel}}>
                    {i18n.afeGradeBands()}
                  </div>
                  <FontAwesome
                    style={styles.icon}
                    id={'chevron-down-icon'}
                    icon={'chevron-down'}
                  />
                </button>
                <div
                  className={classnames('dropdown-menu')}
                  aria-labelledby="dropdownMenuButton"
                >
                  <ul style={styles.listItems}>
                    {CSTA_GRADE_BANDS.map((band, index) => (
                      <li
                        className="dropdown-item"
                        style={styles.singleItem}
                        key={band}
                      >
                        <SingleCheckbox
                          style={styles.check}
                          name={band}
                          label={band}
                          onChange={() =>
                            this.handleMultiSelectGradeBands(index)
                          }
                          value={this.state.gradeBands[index]}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <hr style={styles.sectionBreak} />
          <label>{i18n.afeSupport()}</label>
          <SingleCheckbox
            name="inspirationKit"
            label={i18n.afeInspirationKit()}
            onChange={this.handleChange}
            value={this.state.inspirationKit}
          />
          <SingleCheckbox
            name="csta"
            label={CSTA_CONSENT_BODY}
            onChange={this.handleChange}
            value={this.state.csta}
          />
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
          <div>{i18n.afeContinueMessage()}</div>
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
    borderColor: color.neutral_dark20,
    margin: '1rem 0',
  },
  button: {
    color: color.white,
  },
  standardPadding: {
    marginTop: 10,
    marginBottom: 10,
  },
  dropdown: {
    border: `1px solid ${color.lighter_gray}`,
    borderRadius: 4,
    height: INPUT_HEIGHT,
    flexGrow: 1,
    width: '100%',
  },
  dropdownContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: 15,
    width: '50%',
  },
  descriptiveText: {
    display: 'block',
  },
  inputBoxes: {
    display: 'flex',
    gap: 10,
  },
  fillSpace: {
    flexGrow: 1,
  },
  gradeBandButton: {
    border: `1px solid ${color.lighter_gray}`,
    display: 'flex',
    backgroundColor: 'white',
    height: INPUT_HEIGHT,
    fontWeight: 300,
    padding: 5,
    margin: 0,
    color: color.neutral_dark,
  },
  buttonLabel: {
    marginLeft: 10,
  },
  alignCenter: {
    alignSelf: 'center',
  },
  icon: {
    color: color.neutral_dark,
    fontSize: 'smaller',
    position: 'absolute',
    right: 5,
    top: 10,
    fontWeight: 100,
  },
  listItems: {
    margin: 0,
    listStyleType: 'none',
    padding: 0,
    textWrap: 'nowrap',
    overflow: 'auto',
  },
  singleItem: {
    display: 'flex',
    padding: 5,
    alignItems: 'start',
    gap: 12,
    margin: 0,
  },
  check: {
    position: 'relative',
    margin: '0 0 0 10px',
  },
  fullWidth: {
    width: '100%',
  },
  halfWidth: {
    width: '50%',
  },
};
