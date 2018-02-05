import React from 'react';

import {
  FormGroup,
  ControlLabel
} from 'react-bootstrap';

import Teachercon1819FormComponent from './Teachercon1819FormComponent';

export default class Releases extends Teachercon1819FormComponent {
  static associatedFields = [
    'photoRelease',
    'liabilityWaiver',
    'agreeShareContact',
  ];

  static labels = {
    photoRelease: "I agree to the conditions in the photo release.",
    liabilityWaiver: "I agree to the conditions in the liability waiver.",
    agreeShareContact: "By submitting this application, I agree to share my contact information and registration with Code.org's Regional Partners.",
  };

  render() {
    return (
      <FormGroup>
        <h4>Section 4: Releases</h4>
        <FormGroup>
          <ControlLabel>
            Please read this <a target="_blank" href="https://docs.google.com/document/d/12NVUcqccNRbVukoGMCserwSpg4vfG0vNlEqTxr6oit0/edit">photo release.</a>
          </ControlLabel>
          {this.singleCheckboxFor("photoRelease")}
          <ControlLabel>
            Please read this <a target="_blank" href="https://docs.google.com/document/d/15N5N1m-BPCU7obQDf7FLLhEt3IComFGB1u3N6kEQR6k/edit">liability waiver.</a>
          </ControlLabel>
          {this.singleCheckboxFor("liabilityWaiver")}
        </FormGroup>

        {(
          this.isTeacherApplication() || this.isFacilitatorApplication()
         ) &&
          <FormGroup>
            <ControlLabel>
              <strong>
                Code.org works closely with local Regional Partners to organize and
                deliver the Professional Learning Program.  By enrolling in this
                program, you are agreeing to allow Code.org to share information on
                how you use Code.org and the Professional Learning resources with your
                Regional Partner and school district. In order to organize the
                workshops and support you, our partners need to know who is attending
                and what content is relevant for them. So, we will share your contact
                information, which courses/units you are using in your classrooms and
                aggregate data about your classes. This includes the number of
                students in your classes, the demographic breakdown of your classroom,
                and the name of your school and district. We will not share any
                information about individual students with our Regional Partners - all
                information will be de-identified and aggregated. Our Regional
                Partners are contractually obliged to treat this information with the
                same level of confidentiality as Code.org.
              </strong>
            </ControlLabel>
            {this.singleCheckboxFor("agreeShareContact")}
          </FormGroup>
        }
      </FormGroup>
    );
  }
}
