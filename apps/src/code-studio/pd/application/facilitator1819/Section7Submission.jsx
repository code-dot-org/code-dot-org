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

        {this.largeInputFor("additionalInfo")}

        <hr />

        Code.org works closely with local Regional Partners to organize and deliver the Facilitator Development Program.
        By clicking “Complete and Send,” you are agreeing to allow Code.org to share the information provided in this
        survey with your assigned Regional Partner. Our Regional Partners are contractually obliged to treat this
        information with the same level of confidentiality as Code.org.

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
