import React from 'react';
import moduleStyles from './sections-refresh.module.scss';

/*
This is a file to house the shared pieces of both types of Curriculum
QuickAssign tables, so that the GradeBand and Hoc/Pl tables don't repeat code.
*/

/*
  Responsible for rendering the category headers and calling the next
  function to render the course offerings. This 'key=' uses the header as
  a unique identifier.
*/
export function renderRows(courseData, sectionCourse, updateCourse) {
  const headers = Object.keys(courseData);
  return headers.map(header => (
    <tr key={header}>
      <td className={moduleStyles.courseHeaders}>
        {header}
        {renderOfferings(
          Object.values(courseData[header]),
          sectionCourse,
          updateCourse
        )}
      </td>
    </tr>
  ));
}

/*
  Renders all the radio type inputs within each table. Only one can be
  selected at a time. Selecting one immediately calls updateCourse.
*/
function renderOfferings(courseValues, sectionCourse, updateCourse) {
  const values = courseValues.map(cv => [cv.display_name, cv.id]);
  return values.map(([display_name, id]) => (
    <div className={moduleStyles.flexDisplay} key={display_name}>
      <input
        id={display_name}
        className={moduleStyles.radio}
        type="radio"
        name={display_name}
        value={display_name}
        checked={sectionCourse?.displayName === display_name}
        onChange={() => {
          updateCourse({displayName: display_name, courseOfferingId: id});
        }}
      />
      <label className={moduleStyles.label} htmlFor={display_name}>
        {display_name}
      </label>
    </div>
  ));
}
