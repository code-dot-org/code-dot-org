/** @file Admin Override for Maker Discount Code Eligibility*/
import React, {Component} from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import ValidationStep, {Status} from '@cdo/apps/lib/ui/ValidationStep';
import {isUnit6IntentionEligible} from '../util/discountLogic';
import Unit6ValidationStep from './Unit6ValidationStep';

export default class DiscountAdminOverride extends Component {
  state = {
    submitting: false,
    teacherID: '',
    statusPD: Status.UNKNOWN,
    statusAcademicYearPD: Status.UNKNOWN,
    statusStudentCount: Status.UNKNOWN,
    statusYear: Status.UNKNOWN,
    unit6Intention: '',
    userSchool: {},
    applicationSchool: {},
    adminOverride: 'None',
    fullDiscount: false,
    discountCode: '',
    overrideValue: null
  };

  handleSubmitId = () => {
    const teacherID = this.teacherID.value;
    this.setState({
      submitting: true
    });
    $.ajax({
      url: '/maker/application_status',
      type: 'get',
      dataType: 'json',
      data: {
        user: teacherID
      }
    })
      .done(data => {
        this.updateApplicationStatus(data, teacherID);
      })
      .fail((jqXHR, textStatus) => {
        console.log('failure');
        this.setState({
          submitting: false
        });
      });
  };

  /**
   * Updates our local state based on data received from the server, either from
   * calling GET /maker/application_status, or having added an override by doing
   * a POST to /maker/override
   */
  updateApplicationStatus(data, teacherID) {
    const {application} = data;
    this.setState({
      teacherID,
      submitting: false,
      statusPD: application.is_pd_eligible ? Status.SUCCEEDED : Status.FAILED,
      statusStudentCount: application.is_progress_eligible
        ? Status.SUCCEEDED
        : Status.FAILED,
      statusYear: isUnit6IntentionEligible(application.unit_6_intention)
        ? Status.SUCCEEDED
        : Status.FAILED,
      unit6Intention: application.unit_6_intention,
      userSchool: application.user_school,
      applicationSchool: application.application_school,
      adminOverride: application.admin_set_status
        ? application.full_discount
          ? 'Full Discount (AK/HI)'
          : 'Full Discount (continental US)'
        : 'None',
      fullDiscount: application.full_discount,
      discountCode: application.discount_code,
      overrideValue: null
    });
  }

  handleDiscountCodeOverride = () => {
    const teacherID = this.state.teacherID;
    this.setState({submitting: true});
    $.ajax({
      url: '/maker/override',
      type: 'post',
      dataType: 'json',
      data: {
        user: teacherID,
        full_discount: this.state.overrideValue === 'full'
      }
    })
      .done(data => {
        this.updateApplicationStatus(data, teacherID);
      })
      .fail((jqXHR, textStatus) => {
        console.log('failure');
        this.setState({
          submitting: false
        });
      });
  };

  handleOverrideChange = event => {
    this.setState({
      overrideValue: event.target.value
    });
  };

