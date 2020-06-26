import React from 'react';
import PropTypes from 'prop-types';
import {FormGroup, ControlLabel, FormControl, HelpBlock} from 'react-bootstrap';
import {
  Facilitator,
  Organizer,
  PermissionPropType,
  ProgramManager,
  WorkshopAdmin
} from '../permission';
import {Courses} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

/**
 * A dropdown used on the Workshop form for selecting a course.
 * For professional learning purposes, a course usually indicates which
 * course a teacher is being trained to teach.
 * For example: CS Discoveries, CS Fundamentals
 */
export default function CourseSelect({
  course,
  facilitatorCourses,
  permission,
  readOnly,
  inputStyle,
  validation,
  onChange
}) {
  let allowedCourses;
  if (permission.hasAny(Organizer, ProgramManager, WorkshopAdmin)) {
    allowedCourses = Courses;
  } else if (permission.has(Facilitator)) {
    allowedCourses = facilitatorCourses;
  } else {
    console.error(
      'Insufficient permissions, expected one one of: Organizer, ProgramManager, WorkshopAdmin, or Facilitator'
    );
    allowedCourses = [];
  }

  const options = allowedCourses.map((course, i) => {
    return (
      <option key={i} value={course}>
        {course}
      </option>
    );
  });
  const placeHolder = course ? null : <option />;
  return (
    <FormGroup validationState={validation.style.course}>
      <ControlLabel>Course</ControlLabel>
      <FormControl
        componentClass="select"
        value={course || ''}
        id="course"
        name="course"
        onChange={onChange}
        style={inputStyle}
        disabled={readOnly}
      >
        {placeHolder}
        {options}
      </FormControl>
      <HelpBlock>{validation.help.course}</HelpBlock>
    </FormGroup>
  );
}
CourseSelect.propTypes = {
  course: PropTypes.string,
  facilitatorCourses: PropTypes.arrayOf(PropTypes.string).isRequired,
  permission: PermissionPropType.isRequired,
  readOnly: PropTypes.bool,
  inputStyle: PropTypes.object,
  validation: PropTypes.object,
  onChange: PropTypes.func.isRequired
};
