import React, {PropTypes} from 'react';
import {
  FormGroup,
  ControlLabel
} from 'react-bootstrap';

import FormComponent from '../form_components/FormComponent';

export default class TravelInformation extends FormComponent {
  render() {
    return (
      <FormGroup>{/* Travel Information */}
        <h4>Travel Information</h4>

        <FormGroup>{/* Attendee Info */}
          {this.buildFieldGroup({
            name: "fullName",
            label: "Full legal name of TeacherCon Attendee:",
            type: "text",
            required: true
          })}
          {this.buildFieldGroup({
            name: "email",
            label: "Email address for travel updates:",
            type: "text",
            required: true
          })}
        </FormGroup>

        <FormGroup>{/* Contact Info */}
          <ControlLabel>
            Please provide the name and phone number of someone we can contact in
            case of an emergency.
          </ControlLabel>
          {this.buildFieldGroup({
            name: "contactName",
            type: "text",
            label: "First and last name:",
            required: true,
          })}
          {this.buildFieldGroup({
            name: "contactRelationship",
            type: "text",
            label: "Relationship to you:",
            required: true,
          })}
          {this.buildFieldGroup({
            name: "contactPhone",
            type: "tel",
            label: "Phone number:",
            required: true,
            placeholder: "XXX-XXX-XXXX",
          })}
        </FormGroup>

        <FormGroup> {/* Misc */}
          {this.buildButtonsFromOptions({
            name: 'dietaryNeeds',
            label: "Please list any dietary needs or food allergies you may have",
            type: 'check'
          })}
          {this.props.data.dietaryNeeds &&
            (
              this.props.data.dietaryNeeds.includes("Food allergy") ||
              this.props.data.dietaryNeeds.includes("Other")
            ) &&
            this.buildFieldGroup({
              name: "dietaryNeedsNotes",
              componentClass: "textarea",
              label: "Please provide details (optional):",
              required: false,
            })
          }
          {this.buildButtonsFromOptions({
            name: 'liveFarAway',
            label: `Do you live more than 25 miles from downtown ${this.props.teacherconLocation}?`,
            type: 'radio'
          })}
          {this.buildButtonsFromOptions({
            name: 'howTraveling',
            label: "How will you be traveling to TeacherCon?",
            type: 'radio'
          })}
          {this.buildButtonsFromOptions({
            name: 'needHotel',
            label: "Code.org will cover travel and hotel room costs for 1 individual from each Regional Partner. Will you need a hotel room during TeacherCon?",
            type: 'radio'
          })}
          {this.buildButtonsFromOptions({
            name: 'needAda',
            label: "Do you require an ADA accessible hotel room?",
            type: 'radio'
          })}
          {this.buildFieldGroup({
            name: "notes",
            componentClass: "textarea",
            label: "Notes (optional):",
            required: false,
          })}
        </FormGroup>
      </FormGroup>
    );
  }
}

TravelInformation.propTypes = {
  ...FormComponent.propTypes,
  teacherconLocation: PropTypes.string.isRequired,
};

TravelInformation.associatedFields = [
  "fullName",
  "email",
  "contactName",
  "contactRelationship",
  "contactPhone",
  "dietaryNeeds",
  "liveFarAway",
  "howTraveling",
  "needHotel",
  "needAda",
];
