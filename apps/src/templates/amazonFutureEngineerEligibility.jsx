import React from 'react';
import {FormGroup, Button} from 'react-bootstrap';
import FieldGroup from '../code-studio/pd/form_components/FieldGroup';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';
import AmazonFutureEngineerEligibilityForm from './AmazonFutureEngineerEligibilityForm';

const styles = {
  intro: {
    paddingBottom: 10
  }
};

export default class AmazonFutureEngineerEligibility extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      schoolEligible: null,
      consent: false,
      email: ''
    };
  }

  handleChange = change => {
    this.setState(change);
  };

  submit = () => {
    // TO DO: actually check whether a school is eligible
    // TO DO: if ineligible, open new ineligibility page (markdown that marketing can edit)
    this.setState({
      schoolEligible: true
    });
  };

  handleSchoolDropdownChange = (field, event) => {
    this.setState({
      schoolId: event ? event.value : '',
      schoolName: event ? event.label : ''
    });
  };

  render() {
    // TO DO: figure out how FormGroup id/className were used in regional partner mini contact
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
                required={false}
                onChange={this.handleChange}
              />
              <SchoolAutocompleteDropdownWithLabel
                setField={this.handleSchoolDropdownChange}
                showRequiredIndicator={true}
                value={this.state.schoolId}
              />
              <Button id="submit" onClick={this.submit}>
                Find out if I'm eligible
              </Button>
            </FormGroup>
          </div>
        )}
        {this.state.schoolEligible === true && this.state.consent === false && (
          <AmazonFutureEngineerEligibilityForm
            email={this.state.email}
            schoolId={this.state.schoolId}
            onContinue={this.handleChange}
          />
        )}
        {this.state.schoolEligible !== null && this.state.consent === true && (
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
    // TO DO: Need to put submission data
    //  (currently kept in state of AmazonFutureEngineerEligibility component)
    //  somewhere (session cookie?) that will persist while they sign up or sign in,
    // at which point we'll send an API request to Amazon's Pardot API endpoint.
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
        <Button id="sign_up" onClick={() => {}}>
          Sign up
        </Button>
      </div>
    );
  }
}
