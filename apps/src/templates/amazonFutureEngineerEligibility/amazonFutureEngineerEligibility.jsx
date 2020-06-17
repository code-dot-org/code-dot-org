import React from 'react';
import PropTypes from 'prop-types';
import {FormGroup, Button} from 'react-bootstrap';
import FieldGroup from '../../code-studio/pd/form_components/FieldGroup';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';
import AmazonFutureEngineerEligibilityForm from './amazonFutureEngineerEligibilityForm';
import AmazonFutureEngineerAccountConfirmation from './amazonFutureEngineerAccountConfirmation';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {isEmail} from '@cdo/apps/util/formatValidation';

const styles = {
  intro: {
    paddingBottom: 10
  }
};

const sessionStorageKey = 'AmazonFutureEngineerEligibility';

const VALIDATION_STATE_ERROR = 'error';

export default class AmazonFutureEngineerEligibility extends React.Component {
  static propTypes = {
    signedIn: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);

    let sessionEligibilityData = JSON.parse(
      sessionStorage.getItem(sessionStorageKey)
    ) || {
      schoolEligible: null,
      schoolId: null,
      consentAFE: false,
      submitted: false
    };

    sessionEligibilityData.signedIn = this.props.signedIn;

    this.state = {
      formData: sessionEligibilityData,
      errors: {}
    };
  }

  updateFormData = change => {
    this.setState({formData: {...this.state.formData, ...change}});
  };

  saveToSessionStorage = () => {
    sessionStorage.setItem(
      sessionStorageKey,
      JSON.stringify(this.state.formData)
    );
  };

  submit = () => {
    // TO DO: if ineligible, open new ineligibility page (markdown that marketing can edit)
    if (this.state.formData.schoolId === '-1') {
      this.handleEligibility(false);
    }

    $.ajax({
      url:
        '/dashboardapi/v1/schools/' +
        this.state.formData.schoolId +
        '/afe_high_needs',
      type: 'get',
      dataType: 'json'
    }).done(schoolData => {
      this.handleEligibility(schoolData.afe_high_needs);
    });
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

    if (this.state.formData.email) {
      if (!isEmail(this.state.formData.email)) {
        errors.email = 'Must be a valid email address';
      }
    }

    return errors;
  };

  getMissingRequiredFields() {
    const requiredFields = ['email', 'schoolId'];

    const missingRequiredFields = requiredFields.filter(f => {
      return !this.state.formData[f];
    });

    return missingRequiredFields;
  }

  handleClickCheckEligibility = () => {
    if (this.validateRequiredFields()) {
      this.submit();
    }
  };

  handleEligibility(isEligible) {
    this.setState({
      formData: {...this.state.formData, ...{schoolEligible: isEligible}}
    });
    this.saveToSessionStorage();

    if (!isEligible) {
      window.location = pegasus('/privacy');
    }
  }

  handleSchoolDropdownChange = (field, event) => {
    const newData = {
      schoolId: event ? event.value : '',
      schoolName: event ? event.label : ''
    };

    this.updateFormData(newData);
  };

  loadConfirmationPage = () => {
    this.saveToSessionStorage();

    return <AmazonFutureEngineerAccountConfirmation />;
  };

  submitToAFE = () => {
    // returns a promise
    return fetch('/dashboardapi/v1/amazon_future_engineer_submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state.formData)
    });
  };

  loadCompletionPage = () => {
    // Dedupe with loadConfirmationPage -- probably belongs in onContinue
    this.saveToSessionStorage();

    // Do API calls here.
    if (!this.state.formData.submitted) {
      this.submitToAFE();
    }

    // Notes on to dos for CSTA API call:
    // may need to make NCES ID 12 digits.
    // CSTA wants school district?
    // school name may be too verbose currently.
    // what if some of these are missing?
    // lots of validation specified in spec, none currently being done.
    // need timestamp in appropriate format.

    return <div>Completion!</div>;
  };

  render() {
    let {formData} = this.state;

    if (formData.schoolEligible === false) {
      window.location = pegasus('/privacy');
    }

    // TO DO: Disable button until email and school are filled in
    return (
      <div>
        {formData.schoolEligible === null && (
          <div>
            <h2>Am I eligible?</h2>
            <FormGroup id="amazon-future-engineer-eligiblity-intro">
              <div style={styles.intro}>
                Enter your teacher email address and select your school below to
                find out if you're eligible to participate in the Amazon Future
                Engineer program, which offers free support for participating
                Code.org classrooms.
              </div>
              <FieldGroup
                id="email"
                label="Email"
                type="text"
                required={true}
                onChange={this.updateFormData}
                validationState={
                  this.state.errors.hasOwnProperty('email')
                    ? VALIDATION_STATE_ERROR
                    : null
                }
                errorMessage={this.state.errors.email}
              />
              <FormGroup
                id="schoolIdWrapper"
                validationState={
                  this.state.errors.hasOwnProperty('schoolId')
                    ? VALIDATION_STATE_ERROR
                    : null
                }
              >
                <SchoolAutocompleteDropdownWithLabel
                  setField={this.handleSchoolDropdownChange}
                  showRequiredIndicator={true}
                  value={formData.schoolId}
                />
              </FormGroup>
              <Button id="submit" onClick={this.handleClickCheckEligibility}>
                Find out if I'm eligible
              </Button>
            </FormGroup>
          </div>
        )}
        {formData.schoolEligible === true && formData.consentAFE === false && (
          <AmazonFutureEngineerEligibilityForm
            email={formData.email}
            schoolId={formData.schoolId}
            onContinue={this.updateFormData}
          />
        )}
        {formData.schoolEligible === true &&
          formData.consentAFE === true &&
          formData.signedIn === false &&
          this.loadConfirmationPage()}
        {formData.schoolEligible === true &&
          formData.consentAFE === true &&
          formData.signedIn === true &&
          this.loadCompletionPage()}
      </div>
    );
  }
}
