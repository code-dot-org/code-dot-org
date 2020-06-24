import firehoseClient from '@cdo/apps/lib/util/firehose';
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
    signedIn: PropTypes.bool.isRequired,
    schoolId: PropTypes.string,
    schoolEligible: PropTypes.bool,
    accountEmail: PropTypes.string
  };

  constructor(props) {
    super(props);

    let sessionEligibilityData = this.getSessionEligibilityData();

    // Initial state is set by information that has been stored to the session.
    // If none exists (ie, a user's first time visiting the page),
    // set defaults that will ask them to provide school information.
    this.state = {
      formData: {
        ...sessionEligibilityData,
        signedIn: this.props.signedIn,
        schoolEligible: this.checkInitialSchoolEligibility(
          sessionEligibilityData
        ),
        schoolId:
          sessionEligibilityData.schoolId || this.props.schoolId || null,
        consentAFE: sessionEligibilityData.consentAFE || false
      },
      errors: {}
    };
  }

  // If a user has gone through the eligibility flow,
  // or has school information associated with their account,
  // we use that for determining their eligibilty.
  // If the school information associated with their account
  // is ineligible, we still allow them to provide their school information
  // in case their account information is out of date.
  // Redirect to ineligible page ('/afe/start-codeorg') if ineligible.
  // Otherwise, we ask them for their school information.
  checkInitialSchoolEligibility = sessionEligibilityData => {
    if (
      sessionEligibilityData.schoolEligible === true ||
      this.props.schoolEligible === true
    ) {
      return true;
    } else if (sessionEligibilityData.schoolEligible === false) {
      window.location = pegasus('/afe/start-codeorg');
    }

    return null;
  };

  getSessionEligibilityData = () =>
    JSON.parse(sessionStorage.getItem(sessionStorageKey)) || {};

  updateFormData = (change, callback = () => {}) => {
    this.setState({formData: {...this.state.formData, ...change}}, callback);
  };

  // Wrapper to allow saving data to session
  // as a callback once a user submits the full eligibility form.
  // Otherwise, component can be reloaded before data is stored to session,
  // which can result in the incorrect component being rendered.
  updateAndStoreFormData = formData => {
    this.updateFormData(formData, this.saveToSessionStorage);
  };

  saveToSessionStorage = () => {
    sessionStorage.setItem(
      sessionStorageKey,
      JSON.stringify(this.state.formData)
    );
  };

  submit = () => {
    firehoseClient.putRecord({
      study: 'amazon-future-engineer-eligibility',
      event: 'submit_school_info'
    });

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

    this.setState({errors: errors});
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
      formData: {...this.state.formData, schoolEligible: isEligible}
    });
    this.saveToSessionStorage();

    if (!isEligible) {
      firehoseClient.putRecord({
        study: 'amazon-future-engineer-eligibility',
        event: 'ineligible'
      });

      window.location = pegasus('/afe/start-codeorg');
    }
  }

  handleSchoolDropdownChange = (field, event) => {
    const newData = {
      schoolId: event ? event.value : '',
      schoolName: event ? event.label : ''
    };

    this.updateFormData(newData);
  };

  submitToAFE = () => {
    firehoseClient.putRecord({
      study: 'amazon-future-engineer-eligibility',
      event: 'submit_to_afe',
      data_json: JSON.stringify({
        accountEmail: this.props.accountEmail,
        accountSchoolId: this.props.schoolId,
        formEmail: this.state.formData.email,
        formSchoolId: this.state.formData.schoolId
      })
    });

    // returns a promise
    return fetch('/dashboardapi/v1/amazon_future_engineer_submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...this.state.formData,
        trafficSource: 'AFE-code.org',
        newCodeAccount: true
      })
    });
  };

  loadCompletionPage = () => {
    let sessionEligibilityData = this.getSessionEligibilityData();

    if (!sessionEligibilityData.submitted) {
      this.submitToAFE().then(() => {
        sessionStorage.setItem(
          sessionStorageKey,
          JSON.stringify({...sessionEligibilityData, submitted: true})
        );
      });
    }

    window.location = pegasus('/afe/success');
  };

  render() {
    let {formData} = this.state;

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
              <SchoolAutocompleteDropdownWithLabel
                setField={this.handleSchoolDropdownChange}
                showRequiredIndicator={true}
                value={formData.schoolId}
                showErrorMsg={this.state.errors.hasOwnProperty('schoolId')}
              />
              <Button id="submit" onClick={this.handleClickCheckEligibility}>
                Find out if I'm eligible
              </Button>
            </FormGroup>
          </div>
        )}
        {formData.schoolEligible && !formData.consentAFE && (
          <AmazonFutureEngineerEligibilityForm
            email={formData.email}
            schoolId={formData.schoolId}
            updateFormData={this.updateAndStoreFormData}
          />
        )}
        {formData.schoolEligible &&
          formData.consentAFE &&
          !formData.signedIn && <AmazonFutureEngineerAccountConfirmation />}
        {formData.schoolEligible &&
          formData.consentAFE &&
          formData.signedIn &&
          this.loadCompletionPage()}
      </div>
    );
  }
}
