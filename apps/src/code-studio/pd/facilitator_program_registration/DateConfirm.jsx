import React from 'react';
import {
  ControlLabel,
  FormGroup,
} from 'react-bootstrap';

import ProgramRegistrationComponent from './ProgramRegistrationComponent';

class DeclineTrainingDate extends ProgramRegistrationComponent {
  renderNext() {
    let followup;
    if (this.props.data.declineTrainingDate === 'I want to participate in the program, but I\'m no longer able to attend these dates.') {
      let name;
      console.log("TODO: determine if CSD or CSP");
      let type = 'csd';
      if (type === 'csd') {
        name = "csdAlternateTrainingDate";
      } else if (type === 'csp') {
        name = "cspAlternateTrainingDate";
      }
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

class TrainingDateConfirm extends ProgramRegistrationComponent {
  render() {
    let followup;
    if (this.props.data.confirmTrainingDate === "No") {
      followup = (
        <DeclineTrainingDate
          options={this.props.options}
          onChange={this.handleChange.bind(this)}
          errors={this.props.errors}
          data={this.props.data}
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

class TeacherconDateConfirm extends ProgramRegistrationComponent {
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

export default class DateConfirm extends ProgramRegistrationComponent {
  render() {
    return (
      <FormGroup>
        {this.props.attendanceDates.teachercon &&
          <TeacherconDateConfirm
            options={this.props.options}
            onChange={this.handleChange.bind(this)}
            errors={this.props.errors}
            data={this.props.data}
            attendanceDates={this.props.attendanceDates}
          />
        }
        {this.props.attendanceDates.training &&
          <TrainingDateConfirm
            options={this.props.options}
            onChange={this.handleChange.bind(this)}
            errors={this.props.errors}
            data={this.props.data}
            attendanceDates={this.props.attendanceDates}
          />
        }
      </FormGroup>
    );
  }
}

DateConfirm.propTypes = Object.assign({}, ProgramRegistrationComponent.propTypes, {
  attendanceDates: React.PropTypes.object.isRequired,
});

TeacherconDateConfirm.propTypes = Object.assign({}, ProgramRegistrationComponent.propTypes, {
  attendanceDates: React.PropTypes.object.isRequired,
});

TrainingDateConfirm.propTypes = Object.assign({}, ProgramRegistrationComponent.propTypes, {
  attendanceDates: React.PropTypes.object.isRequired,
});

DateConfirm.associatedFields = [
  "confirmTeacherconDate",
  "alternateTeacherconDate",
  "confirmTrainingDate",
  "declineTrainingDate",
  "cspAlternateTrainingDate",
  "csdAlternateTrainingDate",
];
