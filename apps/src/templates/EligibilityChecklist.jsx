/** @file Maker Discount Code Eligibility Checklist */
import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import Button from "./Button";
import SchoolAutocompleteDropdown from './SchoolAutocompleteDropdown';

import ValidationStep, {Status} from '../lib/ui/ValidationStep';

export default class EligibilityChecklist extends Component {
  static propTypes = {
    statusPD: PropTypes.oneOf(Object.values(Status)).isRequired,
    statusStudentCount: PropTypes.oneOf(Object.values(Status)).isRequired,
  };

  state = {
    statusYear: Status.UNKNOWN,
    yearChoice: false, // stores the teaching-year choice until submitted
    displayDiscountAmount: false,
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

  // Saves the teaching-year choice to trigger next step of actions
  handleSubmit = () => {
    this.setState({statusYear: (this.state.yearChoice ? Status.SUCCEEDED : Status.FAILED)});
  }

  handleDropdownChange = (field, event) => {
    this.setState({
      submission: {
        ...this.state.submission,
        [field]: event ? event.value : ''
      }
    });
  }

  handleNotFoundChange = (field, event) => {
    this.setState({
      submission: {
        ...this.state.submission,
        [field]: event.target.value
      }
    });
  }


  displayDiscountAmount = () => {
    this.setState({displayDiscountAmount: true});
  }

  setEligibleYear = () => {
    this.setState({yearChoice: true});
  }

  setIneligibleYear = () => {
    this.setState({yearChoice: false});
  }

  render() {
    const {submission, errors} = this.state;
    return (
      <div>
        <h2>
          {i18n.eligibilityRequirements()}
        </h2>
        <div>
          {i18n.eligibilityExplanation()}
        </div>
        <ValidationStep
          stepName={i18n.eligibilityReqPD()}
          stepStatus={this.props.statusPD}
        >
          {i18n.eligibilityReqPDFail()}
        </ValidationStep>
        <ValidationStep
          stepName={i18n.eligibilityReqStudentCount()}
          stepStatus={this.props.statusStudentCount}
        >
          {i18n.eligibilityReqStudentCountFail()}
        </ValidationStep>
        {/* Short version - displayed while 'focus' on other eligibility requirements */}
        {this.props.statusStudentCount !== Status.SUCCEEDED &&
          <ValidationStep
            stepName={i18n.eligibilityReqYear()}
            stepStatus={this.state.statusYear}
          />
        }
        {/* Long version - displayed while 'focus' on this eligibility requirements */}
        {this.props.statusStudentCount === Status.SUCCEEDED &&
          <div>
            <ValidationStep
              stepName={i18n.eligibilityReqYear()}
              stepStatus={this.state.statusYear}
              displayExplanation={true}
            >
              {i18n.eligibilityReqYearFail()}
            </ValidationStep>
            <div>
              <b>{i18n.eligibilityReqYearConfirmInstructions()}</b>
              <div>
                <form>
                  <label>
                    <input
                      type="radio"
                      name="year"
                      value="no"
                      onChange={this.setIneligibleYear}
                      disabled={this.state.statusYear !== Status.UNKNOWN}
                    />
                    {i18n.eligibilityYearNo()}
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="year"
                      value="yes1718"
                      onChange={this.setEligibleYear}
                      disabled={this.state.statusYear !== Status.UNKNOWN}
                    />
                    {i18n.eligibilityYearYes1718()}
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="year"
                      value="yes1819"
                      onChange={this.setEligibleYear}
                      disabled={this.state.statusYear !== Status.UNKNOWN}
                    />
                    {i18n.eligibilityYearYes1819()}
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="year"
                      value="yesAfter"
                      onChange={this.setIneligibleYear}
                      disabled={this.state.statusYear !== Status.UNKNOWN}
                    />
                    {i18n.eligibilityYearAfter()}
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="year"
                      value="unsure"
                      onChange={this.setIneligibleYear}
                      disabled={this.state.statusYear !== Status.UNKNOWN}
                    />
                    {i18n.eligibilityYearUnknown()}
                  </label>
                  {/* Remove button after choice is made */}
                  {this.state.statusYear === Status.UNKNOWN &&
                    <Button
                      color="orange"
                      text={i18n.submit()}
                      onClick={this.handleSubmit}
                    />
                  }
                </form>
              </div>
            </div>
          </div>
        }
        {this.state.statusYear === Status.FAILED &&
          <div>{i18n.eligibilityYearDecline()}</div>
        }
        {this.state.statusYear === Status.SUCCEEDED &&
          <div>
            <SchoolAutocompleteDropdown
              setField={this.handleDropdownChange}
              value={submission.nces}
              showErrorMsg={errors.nces}
            />
            <br/>
            {this.state.submission.nces !== "-1" && (
              <Button
                color="orange"
                text={i18n.confirmSchool()}
                onClick={this.displayDiscountAmount}
                hidden={this.state.displayDiscountAmount}
              />
            )}
            {this.state.submission.nces === "-1" && (
              <div>{i18n.eligibilitySchoolUnknown()} <b>{i18n.contactToContinue()}</b></div>
            )}
            {this.state.displayDiscountAmount  &&
              <div>
                TEMP:Discount Amount for your school
                <Button
                  color="orange"
                  text={i18n.getCode()}
                  onClick={() => {}}
                />
              </div>
            }
          </div>
        }
      </div>
    );
  }
}