  render() {
    return (
      <div>
        <h1 style={styles.title}>Circuit Playground Kits Admin Override</h1>
        <label>
          <div>
            Teacher email address, username, or user_id (for the account they
            are using in the classroom):
          </div>
          <div style={styles.teacherContainer}>
            <input
              ref={input => (this.teacherID = input)}
              style={styles.teacherInput}
            />
            <Button
              __useDeprecatedTag
              color={Button.ButtonColor.orange}
              text={this.state.submitting ? i18n.submitting() : i18n.submit()}
              onClick={this.handleSubmitId}
              disabled={this.state.submitting}
            />
          </div>
        </label>
        {this.state.teacherID && (
          <div>
            <h2>Eligibility requirements for {this.state.teacherID}</h2>
            <ValidationStep
              stepName={i18n.eligibilityReqPD()}
              stepStatus={this.state.statusPD}
            />
            <ValidationStep
              stepName={i18n.eligibilityReqStudentCount()}
              stepStatus={this.state.statusStudentCount}
            />
            <Unit6ValidationStep
              key={this.state.teacherID}
              showRadioButtons={false}
              previousStepsSucceeded={true}
              stepStatus={this.state.statusYear}
              initialChoice={this.state.unit6Intention}
              disabled={true}
              onSubmit={() => {}}
            />
            <h2>School Data</h2>
            <div>
              We track both the user's current school, and also the school that
              they confirmed in the application (if they made it that far into
              the process). These will be different if (a) the user hasn't
              confirmed a school in the application or (b) the user changed
              their school after confirming in the application.
            </div>
            <table>
              <thead>
                <tr>
                  <td />
                  <td>Current school</td>
                  <td>Application school</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Id:</td>
                  <td>{this.state.userSchool.id}</td>
                  <td>{this.state.applicationSchool.id}</td>
                </tr>
                <tr>
                  <td>Name:</td>
                  <td>{this.state.userSchool.name}</td>
                  <td>{this.state.applicationSchool.name}</td>
                </tr>
                <tr>
                  <td>High Needs?:</td>
                  <td>
                    {this.state.userSchool.high_needs !== null &&
                      this.state.userSchool.high_needs.toString()}
                  </td>
                  <td>
                    {this.state.applicationSchool.high_needs !== null &&
                      this.state.applicationSchool.high_needs.toString()}
                  </td>
                </tr>
              </tbody>
            </table>
            <h2>Admin Options</h2>
            <div>Current code: {this.state.discountCode}</div>
            <div>Current override: {this.state.adminOverride}</div>
            {!this.state.discountCode && this.state.adminOverride === 'None' && (
              <div>
                <h4>Option 1: Link teacher account with other accounts</h4>
                <div>
                  If teacher meets the eligibity requirements but is simply
                  using a different email address for their account than what we
                  have on file, please go to the{' '}
                  <a href="https://studio.code.org/admin/studio_person">
                    Studio Person ID admin page{' '}
                  </a>{' '}
                  to link this account to the account associated with the email
                  address we have on file.
                </div>
                <h4>Option 2: Give teacher a discount code</h4>
                <div>
                  If the teacher has already received their code and it was for
                  the incorrect amount, email{' '}
                  <a href="mailto:adaaccounts@adafruit.com">
                    {' '}
                    adaaccounts@adafruit.com{' '}
                  </a>
                  so they can disable that code first. We should not be doing
                  this override if the teacher has already used the incorrect
                  code to purchase a kit.
                </div>
                <div style={styles.radioContainer}>
                  <label>
                    <input
                      style={styles.radio}
                      type="radio"
                      name="discountAmount"
                      value="partial"
                      checked={this.state.overrideValue === 'partial'}
                      onChange={this.handleOverrideChange}
                    />
                    Teacher should receive full discount code (without AK/HI
                    shipping)
                  </label>
                  <label>
                    <input
                      style={styles.radio}
                      type="radio"
                      name="discountAmount"
                      value="full"
                      checked={this.state.overrideValue === 'full'}
                      onChange={this.handleOverrideChange}
                    />
                    Teacher should receive full discount code (with AK/HI
                    shipping)
                  </label>
                </div>
                <Button
                  __useDeprecatedTag
                  color={Button.ButtonColor.orange}
                  text={
                    this.state.submitting ? i18n.submitting() : i18n.submit()
                  }
                  onClick={this.handleDiscountCodeOverride}
                  disabled={this.state.submitting || !this.state.overrideValue}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  title: {
    fontSize: 32
  },
  teacherContainer: {
    display: 'flex',
    marginTop: 5
  },
  teacherInput: {
    marginRight: 10,
    padding: '0 10px'
  },
  radioContainer: {
    margin: '5px 0'
  },
  radio: {
    marginRight: 5
  }
};
