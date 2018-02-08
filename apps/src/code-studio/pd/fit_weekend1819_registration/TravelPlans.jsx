import React from 'react';

import {
  FormGroup,
  ControlLabel
} from 'react-bootstrap';

import UsPhoneNumberInput from "../form_components/UsPhoneNumberInput";
import {isZipCode} from '@cdo/apps/util/formatValidation';

import LabeledFormComponent from '../form_components/LabeledFormComponent';

export default class TravelPlans extends LabeledFormComponent {
  static labels = {
    contactFirstName: "First name:",
    contactLastName: "Last name:",
    contactRelationship: "Relationship to you:",
    contactPhone: "Phone number:",
    dietaryNeeds: "Do you have any dietary needs or food allergies?",
    addressStreet: "Street",
    addressCity: "City",
    addressState: "State",
    addressZip: "Zip",
    howTraveling: "Code.org provides a round trip flight for every FiT Weekend attendee. If you choose to fly, we will provide you with detailed flight booking instructions approximately six weeks prior to the event. If you choose not to fly, and live at least 25 miles from the event location, Code.org will provide you with a $150 gift card to help cover the cost of driving, trains, or public transit. Code.org is not able to provide reimbursement for the cost of driving, trains, or public transit if you live less than 25 miles from the event location. How will you travel to the FiT Weekend?",
    needHotel: "Code.org provides a hotel room for every FiT Weekend attendee. Attendees will not be required to share a room. Would you like a hotel room at the FiT Weekend?",
    needAda: "Do you require an ADA accessible hotel room?",
  };

  static associatedFields = Object.keys(TravelPlans.labels).concat([
    'liveFarAway',
  ]);

  /**
   * @override
   */
  static getErrorMessages(data) {
    const formatErrors = {};

    if (data.addressZip && !isZipCode(data.addressZip)) {
      formatErrors.addressZip = "Must be a valid zip code";
    }

    if (!UsPhoneNumberInput.isValid(data.contactPhone)) {
      formatErrors.contactPhone = "Must be a valid phone number including area code";
    }

    return formatErrors;
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];
    if (data.liveFarAway === 'Yes') {
      requiredFields.push(
        "addressStreet",
        "addressCity",
        "addressState",
        "addressZip",
      );
    }

    if (data.needHotel === 'Yes') {
      requiredFields.push("needAda");
    }

    return requiredFields;
  }

  render() {
    return (
      <FormGroup>
        <h4>Section 2: Travel Plans</h4>

        <FormGroup>
          <ControlLabel>
            Please provide the name and phone number of someone we can contact in
            case of an emergency.
          </ControlLabel>
          {this.inputFor("contactFirstName")}
          {this.inputFor("contactLastName")}
          {this.inputFor("contactRelationship")}
          {this.usPhoneNumberInputFor("contactPhone")}
        </FormGroup>

        <FormGroup>
          {this.radioButtonsWithAdditionalTextFieldsFor("dietaryNeeds", {
            "Food Allergy (please list):": "food_allergy_details"
          })}
        </FormGroup>

        <FormGroup>
          {this.buildButtonsFromOptions({
            name: 'liveFarAway',
            label: `Do you live more than 25 miles from downtown ${this.props.city}?`,
            type: 'radio'
          })}
          {
            this.props.data.liveFarAway &&
              this.props.data.liveFarAway === 'Yes' &&
              <FormGroup>
                <ControlLabel>
                  Please provide your home address
                </ControlLabel>
                {this.inputFor("addressStreet")}
                {this.inputFor("addressCity")}
                {this.selectFor("addressState", { placeholder: "Select a state" })}
                {this.inputFor("addressZip")}
              </FormGroup>
          }
        </FormGroup>

        <FormGroup>
          {this.radioButtonsFor("howTraveling")}
          {this.radioButtonsFor("needHotel")}
          {
            this.props.data.needHotel &&
              this.props.data.needHotel === 'Yes' &&
              this.radioButtonsWithAdditionalTextFieldsFor("needAda", {
                "Other (please explain):": "ada_details"
              })
          }
        </FormGroup>
      </FormGroup>
    );
  }
}
