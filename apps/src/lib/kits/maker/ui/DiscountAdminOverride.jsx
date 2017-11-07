/** @file Admin Override for Maker Discount Code Eligibility*/
import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import SchoolAutocompleteDropdown from '../../../../templates/SchoolAutocompleteDropdown';

import ValidationStep, {Status} from '../../../../lib/ui/ValidationStep';

export default class EligibilityChecklist extends Component {
  static propTypes = {
    statusPD: PropTypes.oneOf(Object.values(Status)).isRequired,
    statusStudentCount: PropTypes.oneOf(Object.values(Status)).isRequired,
  };

  state = {
    statusYear: Status.UNKNOWN,
    submission: {
      name: '',
      email: '',
      role: '',
      country: 'United States',
      hoc: '',
      nces: '',
      schoolName: '',
      schoolCity: '',
      schoolState: '',
      schoolZip: '',
      schoolType: '',
      afterSchool: '',
      tenHours: '',
      twentyHours: '',
      otherCS: false,
      followUpFrequency: '',
      followUpMore: '',
      acceptedPledge: false
    },
    errors: {
      invalidEmail: false
    }
  };

  handleDropdownChange = (field, event) => {
    this.setState({
      submission: {
        ...this.state.submission,
        [field]: event ? event.value : ''
      }
    });
  }

  render() {
    const {submission, errors} = this.state;
    return (
      <div>
        <h1>Circuit Playground Kits Admin Override</h1>
        <form>
          <label>
            <div>Teacher email address or username (for the account they are using in the classroom):</div>
            <input
              value=""
              onChange={() => {}}
            />
          </label>
        </form>
        <h2>Eligibility requirements for </h2>
        <ValidationStep
          stepName={i18n.eligibilityReqPD()}
          stepStatus={this.props.statusPD}
        />
        <ValidationStep
          stepName={i18n.eligibilityReqStudentCount()}
          stepStatus={this.props.statusStudentCount}
        />
        <ValidationStep
          stepName={i18n.eligibilityReqYear()}
          stepStatus={this.state.statusYear}
        />
        <h2>School data</h2>
        <SchoolAutocompleteDropdown
          setField={this.handleDropdownChange}
          value={submission.nces}
          showErrorMsg={errors.nces}
        />
      </div>
    );
  }
}
