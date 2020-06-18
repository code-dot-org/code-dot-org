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
    signedIn: PropTypes.bool.isRequired,
    schoolId: PropTypes.string,
    schoolEligible: PropTypes.bool
  };

  constructor(props) {
    super(props);

    let sessionEligibilityData =
      JSON.parse(sessionStorage.getItem(sessionStorageKey)) || {};

    this.state = {
      formData: {
        signedIn: this.props.signedIn,
        schoolEligible:
          sessionEligibilityData.schoolEligible ||
          this.props.schoolEligible ||
          null,
        schoolId:
          sessionEligibilityData.schoolId || this.props.schoolId || null,
        consentAFE: sessionEligibilityData.consentAFE || false
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

  loadCompletionPage = () => {
    // Do API calls here.

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
