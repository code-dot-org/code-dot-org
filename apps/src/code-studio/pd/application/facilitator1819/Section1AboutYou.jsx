import React, {PropTypes} from 'react';
import {FormGroup} from "react-bootstrap";
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import UsPhoneNumberInput from "../../form_components/UsPhoneNumberInput";
import {PageLabels, SectionHeaders} from '@cdo/apps/generated/pd/facilitator1819ApplicationConstants';
import {YES} from '../ApplicationConstants';
import {isEmail, isZipCode} from '@cdo/apps/util/formatValidation';

const FACILITATOR_URL = "https://code.org/educate/facilitator";
const FACILITATOR_EMAIL = "facilitators@code.org";

export default class Section1AboutYou extends LabeledFormComponent {
  static propTypes = {
    ...LabeledFormComponent.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static labels = PageLabels.section1AboutYou;

  static associatedFields = [
    ...Object.keys(PageLabels.section1AboutYou),
    "institutionType_other",
    "completedCsCoursesAndActivities_other",
    "howHeard_facilitator",
    "howHeard_codeOrgStaff",
    "howHeard_other"
  ];

  render() {
    return (
      <FormGroup>
        <p>
          Thanks for your interest in the Code.org Facilitator Development Program!
        </p>
        <p>
          This application should take 30 - 45 minutes to complete and includes both multiple choice and
          free response questions. Fields marked with a
          {' '}<span style={{color: "red"}}>*</span>{' '}
          are required. If you need more information about the program before you apply, please visit
          {' '}<a href={FACILITATOR_URL} target="_blank">{FACILITATOR_URL}</a>.{' '}
          If you have questions regarding the Facilitator Development Program or application, please contact
          {' '}<a href={`mailto:${FACILITATOR_EMAIL}`}>{FACILITATOR_EMAIL}</a>.
        </p>
        <p>
          <strong>
            The deadline to apply is Dec. 1, 2017.
          </strong>
        </p>

        <h3>Section 1: {SectionHeaders.section1AboutYou}</h3>
        {this.selectFor("title", {
          required: false,
          placeholder: "Select a title"
        })}
        {this.inputFor("firstName")}
        {this.inputFor("preferredFirstName", {required: false})}
        {this.inputFor("lastName")}

        {this.inputFor("accountEmail", {
          value: this.props.accountEmail,
          readOnly: true
        })}

        {this.inputFor("alternateEmail", {required: false})}

        {this.usPhoneNumberInputFor("phone")}

        {this.inputFor("address")}
        {this.inputFor("city")}
        {this.selectFor("state", {placeholder: "Select a state"})}
        {this.inputFor("zipCode")}

        {this.radioButtonsFor("genderIdentity")}
        {this.checkBoxesFor("race")}

        {this.checkBoxesWithAdditionalTextFieldsFor("institutionType", {
          "Other:" : "other"
        })}

        {this.inputFor("currentEmployer")}
        {this.inputFor("jobTitle")}

        {this.largeInputFor("resumeLink")}

        {this.radioButtonsFor("workedInCsJob")}

        {this.props.data.workedInCsJob === YES &&
          this.largeInputFor("csRelatedJobRequirements", this.indented())
        }

        {this.checkBoxesWithAdditionalTextFieldsFor("completedCsCoursesAndActivities", {
          "Other:" : "other"
        })}

        {this.radioButtonsFor("diversityTraining")}
        {this.props.data.diversityTraining === YES &&
          this.largeInputFor("diversityTrainingDescription", this.indented())
        }

        {this.checkBoxesWithAdditionalTextFieldsFor("howHeard", {
          "A Code.org facilitator (please share name):": "facilitator",
          "A Code.org staff member (please share name):": "codeOrgStaff",
          "A Code.org Regional Partner (please share name):": "regionalPartner",
          "Other:": "other"
        })}
      </FormGroup>
    );
  }

  /**
   * @override
   */
  static getDynamicallyRequiredFields(data) {
    const requiredFields = [];

    if (data.workedInCsJob === YES) {
      requiredFields.push("csRelatedJobRequirements");
    }
    if (data.diversityTraining === YES) {
      requiredFields.push("diversityTrainingDescription");
    }

    return requiredFields;
  }

  /**
   * @override
   */
  static getErrorMessages(data) {
    const formatErrors = {};

    if (data.alternateEmail && !isEmail(data.alternateEmail)) {
      formatErrors.alternateEmail = "Must be a valid email address";
    }

    if (data.zipCode && !isZipCode(data.zipCode)) {
      formatErrors.zipCode = "Must be a valid zip code";
    }

    if (!UsPhoneNumberInput.isValid(data.phone)) {
      formatErrors.phone = "Must be a valid phone number including area code";
    }

    return formatErrors;
  }

  /**
   * @override
   */
  static processPageData(data) {
    const changes = {};

    if (data.workedInCsJob !== YES) {
      changes.csRelatedJobRequirements = undefined;
    }
    if (data.diversityTraining !== YES) {
      changes.diversityTrainingDescription = undefined;
    }

    return changes;
  }
}
