import React, {PropTypes} from 'react';
import {FormGroup} from "react-bootstrap";
import Facilitator1819FormComponent from "./Facilitator1819FormComponent";
import {pageLabels} from './Facilitator1819Labels';
import {YES} from '../ApplicationConstants';

const FACILITATOR_URL = "https://code.org/educate/facilitator";
const FACILITATOR_EMAIL = "facilitators@code.org";

export default class Section1QuestionsAboutYou extends Facilitator1819FormComponent {
  static propTypes = {
    ...Facilitator1819FormComponent.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static labels = pageLabels.Section1QuestionsAboutYou;

  static associatedFields = [
    ...Object.keys(pageLabels.Section1QuestionsAboutYou),
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
          This application should take 30 - 45 minutes to complete and includes both multiple choice and free response questions.
          Fields marked with a
          {' '}<span style={{color: "red"}}>*</span>{' '}
          are required. If you need more information on the program before you apply, please visit
          {' '}<a href={FACILITATOR_URL} target="_blank">{FACILITATOR_URL}</a>.{' '}
          If you have questions regarding the Facilitator program or application, please contact
          {' '}<a href={`mailto:${FACILITATOR_EMAIL}`}>{FACILITATOR_EMAIL}</a>.
        </p>
        <p>
          <strong>
            The deadline to apply is Dec. 1, 2017.
          </strong>
        </p>

        <h3>Section 1: About You</h3>
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
        {this.inputFor("phone")}
        {this.inputFor("address")}
        {this.inputFor("city")}
        {this.inputFor("state")}
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
}

