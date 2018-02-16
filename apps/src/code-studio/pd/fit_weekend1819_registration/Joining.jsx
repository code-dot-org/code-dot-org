import React from 'react';
import {
  FormGroup,
  ControlLabel
} from 'react-bootstrap';
import LabeledFormComponent from '../form_components/LabeledFormComponent';
import UsPhoneNumberInput from "../form_components/UsPhoneNumberInput";

export default class Joining extends LabeledFormComponent {
  static labels = {
    preferredFirstName: "Preferred first name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone number",
    ableToAttend: "Are you able to attend your assigned FiT Weekend?"
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

  render() {
    return (
      <FormGroup>
        <p>
          Congratulations on your acceptance to Code.org’s Facilitator Development
          Program for {this.props.course}! Please complete this registration
          form <strong>within two weeks</strong>, and contact&nbsp;
          <a href="mailto:facilitators@code.org">facilitators@code.org</a> with any
          questions.
        </p>

        <h4>Section 1: Are you joining us?</h4>

        <FormGroup>
          {this.inputFor("preferredFirstName")}
          {this.inputFor("lastName")}
          {this.inputFor("email", { readOnly: true })}
          {this.usPhoneNumberInputFor("phone")}
        </FormGroup>

        <FormGroup>
          <ControlLabel>
            Your assigned Facilitator-in-Training (FiT) Weekend is:
            <br />
            <strong>
              FiT {this.props.city}, {this.props.date}
            </strong>
          </ControlLabel>
          {this.radioButtonsFor("ableToAttend")}
          {this.props.data.ableToAttend === "No" &&
            <p>
              If you're unable to attend your assigned FiT Weekend, please
              contact <a href="mailto:facilitators@code.org">facilitators@code.org</a> as
              soon as possible so we can assist you.
            </p>
          }
        </FormGroup>
      </FormGroup>
    );
  }
}
