import React from 'react';
import {
  FormGroup,
  ControlLabel
} from 'react-bootstrap';

import ProgramRegistrationComponent from './ProgramRegistrationComponent';
import Releases from './Releases';

export default class TravelInformation extends ProgramRegistrationComponent {
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
          {this.buildButtonsFromOptions(
            'dietaryNeeds',
            "Please list any dietary needs or food allergies you may have",
            'check'
          )}
          {this.buildButtonsFromOptions(
            'liveFarAway',
            "Do you live more than 25 miles from downtown Houston?",
            'radio'
          )}
          {this.buildButtonsFromOptions(
            'howTraveling',
            "How will you be traveling to TeacherCon?",
            'radio'
          )}
          {this.buildButtonsFromOptions(
            'needHotel',
            "Code.org will cover the cost of each participant's hotel room. Will you need a hotel room during TeacherCon?",
            'radio'
          )}
          {this.buildButtonsFromOptions(
            'needAda',
            "Do you require an ADA accessible hotel room?",
            'radio'
          )}
          {this.buildFieldGroup({
            name: "notes",
            componentClass: "textarea",
            label: "Notes (optional):",
            required: false,
          })}
        </FormGroup>
        <Releases
          options={this.props.options}
          onChange={this.handleChange.bind(this)}
          errors={this.props.errors}
        />
      </FormGroup>
    );
  }
}
