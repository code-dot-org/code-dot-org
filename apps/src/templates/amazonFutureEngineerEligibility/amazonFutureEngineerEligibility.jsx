import firehoseClient from '@cdo/apps/lib/util/firehose';
import React from 'react';
import PropTypes from 'prop-types';
import {FormGroup, Button} from 'react-bootstrap';
import FieldGroup from '../../code-studio/pd/form_components/FieldGroup';
import color from '@cdo/apps/util/color';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';
import AmazonFutureEngineerEligibilityForm from './amazonFutureEngineerEligibilityForm';
import AmazonFutureEngineerAccountConfirmation from './amazonFutureEngineerAccountConfirmation';
import {studio, pegasus} from '@cdo/apps/lib/util/urlHelpers';
import {isEmail} from '@cdo/apps/util/formatValidation';

const styles = {
  intro: {
    paddingBottom: 10
  },
  container: {
    borderColor: color.teal,
    borderWidth: 'thin',
    borderStyle: 'solid',
    padding: '10px 15px 10px 15px'
  },
  button: {
    backgroundColor: color.orange,
    color: color.white
  },
  header: {
    marginTop: '10px'
  }
};

const sessionStorageKey = 'AmazonFutureEngineerEligibility';

const VALIDATION_STATE_ERROR = 'error';

export default class AmazonFutureEngineerEligibility extends React.Component {
  static propTypes = {
    signedIn: PropTypes.bool.isRequired,
    schoolId: PropTypes.string,
    schoolEligible: PropTypes.bool,
    accountEmail: PropTypes.string,
    isStudentAccount: PropTypes.bool
  };

  constructor(props) {
    super(props);

    let sessionEligibilityData = getSessionData();

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

  // If a user has gone through the eligibility flow (sessionStorage),
  // or has school information associated with their account (props),
  // we use that for determining their eligibilty.
  // If the school information associated with their account
  // is ineligible, we still allow them to provide their school information
  // in case their account information is out of date.
  // Redirect to ineligible page ('/afe/start-codeorg') if ineligible.
  // Otherwise, we ask them for their school information.
  checkInitialSchoolEligibility = sessionEligibilityData => {
    if (sessionEligibilityData.schoolEligible || this.props.schoolEligible) {
      return true;
    } else if (sessionEligibilityData.schoolEligible === false) {
      window.location = pegasus('/afe/start-codeorg');
    }

    return null;
  };

  updateFormData = change => {
    this.setState({formData: {...this.state.formData, ...change}});
  };

  // Wrapper to allow saving data to session
  // once a user submits the full eligibility form.
  updateAndStoreFormData = change => {
    let newFormData = {...this.state.formData, ...change};

    sessionStorage.setItem(sessionStorageKey, JSON.stringify(newFormData));
    this.setState({formData: newFormData});
    this.root.scrollIntoView();
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
      firehoseClient.putRecord(
        {
          study: 'amazon-future-engineer-eligibility',
          event: 'ineligible'
        },
        {callback: () => (window.location = pegasus('/afe/start-codeorg'))}
      );
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
    return fetch('/dashboardapi/v1/amazon_future_engineer_submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state.formData)
    });
  };

  loadCompletionPage = async () => {
    let {submissionAccepted} = getSessionData();
    let {submissionSent} = this.state;

    if (!submissionAccepted && !submissionSent) {
      this.setState({submissionSent: true});
      const response = await this.submitToAFE();
      submissionAccepted = response.ok;
      updateSessionData({submissionAccepted});

      if (!submissionAccepted) {
        const bodyText = await response.text();
        const submissionError =
          'Form submission failed with HTTP ' +
          `${response.status} ${response.statusText}: ${bodyText}`;
        console.error(submissionError);
        this.setState({
          submissionError,
          submissionErrorTime: new Date().toISOString()
        });
      }
    }

    if (submissionAccepted) {
      window.location = pegasus('/afe/success');
    }
  };

  render() {
    let {formData, submissionError} = this.state;

    if (this.props.isStudentAccount) {
      return StudentAccountNotification;
    }

    if (submissionError) {
      return (
        <SubmissionError
          submissionError={this.state.submissionError}
          submissionErrorTime={this.state.submissionErrorTime}
        />
      );
    }

    if (formData.schoolEligible && formData.consentAFE && formData.signedIn) {
      this.loadCompletionPage();
      return (
        <div>
          <h2>Your request is being processed</h2>
          <p>Please wait...</p>
        </div>
      );
    }

    return (
      <div style={styles.container} ref={el => (this.root = el)}>
        {formData.schoolEligible === null && (
          <div>
            <h2 style={styles.header}>Am I eligible?</h2>
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
                style={styles.schoolInput}
              />
              <Button
                id="submit"
                onClick={this.handleClickCheckEligibility}
                style={styles.button}
              >
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
      </div>
    );
  }
}

const StudentAccountNotification = (
  <div style={styles.container}>
    <h2 style={styles.header}>You need a Code.org teacher account</h2>
    <div>
      <p>You're currently signed in to Code.org with a student account.</p>
      <p>
        You'll need to sign in with a teacher account to apply to receive Amazon
        Future Engineer benefits. You can use the button below to sign out, then
        return to <a href={pegasus('/afe')}>code.org/afe</a> to continue.
      </p>
      <Button
        id="sign_out"
        href={studio('/users/sign_out')}
        style={styles.button}
      >
        Sign out
      </Button>
    </div>
  </div>
);

const SubmissionError = ({submissionError, submissionErrorTime}) => (
  <div style={styles.container}>
    <h2>An error occurred while processing your submission.</h2>
    <p>
      Please <a href="mailto:support@code.org">contact support@code.org</a> for
      further assistance, and include the following information for reference:
    </p>
    <ul>
      <li>Your email: {getSessionData().email}</li>
      <li>Error time: {submissionErrorTime}</li>
      <li>Error text: {submissionError}</li>
    </ul>
  </div>
);
SubmissionError.propTypes = {
  submissionError: PropTypes.text,
  submissionErrorTime: PropTypes.text
};

function getSessionData() {
  return JSON.parse(sessionStorage.getItem(sessionStorageKey)) || {};
}

function updateSessionData(data) {
  sessionStorage.setItem(
    sessionStorageKey,
    JSON.stringify({
      ...getSessionData(),
      ...data
    })
  );
}
