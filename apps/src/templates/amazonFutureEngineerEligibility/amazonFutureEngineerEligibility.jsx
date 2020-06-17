import React from 'react';
import {FormGroup, Button} from 'react-bootstrap';
import FieldGroup from '../../code-studio/pd/form_components/FieldGroup';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';
import AmazonFutureEngineerEligibilityForm from './amazonFutureEngineerEligibilityForm';
import AmazonFutureEngineerAccountConfirmation from './amazonFutureEngineerAccountConfirmation';

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
