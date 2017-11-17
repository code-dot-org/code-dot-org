/** @file Maker Discount Code Eligibility Checklist */
import React, {Component, PropTypes} from 'react';
import i18n from "@cdo/locale";
import Button from "./Button";
import SchoolAutocompleteDropdownWithLabel from './census2017/SchoolAutocompleteDropdownWithLabel';

import ValidationStep, {Status} from '../lib/ui/ValidationStep';

export default class EligibilityChecklist extends Component {
  static propTypes = {
    statusPD: PropTypes.oneOf(Object.values(Status)).isRequired,
    statusStudentCount: PropTypes.oneOf(Object.values(Status)).isRequired,
    unit6Intention: PropTypes.string,
  };

  state = {
    statusYear: Status.UNKNOWN,
    yearChoice: null, // stores the teaching-year choice until submitted
    submitting: false,
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

  constructor(props) {
    super(props);

    // If we had already submitted our intentions for unit 6, initialize component
    // state with that data
    if (props.unit6Intention) {
      this.state = {
        ...this.state,
        yearChoice: props.unit6Intention,
        statusYear: (props.unit6Intention === 'yes1718' ||
          props.unit6Intention === 'yes1819') ? Status.SUCCEEDED : Status.FAILED
      };
    }
  }

  // Saves the teaching-year choice to trigger next step of actions
  handleSubmit = () => {
    this.setState({submitting: true});
    $.ajax({
     url: "/maker/apply",
     type: "post",
     dataType: "json",
     data: {
       unit_6_intention: this.state.yearChoice
     }
   }).done(data => {
     this.setState({
       statusYear: data.valid ? Status.SUCCEEDED : Status.FAILED,
       submitting: false
     });
   }).fail((jqXHR, textStatus) => {
     // TODO: should probably introduce some error UI
     console.error(textStatus);
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

  handleChangeIntention = event => {
    this.setState({yearChoice: event.target.value});
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
                  {[
                    ['no', i18n.eligibilityYearNo()],
                    ['yes1718', i18n.eligibilityYearYes1718()],
                    ['yes1819', i18n.eligibilityYearYes1819()],
                    ['yesAfter', i18n.eligibilityYearAfter()],
                    ['unsure', i18n.eligibilityYearUnknown()],
                  ].map(([value, description]) =>
                    <label key={value}>
                      <input
                        type="radio"
                        name="year"
                        value={value}
                        checked={this.state.yearChoice === value}
                        onChange={this.handleChangeIntention}
                        disabled={this.state.statusYear !== Status.UNKNOWN}
                      />
                    {description}
                    </label>
                  )}
                  {/* Remove button after choice is made */}
                  {this.state.statusYear === Status.UNKNOWN &&
                    <Button
                      color="orange"
                      text={this.state.submitting ? i18n.submitting() : i18n.submit()}
                      onClick={this.handleSubmit}
                      disabled={this.state.submitting}
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
            <SchoolAutocompleteDropdownWithLabel
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
