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
        <h4>Part 1 of 4: Travel Information</h4>

        <FormGroup>{/* Location */}
          <ControlLabel>What is your mailing address?</ControlLabel>
          {this.buildFieldGroup({
            name: "addressStreet",
            label: "Street address:",
            type: "text",
            required: true
          })}
          <p>We are unable to ship to PO boxes, so please share your physical street address.</p>
          {this.buildFieldGroup({
            name: "addressCity",
            type: "text",
            label: "City:",
            required: true,
          })}
          {this.buildSelectFieldGroupFromOptions({
            name: "addressState",
            label: "State:",
            required: true,
            placeholder: "Choose your state"
          })}
          {this.buildFieldGroup({
            name: "addressZip",
            type: "number",
            label: "Zip code:",
            required: true,
          })}
        </FormGroup>

        <FormGroup>{/* Contact */}
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
            label: "Code.org will cover the cost of each participant's hotel room. Will you need a hotel room during TeacherCon?",
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
  "addressStreet",
  "addressCity",
  "addressState",
  "addressZip",
  "contactName",
  "contactRelationship",
  "contactPhone",
  "dietaryNeeds",
  "liveFarAway",
  "howTraveling",
  "needHotel",
  "needAda",
];
