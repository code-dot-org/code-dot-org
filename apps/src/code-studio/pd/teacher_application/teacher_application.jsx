/* global window */

/**
 * Teacher Application questionaire
 */

import React from 'react';
import _ from 'lodash';
import {Radio, Checkbox, FormControl, FormGroup, ControlLabel} from 'react-bootstrap';

function FieldGroup({ id, label, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
    </FormGroup>
  );
}

const grades = ['Kindergarten'].concat(_.range(1,13));
const subjects = ['Computer Science', 'Computer Literacy', 'Math', 'Science', 'History', 'English', 'Music', 'Art', 'Multimedia', 'Foreign Language'];

const TeacherApplication = React.createClass({

  buttonList(type, label, groupName, answers, allowOther = false) {
    const options = answers.map( (answer, i) => {
      if (type === 'radio') {
        return (
          <Radio
            value={answer}
            label={answer}
            key={i}
            name={groupName}
          >
            {answer}
          </Radio>
        );
      } else if (type === 'check') {
        return (
          <Checkbox
            value={answer}
            label={answer}
            key={i}
            name={groupName}
          >
            {answer}
          </Checkbox>
        );
      }
    });

    if (allowOther) {
      options.push(
        (
          <div key={answers.length + 1} style={{display: 'inline'}}>
            <span>
              Other:
            </span>
            <input type="text" id={groupName + 'Other'}/>
          </div>
        )
      );
    }

    return (
      <div>
        <ControlLabel>
          {label}
        </ControlLabel>
        {options}
      </div>
    );
  },

  generateTeacherInformationSection() {
    return (
      <div>
        {this.buttonList('check', 'Grades served at your school', 'gradesAtSchool', grades)}
        <h2>
          Section 2: Teacher Information
        </h2>
        <FieldGroup
          id="firstName"
          label="First name"
          type="text"
        />
        <FieldGroup
          id="preferredFirstName"
          label="Preferred First Name"
          type="text"
        />
        <FieldGroup
          id="lastName"
          label="Last Name"
          type="text"
        />
        <FieldGroup
          id="schoolEmail"
          label="Your school email address"
          type="email"
        />
        <FieldGroup
          id="schoolEmail"
          label="Your personal email address (we may need to contact you during the summer)"
          type="email"
        />
        <FieldGroup
          id="phoneNumber"
          label="Preferred phone number"
          type="text"
        />
        {this.buttonList('radio', 'Gender Identity', 'genderIdentity', ['Female', 'Male', 'Other', 'Prefer not to answer'])}
        {this.buttonList('check', 'What grades are you teaching in the current 2016-17 school year? (select all that apply)', 'grades2016', grades)}
        {this.buttonList('check', 'What subjects are you teaching in the current 2016-17 school year? (select all that apply)', 'subjects2016', subjects, true)}
        {this.buttonList('check', 'What grades are you teaching in the current 2017-18 school year? (select all that apply)', 'grades2017', grades)}
        {this.buttonList('check', 'What subjects are you teaching in the current 2016-17 school year? (select all that apply)', 'subjects2017', subjects, true)}
      </div>
    );
  },

  render() {
    return (
      <div>
        {this.generateTeacherInformationSection()}
      </div>
    );
  }
});

export default TeacherApplication;
window.TeacherApplication = TeacherApplication;
