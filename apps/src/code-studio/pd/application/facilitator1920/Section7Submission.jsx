import React from 'react';
import {FormGroup} from "react-bootstrap";
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {PageLabels, SectionHeaders} from '@cdo/apps/generated/pd/facilitator1920ApplicationConstants';

export default class Section7Submission extends LabeledFormComponent {
  static labels = PageLabels.section7Submission;

  static associatedFields = [
    ...Object.keys(PageLabels.section7Submission)
  ];

  render() {
    return (
      <FormGroup>
        <h3>Section 7: {SectionHeaders.section7Submission}</h3>

        {this.largeInputFor("additionalInfo", {required: false})}

        <hr />

        Code.org works closely with local Regional Partners to organize and deliver the Facilitator Development Program.
        If accepted to the program, you agree to allow Code.org to share your workshop performance and program
        participation data with the Regional Partner. If you use this program in your classroom, you also agree
        to allow Code.org to share information on how you use Code.org and the Professional Learning resources with your
        Regional Partner and school district. We will share your contact information, which courses/units you are using
        in your classrooms and aggregate data about your classes. This includes the number of students in your classes,
        the demographic breakdown of your classroom, and the name of your school and district. We will not share any
        information about individual students with our Regional Partners - all information will be anonymized and
        aggregated. Our Regional Partners are contractually obliged to treat this information with the same level of
        confidentiality as Code.org.

        {this.singleCheckboxFor("agree")}
      </FormGroup>
    );
  }
}
