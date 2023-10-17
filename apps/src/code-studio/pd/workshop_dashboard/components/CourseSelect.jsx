import React from 'react';
import PropTypes from 'prop-types';
import {FormGroup, ControlLabel, FormControl, HelpBlock} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import {
  Facilitator,
  Organizer,
  PermissionPropType,
  ProgramManager,
  WorkshopAdmin,
} from '../permission';
import {
  Courses,
  ActiveCourses,
  ArchivedCourses,
} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

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
  onChange,
}) {
  const allowedCourses = getAllowedCourses(
    permission,
    facilitatorCourses,
    course
  );
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
        {course ? null : <option />}
        {allowedCourses.map((course, i) => (
          <option key={i} value={course}>
            {course}
          </option>
        ))}
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
  validation: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export function getAllowedCourses(permission, facilitatorCourses, course) {
  if (permission.hasAny(Organizer, ProgramManager, WorkshopAdmin)) {
    if (ArchivedCourses.includes(course)) {
      return Courses;
    } else {
      return ActiveCourses;
    }
  } else if (permission.has(Facilitator)) {
    return facilitatorCourses;
  }

  console.error(
    'Insufficient permissions, expected one one of: Organizer, ProgramManager, WorkshopAdmin, or Facilitator'
  );
  return [];
}
