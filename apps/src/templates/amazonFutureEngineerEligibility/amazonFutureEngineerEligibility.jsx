import React from 'react';
import PropTypes from 'prop-types';
import {FormGroup, Button} from 'react-bootstrap';
import FieldGroup from '../../code-studio/pd/form_components/FieldGroup';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel';
import AmazonFutureEngineerEligibilityForm from './amazonFutureEngineerEligibilityForm';
import AmazonFutureEngineerAccountConfirmation from './amazonFutureEngineerAccountConfirmation';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';

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

  updateFormData = change => {
    this.setState({formData: {...this.state.formData, ...change}});
  };

  saveToSessionStorage = () => {
    sessionStorage.setItem(
      sessionStorageKey,
      JSON.stringify(this.state.formData)
    );
  };

  handleClickCheckEligibility = () => {
    // TO DO: if ineligible, open new ineligibility page (markdown that marketing can edit)

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

    this.updateFormData(newData);
  };

  loadConfirmationPage = () => {
    this.saveToSessionStorage();

    return <AmazonFutureEngineerAccountConfirmation />;
  };

  render() {
    let {formData} = this.state;

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
                onChange={this.updateFormData}
              />
              <SchoolAutocompleteDropdownWithLabel
                setField={this.handleSchoolDropdownChange}
                showRequiredIndicator={true}
                value={formData.schoolId}
              />
              <Button id="submit" onClick={this.handleClickCheckEligibility}>
                Find out if I'm eligible
              </Button>
            </FormGroup>
          </div>
        )}
        {this.state.schoolEligible === true && formData.consent === false && (
          <AmazonFutureEngineerEligibilityForm
            email={formData.email}
            schoolId={formData.schoolId}
            onContinue={this.updateFormData}
          />
        )}
        {this.state.schoolEligible === true &&
          formData.consent === true &&
          this.loadConfirmationPage()}
      </div>
    );
  }
}
