/** @file Maker Board setup checker */
import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import Button from "./Button";

import SetupStep, {SUCCEEDED, WAITING, FAILED, STEP_STATUSES} from '../lib/kits/maker/ui/SetupStep';

export default class EligibilityChecklist extends Component {
  static propTypes = {
    statusPD: PropTypes.oneOf(STEP_STATUSES).isRequired,
    statusStudentCount: PropTypes.oneOf(STEP_STATUSES).isRequired,
  };

  state = {
    statusYear: WAITING,
    yearChoice: false, // stores the teaching-year choice until submitted
    displayDiscountAmount: false,
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

  render() {
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
                    <input type="radio" name="year" value="no" onChange={() => {this.handleYearChange(false);}} disabled={this.state.statusYear !== WAITING ? true : false}/>
                    {i18n.eligibilityYearNo()}
                  </label>
                  <label>
                    <input type="radio" name="year" value="yes1718" onChange={() => {this.handleYearChange(true);}} disabled={this.state.statusYear !== WAITING ? true : false}/>
                    {i18n.eligibilityYearYes1718()}
                  </label>
                  <label>
                    <input type="radio" name="year" value="yes1819" onChange={() => {this.handleYearChange(true);}} disabled={this.state.statusYear !== WAITING ? true : false}/>
                    {i18n.eligibilityYearYes1819()}
                  </label>
                  <label>
                    <input type="radio" name="year" value="yesAfter" onChange={() => {this.handleYearChange(false);}} disabled={this.state.statusYear !== WAITING ? true : false}/>
                    {i18n.eligibilityYearAfter()}
                  </label>
                  <label>
                    <input type="radio" name="year" value="unsure" onChange={() => {this.handleYearChange(false);}} disabled={this.state.statusYear !== WAITING ? true : false}/>
                    {i18n.eligibilityYearUnknown()}
                  </label>
                  {/* Remove button after choice is made */}
                  {this.state.statusYear === WAITING &&
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
            <div>School Dropdown</div>
            <Button
              color="orange"
              text={i18n.confirmSchool()}
              onClick={() => {this.setState({displayDiscountAmount: true});}}
              hidden={this.state.displayDiscountAmount ? true : false}
            />
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
