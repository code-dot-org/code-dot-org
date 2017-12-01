/** @file Admin Override for Maker Discount Code Eligibility*/
import React, {Component} from 'react';
import i18n from "@cdo/locale";
import Button from "@cdo/apps/templates/Button";
import ValidationStep, {Status} from '@cdo/apps/lib/ui/ValidationStep';

const styles = {
  title: {
    fontSize: 32,
  },
  teacherContainer: {
    display: 'flex',
    marginTop: 5,
  },
  teacherInput: {
    marginRight: 10
  },
  radioContainer: {
    margin: '5px 0',
  },
  radio: {
    marginRight: 5
  }
};

export default class DiscountAdminOverride extends Component {
  state = {
    submittingTeacher: false,
    submittingOverride: false,
    teacherID: "",
    statusPD: Status.UNKNOWN,
    statusStudentCount: Status.UNKNOWN,
    schoolId: null,
    schoolFullDiscount: false,
    adminOverride: 'None',
  };

  handleSubmitId = () => {
    this.setState({
      submittingTeacher: true
    });
    setTimeout(() => {
      this.setState({
        teacherID: this.teacherID.value,
        submittingTeacher: false,
        // TODO: get real data from server
        statusPD: Status.SUCCEEDED,
        statusStudentCount: Status.FAILED,
        schoolName: "something",
        schoolFullDiscount: false,
        adminOverride: 'Full Discount',
      });
    }, 1000);
  }

  handleDiscountCodeOverride = () => {
    this.setState({submittingOverride: true});
    setTimeout(() => {
      this.setState({
        submittingOverride: false
      });
    }, 1000);
  }

  render() {
    // TODO: indicate somewhere if we already have an admin override

    return (
      <div>
        <h1 style={styles.title}>Circuit Playground Kits Admin Override</h1>
        <label>
          <div>Teacher email address or username (for the account they are using in the classroom):</div>
          <div style={styles.teacherContainer}>
            <input
              ref={input => this.teacherID = input}
              style={styles.teacherInput}
            />
            <Button
              color={Button.ButtonColor.orange}
              text={this.state.submittingTeacher ? i18n.submitting() : i18n.submit()}
              onClick={this.handleSubmitId}
              disabled={this.state.submittingTeacher}
            />
          </div>
        </label>
        {this.state.teacherID &&
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
            <ValidationStep
              stepName={i18n.eligibilityReqYear()}
              stepStatus={Status.UNKNOWN}
            />
            <h2>School Data</h2>
            <div>
              <div><b>Name: </b>{this.state.schoolName || 'None'}</div>
              {this.state.schoolName &&
                <div>
                  <b>High needs (i.e. receives full discount): </b>{this.state.schoolFullDiscount.toString()}
                </div>
              }
            </div>
            <h2>Existing Admin Override</h2>
            <div>{this.state.adminOverride}</div>
            <h2>Admin Options</h2>
            <h4>Option 1: Link teacher account with other accounts</h4>
            <div>
              If teacher meets the eligibity requirements but is simply using a
               different email address for their account than what we have on file,
               please go to the <a href="https://studio.code.org/admin/studio_person">
               Studio Person ID admin page </a> to link this acccount
               to the account associated with the email address we have on file.
            </div>
            <h4>Option 2: Give teacher a discount code</h4>
            <div>
              If the teacher has already received their code and it was for the incorrect amount,
              email <a href="mailto:adaaccounts@adafruit.com"> adaaccounts@adafruit.com </a>
              so they can disable that code first. We should not be doing this override if the
              teacher has already used the incorrect code to purchase a kit.
            </div>
            <div style={styles.radioContainer}>
              <label>
                <input
                  style={styles.radio}
                  type="radio"
                  name="discountAmount"
                  value="full"
                />
                Teacher should receive 100% discount code (kit price would become $0)
              </label>
              <label>
                <input
                  style={styles.radio}
                  type="radio"
                  name="discountAmount"
                  value="partial"
                />
                Teacher should receive partial discount code (kit price would become $97.50)
              </label>
            </div>
            <Button
              color={Button.ButtonColor.orange}
              text={this.state.submittingOverride ? i18n.submitting() : i18n.submit()}
              onClick={this.handleDiscountCodeOverride}
              disabled={this.state.submittingOverride}
            />
          </div>
        }
      </div>
    );
  }
}
