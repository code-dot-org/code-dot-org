import React from 'react';
import PropTypes from 'prop-types';
import {FormGroup, Button} from 'react-bootstrap';
import FieldGroup from '../code-studio/pd/form_components/FieldGroup';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';
import AmazonFutureEngineerEligibilityForm from './amazonFutureEngineerEligibilityForm';
import {pegasus, studio} from '@cdo/apps/lib/util/urlHelpers';

const styles = {
  intro: {
    paddingBottom: 10
  }
};

const sessionStorageKey = 'AmazonFutureEngineerEligibility';

export default class AmazonFutureEngineerEligibility extends React.Component {
  static propTypes = {
    signedIn: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      signedIn: this.props.signedIn,
      schoolEligible: null,
      formData: {
        consent: false
      }
    };
  }

  handleChange = change => {
    this.setState(
      {formData: {...this.state.formData, ...change}},
      this.saveToSessionStorage
    );
  };

  saveToSessionStorage = () => {
    sessionStorage.setItem(
      sessionStorageKey,
      JSON.stringify(this.state.formData)
    );
  };

  handleClickCheckEligibility = () => {
    // TO DO: actually check whether a school is eligible
    // TO DO: if ineligible, open new ineligibility page (markdown that marketing can edit)

    this.saveToSessionStorage({
      schoolId: this.state.formData.schoolId,
      email: this.state.formData.email
    });

    if (this.state.formData.schoolId === '-1') {
      this.handleEligibility(false);
    }

    $.ajax({
      url: '/dashboardapi/v1/schools/' + this.state.formData.schoolId,
      type: 'get',
      dataType: 'json'
    }).done(schoolData => {
      this.handleEligibility(schoolData.afe_high_needs);
    });
  };

  handleEligibility(isEligible) {
    isEligible
      ? this.setState({schoolEligible: isEligible})
      : (window.location = pegasus('/privacy'));
  }

  handleSchoolDropdownChange = (field, event) => {
    const newData = {
      schoolId: event ? event.value : '',
      schoolName: event ? event.label : ''
    };

    this.handleChange(newData);
  };

  render() {
    // TO DO: Disable button until email and school are filled in
    return (
      <div>
        {this.state.schoolEligible === null && (
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
                onChange={this.handleChange}
              />
              <SchoolAutocompleteDropdownWithLabel
                setField={this.handleSchoolDropdownChange}
                showRequiredIndicator={true}
                value={this.state.formData.schoolId}
              />
              <Button id="submit" onClick={this.handleClickCheckEligibility}>
                Find out if I'm eligible
              </Button>
            </FormGroup>
          </div>
        )}
        {this.state.schoolEligible === true &&
          this.state.formData.consent === false && (
            <AmazonFutureEngineerEligibilityForm
              email={this.state.formData.email}
              schoolId={this.state.formData.schoolId}
              onContinue={this.handleChange}
            />
          )}
        {this.state.schoolEligible === true &&
          this.state.formData.consent === true && (
            <AmazonFutureEngineerAccountConfirmation />
          )}
      </div>
    );
  }
}

// This might be better as pure functional component?
class AmazonFutureEngineerAccountConfirmation extends React.Component {
  render() {
    // TO DO: Add links to account sign up page.
    // Figure out how to check when user as completed sign up or sign in (promise?).
    return (
      <div>
        <h2>Almost done!</h2>
        <div>
          Thank you for completing your application information for the Amazon
          Future Engineer program. To finalize your participation and start
          receiving benefits, sign up for a Code.org account, or sign in if you
          already have one.
        </div>
        <div>Already have a Code.org account? Sign in.</div>
        <Button
          id="sign_up"
          href={studio(
            `/users/sign_in?user_return_to=${pegasus(
              '/amazon-future-engineer-eligibility'
            )}`
          )}
        >
          Sign up
        </Button>
      </div>
    );
  }
}
