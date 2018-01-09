import React from 'react';
import {FormGroup} from 'react-bootstrap';
import Teachercon1819FormComponent from 'Teachercon1819FormComponent';

export default class Welcome extends Teachercon1819FormComponent {
  static associatedFields = []

  render() {
    return (
      <FormGroup>
        {this.isTeacherApplication() &&
          <p>
            Congratulations on your acceptance to Code.org's Professional
            Learning Program for {this.props.course}! Please complete this
            form <strong>within two weeks</strong> to let us know if you will be joining
            us this year, and contact <a href="mailto:teacher@code.org">teacher@code.org</a>
            with any questions.
          </p>
        }

        {this.isFacilitatorApplication() &&
          <p>
            Congratulations on your acceptance to Code.org’s Facilitator Development
            Program for {this.props.course}! Please complete this registration
            form <strong>within two weeks</strong>, and
            contact <a href="mailto:facilitators@code.org">facilitators@code.org</a>
            with any questions.
          </p>
        }

        {this.isPartnerApplication() &&
          <p>
            We're looking forward to seeing you at TeacherCon this summer!
            Please complete this registration form <strong>within two
            weeks</strong>, and contact your Outreach Regional Manager with any
            questions.
          </p>
        }
      </FormGroup>
    );
  }
}
