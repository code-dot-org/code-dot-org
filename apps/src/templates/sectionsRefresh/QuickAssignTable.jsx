import React from 'react';
import PropTypes from 'prop-types';
import moduleStyles from './sections-refresh.module.scss';
import i18n from '@cdo/locale';
import {CourseOfferingCurriculumTypes as curriculumTypes} from '@cdo/apps/generated/curriculum/sharedCourseConstants';

/*
Represents the (collection of) tables in Curriculum Quick Assign.
They display side by side as if they were columns, but leaving them
as independent tables makes styling them simpler.
*/
export default function QuickAssignTable({
  marketingAudience,
  courseOfferings,
  updateCourse,
  sectionCourse
}) {
  // Key is type of curriculum e.g. 'Course' or 'Module', which is the singular
  // version of the title we want for the column
  const renderTable = (key, title) => {
    return (
      <table className={moduleStyles.table}>
        <thead>
          <tr className={moduleStyles.headerRow}>
            <td className={moduleStyles.headerCell}>
              <div>{title}</div>
            </td>
          </tr>
        </thead>
        <tbody className={moduleStyles.tableBody}>
          {renderRows(courseOfferings[marketingAudience][key])}
        </tbody>
      </table>
    );
  };

  /*
  Responsible for rendering the category headers and calling the next
  function to render the course offerings. This 'key=' uses the header as
  a unique identifier, not to be confused with a JSON key (above).
  */
  const renderRows = courseData => {
    const headers = Object.keys(courseData);
    return headers.map(header => (
      <tr key={header}>
        <td className={moduleStyles.courseHeaders}>
          {header}
          {renderOfferings(Object.values(courseData[header]))}
        </td>
      </tr>
    ));
  };

  /*
  Redners all the radio type inputs within each table. Only one can be
  selected at a time. Selecting one immediately calls updateCourse.
  */
  const renderOfferings = courseValues => {
    const values = courseValues.map(cv => cv.display_name);
    return values.map(display_name => (
      <div className={moduleStyles.flexDisplay} key={display_name}>
        <input
          id={display_name}
          className={moduleStyles.radio}
          type="radio"
          name={display_name}
          value={display_name}
          checked={sectionCourse?.displayName === display_name}
          onChange={() => {
            updateCourse({displayName: display_name});
          }}
        />
        <label className={moduleStyles.label} htmlFor={display_name}>
          {display_name}
        </label>
      </div>
    ));
  };

  return (
    <div className={moduleStyles.flexDisplay}>
      {!!courseOfferings[marketingAudience][curriculumTypes.course] &&
        renderTable(curriculumTypes.course, i18n.courses())}
      {!!courseOfferings[marketingAudience][curriculumTypes.module] &&
        renderTable(curriculumTypes.module, i18n.modules())}
      {!!courseOfferings[marketingAudience][curriculumTypes.standalone_unit] &&
        renderTable(curriculumTypes.standalone_unit, i18n.standaloneUnits())}
    </div>
  );
}

QuickAssignTable.propTypes = {
  courseOfferings: PropTypes.object.isRequired,
  marketingAudience: PropTypes.string.isRequired,
  updateCourse: PropTypes.func.isRequired,
  sectionCourse: PropTypes.object
};
