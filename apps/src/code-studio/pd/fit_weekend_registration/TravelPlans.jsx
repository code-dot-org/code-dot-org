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
    dietaryNeedsDetails: "Please provide details about your dietary needs.",
    addressStreet: "Street",
    addressCity: "City",
    addressState: "State",
    addressZip: "Zip",
    howTraveling: "Code.org provides a round trip flight for every FiT Workshop attendee. If you choose to fly, we will provide you with detailed flight booking instructions approximately six weeks prior to the event. If you choose not to fly, and live at least 25 miles from the event location, Code.org will provide you with a $150 gift card to help cover the cost of driving, trains, or public transit. Code.org is not able to provide reimbursement for the cost of driving, trains, or public transit if you live less than 25 miles from the event location. How will you travel to the FiT Workshop?",
    needHotel: "Code.org provides a hotel room for every FiT Workshop attendee. Attendees will not be required to share a room. Would you like a hotel room at the FiT Workshop?",
    needAda: "Do you require an ADA accessible hotel room?",
    needDisabilitySupport: "Do you have a disability and/or require accommodation in order to fully participate in our event? If so, please select yes, and you will be contacted by someone from our staff to discuss your specific needs."
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

    if (data.dietaryNeeds && (data.dietaryNeeds.includes('Food Allergy') || data.dietaryNeeds.includes('Other'))) {
      requiredFields.push('dietaryNeedsDetails');
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
          {this.checkBoxesFor("dietaryNeeds")}
          {
            this.props.data.dietaryNeeds &&
            (this.props.data.dietaryNeeds.includes('Food Allergy') || this.props.data.dietaryNeeds.includes('Other')) &&
            this.largeInputFor("dietaryNeedsDetails")
          }
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
          {this.radioButtonsWithAdditionalTextFieldsFor("howTraveling", {
            'I will carpool with another FiT Workshop attendee (Please note who)': 'carpooling_with_attendee'
          })}
          {this.radioButtonsFor("needHotel")}
          {
            this.props.data.needHotel === 'Yes' &&
            this.radioButtonsFor("needAda")
          }
          {this.radioButtonsFor("needDisabilitySupport")}
        </FormGroup>
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static processPageData(data) {
    const changes = {};

    changes.needAda = data.needAda;

    if (data.needHotel !== 'Yes') {
      changes.needAda = undefined;
    }

    if (data.dietaryNeeds && !data.dietaryNeeds.includes('Food Allergy') && !data.dietaryNeeds.includes('Other')) {
      changes.dietaryNeedsDetails = undefined;
    }

    return changes;
  }
}
