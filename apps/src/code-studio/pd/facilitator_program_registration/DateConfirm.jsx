import React, {PropTypes} from 'react';
import {
  ControlLabel,
  FormGroup,
} from 'react-bootstrap';

import FormComponent from '../form_components/FormComponent';

class DeclineTrainingDate extends FormComponent {
  renderNext() {
    let followup;
    if (this.props.data.declineTrainingDate === 'I want to participate in the program, but I\'m no longer able to attend these dates.') {
      const name = (this.props.course === 'CSD') ? "csdAlternateTrainingDate" : "cspAlternateTrainingDate";

      followup = this.buildButtonsFromOptions({
        name: name,
        label: "I am instead available to attend the following Facilitator-in-Training workshop (TeacherCon Part 2):",
        type: 'check'
      });
    }

    return (
      <FormGroup>
        {followup}
        <p>
          Thank you for letting us know. You do not need to complete the rest of
          this form. Please click to submit your form.
        </p>
      </FormGroup>
    );
  }

  render() {
    return (
      <FormGroup>
        {this.buildButtonsFromOptions({
          name: 'declineTrainingDate',
          label: 'Why Not?',
          type: 'radio'
        })}
        {this.renderNext()}
      </FormGroup>
    );
  }
}

class TrainingDateConfirm extends FormComponent {
  render() {
    let followup;
    if (this.props.data.confirmTrainingDate === "No") {
      followup = (
        <DeclineTrainingDate
          {...this.props}
          onChange={this.handleChange}
        />
      );
    }
    const label = `
      Your assigned Facilitator in Training date is:
      ${this.props.attendanceDates.training.arrive} -
      ${this.props.attendanceDates.training.depart}. Please confirm you can make
      your assigned Facilitator in Training.
    `;

    return (
      <FormGroup>
        {this.buildButtonsFromOptions({
          name: "confirmTrainingDate",
          label: label,
          type: "radio"
        })}
        {followup}
      </FormGroup>
    );
  }
}

class TeacherconDateConfirm extends FormComponent {
  render() {
    let followup;
    if (this.props.data.confirmTeacherconDate === 'No - but I need to attend a different date.') {
      const label = `
        I want to participate in the program, but I’m no longer able to attend
        these dates. I am instead available to attend the following:
      `;
      followup = (
        <div>
          {this.buildButtonsFromOptions({
            name: 'alternateTeacherconDate',
            label: label,
            type: 'check'
          })}
        </div>
      );
    } else if (this.props.data.confirmTeacherconDate === 'No - I\'m no longer interested') {
      followup = (
        <FormGroup>
          <ControlLabel>I am no longer interested in the Code.org Facilitator Development Program.</ControlLabel>
        </FormGroup>
      );
    }

    const label = `
      Your assigned summer training is TeacherCon
      ${this.props.teacherconLocation}
      ${this.props.attendanceDates.teachercon.arrive} -
      ${this.props.attendanceDates.teachercon.depart}. Please confirm you can
      make your assigned TeacherCon training
    `;

    return (
      <FormGroup>
        {this.buildButtonsFromOptions({
          name: "confirmTeacherconDate",
          label: label,
          type: "radio"
        })}
        {followup}
      </FormGroup>
    );
  }
}

export default class DateConfirm extends FormComponent {
  render() {
    return (
      <FormGroup>
        {this.props.attendanceDates.teachercon &&
          <TeacherconDateConfirm
            {...this.props}
            onChange={this.handleChange}
          />
        }
        {this.props.attendanceDates.training &&
          <TrainingDateConfirm
            {...this.props}
            onChange={this.handleChange}
          />
        }
      </FormGroup>
    );
  }
}

DateConfirm.propTypes = {
  ...FormComponent.propTypes,
  attendanceDates: PropTypes.object.isRequired,
  course: PropTypes.string,
  teacherconLocation: PropTypes.string.isRequired,
};

TeacherconDateConfirm.propTypes = {
  ...FormComponent.propTypes,
  attendanceDates: PropTypes.object.isRequired,
  teacherconLocation: PropTypes.string.isRequired,
};

TrainingDateConfirm.propTypes = {
  ...FormComponent.propTypes,
  attendanceDates: PropTypes.object.isRequired,
  course: PropTypes.string,
};

DateConfirm.associatedFields = [
  "confirmTeacherconDate",
  "alternateTeacherconDate",
  "confirmTrainingDate",
  "declineTrainingDate",
  "cspAlternateTrainingDate",
  "csdAlternateTrainingDate",
];
