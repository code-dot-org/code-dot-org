/** @file Admin Override for Maker Discount Code Eligibility*/
import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import SchoolAutocompleteDropdown from '../../../../templates/SchoolAutocompleteDropdown';
import Button from "../../../../templates/Button";
import ValidationStep, {Status} from '../../../../lib/ui/ValidationStep';

export default class EligibilityChecklist extends Component {
  static propTypes = {
    statusPD: PropTypes.oneOf(Object.values(Status)).isRequired,
    statusStudentCount: PropTypes.oneOf(Object.values(Status)).isRequired,
  };

  state = {
    statusYear: Status.UNKNOWN,
    teacherID: "",
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

  handleSubmitId = (event) => {
    this.setState({teacherID : event.value});
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
            <Button
              color="orange"
              text="Submit"
              onClick={() => {}}
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
        <h2>School Data</h2>
        <SchoolAutocompleteDropdown
          setField={this.handleDropdownChange}
          value={submission.nces}
          showErrorMsg={errors.nces}
        />
        <h2>Admin Options</h2>
        <h4>Option 1: Link teacher account with other accounts</h4>
        <div>
          If teacher meets the eligibity requirements but is simply using a
           different email address for their account than what we have on file,
           please go to the Studio Person ID admin page to link this acccount
           to the saccount associated with the email address we have on file.
        </div>
        <h4>Option 2: Give teacher a discount code</h4>
        <div>
          If the teacher has already received their code and it was for the incorrect amount,
          email adaaccounts@adafruit.com so they can disable that code first. We should not be
          doing this override if the teacher has already used the incorrect code to purchase a kit.
          <form>
            <label>
              <input
                type="radio"
                name="discountAmount"
                value="full"
              />
              Teacher should receive 100% discount code (kit price would become $0)
            </label>
            <label>
              <input
                type="radio"
                name="discountAmount"
                value="partial"
              />
              Teacher should receive partial discount code (kit price would become $97.50)
            </label>
            <Button
              color="orange"
              text="Submit"
              onClick={() => {}}
            />
          </form>
        </div>
      </div>
    );
  }
}
