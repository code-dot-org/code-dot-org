import React, {PropTypes} from 'react';
import {FormGroup, Checkbox} from "react-bootstrap";
import Facilitator1819FormComponent from "./Facilitator1819FormComponent";
import {pageLabels} from './Facilitator1819Labels';

export default class Section7Submission extends Facilitator1819FormComponent {
  static propTypes = {
    ...Facilitator1819FormComponent.propTypes,
    accountEmail: PropTypes.string.isRequired
  };

  static labels = pageLabels.Section7Submission;

  static associatedFields = [
    ...Object.keys(pageLabels.Section7Submission)
  ];

  handleAgreeChange = event => {
    this.handleChange({
      agree: event.target.checked
    });
  };

  render() {
    return (
      <FormGroup>
        <h3>Section 7: Submission</h3>

        {this.largeInputFor("additionalInfo", {required: false})}

        <hr />

        Code.org works closely with local Regional Partners to organize and deliver the Facilitator Development Program.
        If accepted to the program, you are agreeing to allow Code.org to share your workshop performance and program
        participation data with the Regional Partner. If you use this program in your classroom, you are also agreeing
        to allow Code.org to share information on how you use Code.org and the Professional Learning resources with your
        Regional Partner and school district. We will share your contact information, which courses/units you are using
        in your classrooms and aggregate data about your classes. This includes the number of students in your classes,
        the demographic breakdown of your classroom, and the name of your school and district. We will not share any
        information about individual students with our Regional Partners - all information will be de-identified and
        aggregated. Our Regional Partners are contractually obliged to treat this information with the same level of
        confidentiality as Code.org.

        <FormGroup
          validationState={this.getValidationState("agree")}
        >
          <Checkbox
            checked={!!this.props.data.agree}
            onChange={this.handleAgreeChange}
          >
            {this.labelFor("agree")}
          </Checkbox>
        </FormGroup>

      </FormGroup>
    );
  }
}
