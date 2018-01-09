import React from 'react';
import {
  FormGroup,
  ControlLabel
} from 'react-bootstrap';
import Teachercon1819FormComponent from 'Teachercon1819FormComponent';
import UsPhoneNumberInput from "../form_components/UsPhoneNumberInput";

export default class Joining extends Teachercon1819FormComponent {
  static associatedFields = [
    'preferredFirstName',
    'lastName',
    'email',
    'phone',
  ]

  static labels = {
    preferredFirstName: "Preferred first name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone number",
    teacherAcceptSeat: "Do you want to accept your seat in the Professional Learning Program? (Select one)",
  }

  /**
   * @override
   */
  static getErrorMessages(data) {
    const formatErrors = {};

    if (!UsPhoneNumberInput.isValid(data.phone)) {
      formatErrors.contactPhone = "Must be a valid phone number including area code";
    }

    return formatErrors;
  }

  render() {
    return (
      <FormGroup>
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
          {this.radioButtonsForm("teacherAcceptSeat")}
          {/* TOTO elijah replace these with constants */}
          {(
            this.data.teacherAcceptSeat === "Yes, I want to participate, but I'm unable to attend my assigned summer workshop date. Please place me on your waitlist. I understand that I am not guaranteed a space in a different summer workshop." ||
            this.data.teacherAcceptSeat === "Yes, I want to participate, but I'm not able to for a different reason. Please place me on your waitlist. I understand that I am not guaranteed a space in a different summer workshop."
          ) &&
            <FormGroup>
              <p>
                Thank you for letting us know. We will remove your seat in your
                assigned summer workshop for now, and add you to our waitlist.
                Please complete the rest of this form so we have your information
                in our records, and we will contact you if a seat becomes
                available for an alternate date.
              </p>
            </FormGroup>
          }
        </FormGroup>
      }

      </FormGroup>
    );
  }
}
