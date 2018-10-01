import React from 'react';
import LabeledFormComponent from "../../form_components/LabeledFormComponent";
import {
  PageLabels,
  SectionHeaders
} from '@cdo/apps/generated/pd/teacher1920ApplicationConstants';
import {FormGroup} from 'react-bootstrap';

export default class Section6Submission extends LabeledFormComponent {
  static labels = PageLabels.section6Submission;

  static associatedFields = [
    ...Object.keys(PageLabels.section6Submission)
  ];

  handleAgreeChange = event => {
    this.handleChange({
      agree: event.target.checked
    });
  };

  render() {
    return (
      <FormGroup>
        <h3>Section 6: {SectionHeaders.section6Submission}</h3>

        <p>
          Code.org works closely with local Regional Partners to organize and deliver the
          Professional Learning Program. By submitting this application, you are agreeing
          to allow Code.org to share information on how you use Code.org and the
          Professional Learning resources with your Regional Partner and school district.
          In order to organize the workshops and support you, our partners need to know
          who is attending and what content is relevant for them. So, we will share your
          contact information, which courses/units you are using in your classrooms and
          aggregate data about your classes. This includes the number of students in your
          classes, the demographic breakdown of your classroom, and the name of your
          school and district. We will not share any information about individual students
          with our Regional Partners - all information will be de-identified and
          aggregated. Our Regional Partners are contractually obliged to treat this
          information with the same level of confidentiality as Code.org. To see the full
          Code.org privacy policy, visit{' '}
          <a href="http://code.org/privacy" target="_blank">
            code.org/privacy
          </a>
        </p>

        <p>
          Teachers may be required to get principal approval process for your submission
          to the Professional Learning Program. As part of this process your principal may
          opt-in to let the College Board share de-identified and aggregated Computer
          Science AP scores with Code.org to help us improve the program and curriculum.
          AP test scores will not be shared with Regional Partners.
        </p>

        {this.singleCheckboxFor("agree")}
      </FormGroup>
    );
  }
}
