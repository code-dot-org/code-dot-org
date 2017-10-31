/** @file Maker Board setup checker */
import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import Button from "./Button";
import SchoolAutocompleteDropdown from './SchoolAutocompleteDropdown';
import SchoolNotFound from './SchoolNotFound';

import SetupStep, {SUCCEEDED, FAILED, STEP_STATUSES, UNKNOWN} from '../lib/kits/maker/ui/SetupStep';

export default class EligibilityChecklist extends Component {
  static propTypes = {
    statusPD: PropTypes.oneOf(STEP_STATUSES).isRequired,
    statusStudentCount: PropTypes.oneOf(STEP_STATUSES).isRequired,
  };

  state = {
    statusYear: UNKNOWN,
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
    this.setState({ statusYear: (this.state.yearChoice ? SUCCEEDED : FAILED )});
  }

  // Temporarily saves the teaching-year
  // Param: accept - boolean - true for years to accept, false for deniable answers
  handleYearChange = (accept) => {
    this.setState({yearChoice : accept});
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
    }, this.checkShowFollowUp);
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
        <SetupStep
          stepName={i18n.eligibilityReqPD()}
          stepStatus={this.props.statusPD}
        >
          {i18n.eligibilityReqPDFail()}
        </SetupStep>
        <SetupStep
          stepName={i18n.eligibilityReqStudentCount()}
          stepStatus={this.props.statusStudentCount}
        >
          {i18n.eligibilityReqStudentCountFail()}
        </SetupStep>
        {/* Short version - displayed while 'focus' on other eligibility requirements */}
        {this.props.statusStudentCount !== SUCCEEDED &&
          <SetupStep
            stepName={i18n.eligibilityReqYear()}
            stepStatus={this.state.statusYear}
          />
        }
        {/* Long version - displayed while 'focus' on this eligibility requirements */}
        {this.props.statusStudentCount === SUCCEEDED &&
          <div>
            <SetupStep
              stepName={i18n.eligibilityReqYear()}
              stepStatus={this.state.statusYear}
              displayExplanation={true}
            >
              {i18n.eligibilityReqYearFail()}
            </SetupStep>
            <div>
              <b>{i18n.eligibilityReqYearConfirmInstructions()}</b>
              <div>
                <form>
                  <label>
                    <input type="radio" name="year" value="no" onChange={() => {this.handleYearChange(false);}} disabled={this.state.statusYear !== UNKNOWN ? true : false}/>
                    {i18n.eligibilityYearNo()}
                  </label>
                  <label>
                    <input type="radio" name="year" value="yes1718" onChange={() => {this.handleYearChange(true);}} disabled={this.state.statusYear !== UNKNOWN ? true : false}/>
                    {i18n.eligibilityYearYes1718()}
                  </label>
                  <label>
                    <input type="radio" name="year" value="yes1819" onChange={() => {this.handleYearChange(true);}} disabled={this.state.statusYear !== UNKNOWN ? true : false}/>
                    {i18n.eligibilityYearYes1819()}
                  </label>
                  <label>
                    <input type="radio" name="year" value="yesAfter" onChange={() => {this.handleYearChange(false);}} disabled={this.state.statusYear !== UNKNOWN ? true : false}/>
                    {i18n.eligibilityYearAfter()}
                  </label>
                  <label>
                    <input type="radio" name="year" value="unsure" onChange={() => {this.handleYearChange(false);}} disabled={this.state.statusYear !== UNKNOWN ? true : false}/>
                    {i18n.eligibilityYearUnknown()}
                  </label>
                  {/* Remove button after choice is made */}
                  {this.state.statusYear === UNKNOWN &&
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
        {this.state.statusYear === FAILED &&
          <div>{i18n.eligibilityYearDecline()}</div>
        }
        {this.state.statusYear === SUCCEEDED &&
          <div>
            <SchoolAutocompleteDropdown
              setField={this.handleDropdownChange}
              value={submission.nces}
              showErrorMsg={errors.nces}
            />
            {this.state.submission.nces !== "-1" && (
              <Button
                color="orange"
                text={i18n.confirmSchool()}
                onClick={() => {this.setState({displayDiscountAmount: true});}}
                hidden={this.state.displayDiscountAmount ? true : false}
              />
            )}
            {this.state.submission.nces === "-1" && (
              <div>
                <SchoolNotFound
                  onChange={this.handleChange}
                  schoolName={submission.schoolName}
                  schoolType={submission.schoolType}
                  schoolCity={submission.schoolCity}
                  schoolState={submission.schoolState}
                  schoolZip={submission.schoolZip}
                  showErrorMsg={errors.school}
                />
                <br/>
                <div>{i18n.eligibilitySchoolUnknown()} <b>{i18n.contactToContinue()}</b></div>
              </div>
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
