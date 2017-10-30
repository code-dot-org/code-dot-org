/** @file Maker Board setup checker */
import React, {Component} from 'react';
import i18n from "@cdo/locale";
import Button from "./Button";

import SetupStep, {
  WAITING,
  SUCCEEDED,
} from '../lib/kits/maker/ui/SetupStep';

export default class EligibilityChecklist extends Component {
  state = {
    isDetecting: false,
    caughtError: null,
    statusPD: WAITING,
    statusStudentCount: WAITING,
    statusYear: WAITING,
    yearDecline: false,
    displayDecline: false,
    displayDiscountAmount: false,
  };

  handleSubmit = () => {
    this.setState({displayDecline : true});
  }

  handleChange = (field, event) => {
    this.setState({
      submission: {
        ...this.state.submission,
        [field]: event.target.value
      }
    });
  }

  handleDropdownChange = (field, event) => {
    this.setState({
      submission: {
        ...this.state.submission,
        [field]: event ? event.value : ''
      }
    });
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
          stepStatus={this.state.statusPD}
        >
          {i18n.eligibilityReqPDFail()}
        </SetupStep>
        <SetupStep
          stepName={i18n.eligibilityReqStudentCount()}
          stepStatus={this.state.statusStudentCount}
          subtleStyle={true}
        >
          {i18n.eligibilityReqStudentCountFail()}
        </SetupStep>
        <SetupStep
          stepName={i18n.eligibilityReqYear()}
          stepStatus={WAITING}
          subtleStyle={true}
        >
          {i18n.eligibilityReqYearFail()}
        </SetupStep>
        {this.state.statusStudentCount === SUCCEEDED &&
          <div>
            {i18n.eligibilityReqYearConfirmInstructions()}
            <div>
              <form>
                <label>
                  <input type="radio" name="year" value="no" onChange={() => {this.handleChange(false);}} disabled={this.state.displayDecline ? false : true}/>
                  {i18n.eligibilityYearNo()}
                </label>
                <label>
                  <input type="radio" name="year" value="yes1718" onChange={() => {this.handleChange(true);}} disabled={this.state.displayDecline ? false : true}/>
                  {i18n.eligibilityYearYes1718()}
                </label>
                <label>
                  <input type="radio" name="year" value="yes1819" onChange={() => {this.handleChange(true);}} disabled={this.state.displayDecline ? false : true}/>
                  {i18n.eligibilityYearYes1819()}
                </label>
                <label>
                  <input type="radio" name="year" value="yesAfter" onChange={() => {this.handleChange(false);}} disabled={this.state.displayDecline ? false : true}/>
                  {i18n.eligibilityYearAfter()}
                </label>
                <label>
                  <input type="radio" name="year" value="unsure" onChange={() => {this.handleChange(false);}} disabled={this.state.displayDecline ? false : true}/>
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
