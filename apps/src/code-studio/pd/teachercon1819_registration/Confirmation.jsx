import React from 'react';

import {
  FormGroup,
} from 'react-bootstrap';

import Teachercon1819FormComponent from './Teachercon1819FormComponent';

export default class Confirmation extends Teachercon1819FormComponent {
  static associatedFields = [];

  render() {
    return (
      <FormGroup>
        {this.isTeacherApplication() &&
          <p>
            We're excited you're planning to join the Professional Learning
            Program! You will receive more information about travel approximately
            six weeks before TeacherCon. In the meantime, please <strong>do not</strong> book your
            flight, and make sure to contact <a href="mailto:teacher@code.org">teacher@code.org</a> with any questions.
            We look forward to meeting you this summer!
          </p>
        }

        {this.isFacilitatorApplication() &&
          <p>
            We're excited you're planning to join us this summer! You will
            receive more information about travel approximately six weeks before
            TeacherCon. In the meantime, please <strong>do not</strong> book your flight, and make
            sure to contact <a href="mailto:facilitators@code.org">facilitators@code.org</a> with any questions. We look
            forward to meeting you this summer!
          </p>
        }

        {this.isPartnerApplication() &&
          <p>
            We're excited you're planning to join us this summer! You will
            receive more information about travel approximately six weeks before
            TeacherCon. In the meantime, please <strong>do not</strong> book your flight, and make
            sure to contact your Outreach Regional Manager with any questions. We
            look forward to meeting you this summer!
          </p>
        }

        <h3>
          Please click Submit to complete your registration.
        </h3>
      </FormGroup>
    );
  }
}

