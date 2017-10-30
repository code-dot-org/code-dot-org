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
    displayDecline: false,
    displayDiscountAmount: false,
  };

  handleSubmit = () => {
    if (this.state.statusYear === FAILED){
      this.setState({displayDecline : true});
    }
  }

  handleYearChange = (accept) => {
    this.setState({ statusYear: (accept ? SUCCEEDED : FAILED )});
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
        <SetupStep
          stepName={i18n.eligibilityReqYear()}
          stepStatus={this.state.statusYear}
        >
          {i18n.eligibilityReqYearFail()}
        </SetupStep>
        {this.props.statusStudentCount === SUCCEEDED &&
          <div>
            {i18n.eligibilityReqYearConfirmInstructions()}
            <div>
              <form>
                <label>
                  <input type="radio" name="year" value="no" onChange={() => {this.handleYearChange(false);}} disabled={this.state.displayDecline ? true : false}/>
                  {i18n.eligibilityYearNo()}
                </label>
                <label>
                  <input type="radio" name="year" value="yes1718" onChange={() => {this.handleYearChange(true);}} disabled={this.state.displayDecline ? true : false}/>
                  {i18n.eligibilityYearYes1718()}
                </label>
                <label>
                  <input type="radio" name="year" value="yes1819" onChange={() => {this.handleYearChange(true);}} disabled={this.state.displayDecline ? true : false}/>
                  {i18n.eligibilityYearYes1819()}
                </label>
                <label>
                  <input type="radio" name="year" value="yesAfter" onChange={() => {this.handleYearChange(false);}} disabled={this.state.displayDecline ? true : false}/>
                  {i18n.eligibilityYearAfter()}
                </label>
                <label>
                  <input type="radio" name="year" value="unsure" onChange={() => {this.handleYearChange(false);}} disabled={this.state.displayDecline ? true : false}/>
                  {i18n.eligibilityYearUnknown()}
                </label>
                <Button
                  color="orange"
                  text={i18n.submit()}
                  onClick={this.handleSubmit}
                  hidden={this.state.displayDecline ? true : false}
                />
              </form>
              {this.state.displayDecline &&
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
                {this.state.displayDiscountAmount &&
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
          </div>
        }
      </div>
    );
  }
}
