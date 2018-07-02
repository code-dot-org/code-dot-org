import React from 'react';
import {
  FormGroup,
  ControlLabel
} from 'react-bootstrap';
import Teachercon1819FormComponent from './Teachercon1819FormComponent';
import UsPhoneNumberInput from "../form_components/UsPhoneNumberInput";

import { TeacherSeatAcceptanceOptions } from '@cdo/apps/generated/pd/teachercon1819RegistrationConstants';

export default class Joining extends Teachercon1819FormComponent {
  static labels = {
    preferredFirstName: "Preferred first name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone number",
    teacherAcceptSeat: "Do you want to accept your seat in the Professional Learning Program? (Select one)",
    teacherWaitlistExplain: "Optional: Please explain more why you cannot accept your seat in the Professional Learning Program.",
    teacherDeclineExplain: "Optional: Please explain more why you cannot accept your seat in the Professional Learning Program.",
    ableToAttend: "Are you able to attend your assigned TeacherCon?",
  };

  static associatedFields = Object.keys(Joining.labels);

  /**
   * @override
   */
  static getErrorMessages(data) {
    const formatErrors = {};

    if (!UsPhoneNumberInput.isValid(data.phone)) {
      formatErrors.phone = "Must be a valid phone number including area code";
    }

    return formatErrors;
  }

  renderCongratulations() {
    if (this.isTeacherApplication()) {
      return (
        <p>
          Congratulations on your acceptance to Code.org's Professional Learning Program
          for {this.props.course}! Please complete this form
          <strong> within two weeks</strong> to let us know if you will be joining us
          this year, and contact <a href="mailto:teacher@code.org">teacher@code.org</a> with
          any questions.
        </p>
      );
    } else if (this.isFacilitatorApplication()) {
      return (
        <p>
          Congratulations on your acceptance to Code.org’s Facilitator Development
          Program for {this.props.course}! Please complete this registration
          form <strong>within two weeks</strong>, and
          contact <a href="mailto:facilitators@code.org">facilitators@code.org</a> with
          any questions.
        </p>
      );
    } else if (this.isPartnerApplication()) {
      return (
        <p>
          We're looking forward to seeing you at TeacherCon this summer!
          Please complete this registration form <strong>within two
          weeks</strong>, and contact your Outreach Regional Manager with any
          questions.
        </p>
      );
    } else if (this.isLeadFacilitatorApplication()) {
      return (
        <p>
          We're looking forward to seeing you at TeacherCon this summer! Please complete
          this registration form <strong>within two weeks,</strong> and
          contact <a href="mailto:facilitators@code.org">facilitators@code.org</a> with
          any questions.
        </p>
      );
    }
  }

  render() {
    return (
      <FormGroup>
        {this.renderCongratulations()}
        <h4>Section 1: Are you joining us?</h4>

        <FormGroup>
          {this.inputFor("preferredFirstName")}
          {this.inputFor("lastName")}
          {this.inputFor("email", { readOnly: true })}
          {this.usPhoneNumberInputFor("phone")}
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            Your assigned summer workshop is:
            <br />
            <strong>
              TeacherCon {this.props.city}, {this.props.date}
            </strong>
          </ControlLabel>
        </FormGroup>

      {this.isTeacherApplication() &&
        <FormGroup>
          <p>
            As a reminder, all participants in the Professional Learning Program
            are expected to:
          </p>
          <ul>
            <li>Attend their assigned summer workshop</li>
            <li>Attend their assigned academic year workshops</li>
            <li>Teach this curriculum in the 2018-19 school year</li>
          </ul>
          {this.radioButtonsFor("teacherAcceptSeat")}
          {(
            this.props.data.teacherAcceptSeat === TeacherSeatAcceptanceOptions.waitlistDate ||
            this.props.data.teacherAcceptSeat === TeacherSeatAcceptanceOptions.waitlistOther
          ) &&
            <FormGroup>
              <p>
                Thank you for letting us know. We will remove your seat in your
                assigned summer workshop for now, and add you to our waitlist.
                Please complete the rest of this form so we have your information
                in our records, and we will contact you if a seat becomes
                available for an alternate date.
              </p>
              {this.inputFor("teacherWaitlistExplain", { required: false })}
            </FormGroup>
          }

          {this.props.data.teacherAcceptSeat === TeacherSeatAcceptanceOptions.decline &&
            <FormGroup>
              <p>
                Thank you for letting us know. You do not need to complete the rest
                of this form. We will close your application today, but please feel
                free to use all of our free curricula and resources available at
                code.org/educate. We hope you consider applying again in 2019!
              </p>
              {this.inputFor("teacherDeclineExplain", { required: false })}
            </FormGroup>
          }
        </FormGroup>
      }

      {(this.isFacilitatorApplication() || this.isPartnerApplication() || this.isLeadFacilitatorApplication()) &&
        <FormGroup>
          {this.radioButtonsFor("ableToAttend")}
          {this.props.data.ableToAttend === "No" &&
            <p>
              If you're unable to attend your assigned TeacherCon, please contact{' '}
              {(this.isFacilitatorApplication() || this.isLeadFacilitatorApplication()) && <a href="mailto:facilitators@code.org">facilitators@code.org</a>}
              {this.isPartnerApplication() && "your Outreach Regional Manager"}
              {' '}as soon as possible so we can assist you.
            </p>
          }
        </FormGroup>
      }

      </FormGroup>
    );
  }
}
