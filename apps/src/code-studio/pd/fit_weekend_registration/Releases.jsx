import React from 'react';

import {FormGroup, ControlLabel} from 'react-bootstrap';

import LabeledFormComponent from '../form_components/LabeledFormComponent';

export default class Releases extends LabeledFormComponent {
  static associatedFields = [
    'photoRelease',
    'liabilityWaiver',
    'agreeShareContact'
  ];

  static labels = {
    photoRelease: 'I agree to the conditions in the photo release',
    liabilityWaiver: 'I agree to the conditions in the liability waiver',
    agreeShareContact:
      "By submitting this application, I agree to share my contact information and registration with Code.org's Regional Partners."
  };

  render() {
    return (
      <FormGroup>
        <h4>Section 3: Releases</h4>
        <FormGroup>
          <ControlLabel>
            Please read this{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.google.com/document/d/1zke9hlGbI1XbSzwQ1rNZofXuXaOboJuTFPW2Z_XOA1w/edit"
            >
              photo release.
            </a>
          </ControlLabel>
          {this.singleCheckboxFor('photoRelease', {required: false})}
          <ControlLabel>
            Please read this{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.google.com/document/d/15N5N1m-BPCU7obQDf7FLLhEt3IComFGB1u3N6kEQR6k/edit"
            >
              liability waiver.
            </a>
          </ControlLabel>
          {this.singleCheckboxFor('liabilityWaiver')}
        </FormGroup>

        <FormGroup>
          <ControlLabel>
            <strong>
              Code.org works closely with local Regional Partners to organize
              and deliver the Professional Learning Program. By enrolling in
              this program, you are agreeing to allow Code.org to share
              information on how you use Code.org and the Professional Learning
              resources with your Regional Partner and school district. In order
              to organize the workshops and support you, our partners need to
              know who is attending and what content is relevant for them. So,
              we will share your contact information, which courses/units you
              are using in your classrooms and aggregate data about your
              classes. This includes the number of students in your classes, the
              demographic breakdown of your classroom, and the name of your
              school and district. We will not share any information about
              individual students with our Regional Partners - all information
              will be de-identified and aggregated. Our Regional Partners are
              contractually obliged to treat this information with the same
              level of confidentiality as Code.org.
            </strong>
          </ControlLabel>
          {this.singleCheckboxFor('agreeShareContact')}
        </FormGroup>
        <FormGroup>
          <p>
            We're excited you're planning to join us this summer! You will
            receive more information about travel approximately six weeks before
            the FiT Workshop. In the meantime, please <strong>do not</strong>{' '}
            book your flight, and make sure to contact{' '}
            <a href="mailto:facilitators@code.org">facilitators@code.org</a>{' '}
            with any questions. We look forward to meeting you this summer!
          </p>
        </FormGroup>
      </FormGroup>
    );
  }
}
