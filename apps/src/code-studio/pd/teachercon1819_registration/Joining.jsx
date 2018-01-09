import React from 'react';
import {
  FormGroup,
  ControlLabel
} from 'react-bootstrap';
import FormComponent from '../form_components/FormComponent';
import UsPhoneNumberInput from "../form_components/UsPhoneNumberInput";

export default class Joining extends FormComponent {
  static associatedFields = [
    'preferredFirstName',
    'lastName',
    'email',
    'phone',
  ]

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
          {this.buildFieldGroup({
            controlWidth: {md: 6},
            label: "Preferred first name:",
            name: "preferredFirstName",
            required: true,
            type: "text",
          })}
          {this.buildFieldGroup({
            controlWidth: {md: 6},
            label: "Last name:",
            name: "lastName",
            required: true,
            type: "text",
          })}
          {this.buildFieldGroup({
            controlWidth: {md: 6},
            readOnly: true,
            label: "Email:",
            name: "email",
            required: true,
            type: "text",
          })}
          {this.buildUsPhoneNumberInput({
            controlWidth: {md: 6},
            label: "Phone number:",
            name: "phone",
            required: true,
            type: "tel",
          })}
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            Your assigned summer workshop is:
            <br/>
            TeacherCon {this.props.city}, {this.props.date}
          </ControlLabel>
        </FormGroup>
      </FormGroup>
    );
  }
}
