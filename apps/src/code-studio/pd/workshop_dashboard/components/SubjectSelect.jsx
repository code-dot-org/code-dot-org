import React from 'react';
import PropTypes from 'prop-types';
import {FormGroup, ControlLabel, FormControl, HelpBlock} from 'react-bootstrap';
import {Subjects} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

/**
 * A dropdown used on the Workshop form for selecting a subject.
 * For professional learning purposes, a subject usually indicates which
 * part of a multi-step PL course this workshop represents.
 * For example: 5-day summer workshop, academic workshop 3, etc.
 */
export default function SubjectSelect({
  course,
  subject,
  readOnly,
  inputStyle,
  validation,
  onChange
}) {
  return (
    <FormGroup validationState={validation.style.subject}>
      <ControlLabel>Subject</ControlLabel>
      <FormControl
        componentClass="select"
        value={subject || ''}
        id="subject"
        name="subject"
        onChange={onChange}
        style={inputStyle}
        disabled={readOnly}
      >
        {subject ? null : <option />}
        {Subjects[course].map((subject, i) => (
          <option key={i} value={subject}>
            {subject}
          </option>
        ))}
      </FormControl>
      <HelpBlock>{validation.help.subject}</HelpBlock>
    </FormGroup>
  );
}

SubjectSelect.propTypes = {
  course: PropTypes.string.isRequired,
  subject: PropTypes.string,
  readOnly: PropTypes.bool,
  inputStyle: PropTypes.object,
  validation: PropTypes.object,
  onChange: PropTypes.func.isRequired
};
