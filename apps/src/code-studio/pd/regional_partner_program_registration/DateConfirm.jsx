import React, {PropTypes} from 'react';
import {FormGroup} from 'react-bootstrap';

import FormComponent from '../form_components/FormComponent';

export default class DateConfirm extends FormComponent {
  render() {
    let followup;
    if (this.props.data.confirmTeacherconDate === 'No') {
      followup = (
        this.buildFieldGroup({
          name: "declineTeacherconNotes",
          componentClass: "textarea",
          label: "Why Not?",
          required: true,
        })
      );
    }

    const label = `
      Would you like to accept your seat at TeacherCon
      ${this.props.teacherconLocation} ${this.props.teacherconDates}?
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

DateConfirm.propTypes = {
  ...FormComponent.propTypes,
  teacherconLocation: PropTypes.string.isRequired,
  teacherconDates: PropTypes.string.isRequired,
};

DateConfirm.associatedFields = [
  "confirmTeacherconDate",
  "declineTeacherconNotes",
];
