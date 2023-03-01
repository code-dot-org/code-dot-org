import React, {useState} from 'react';
import PropTypes from 'prop-types';
import moduleStyles from './sections-refresh.module.scss';
import i18n from '@cdo/locale';
import {CourseOfferingCurriculumTypes as curriculumTypes} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import {Radio} from 'react-bootstrap';

export default function QuickAssignTable({
  marketingAudience,
  courseOfferings,
  updateSection
}) {
  const [assignedCourse, setAssignedCourse] = useState('');
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

  const renderRows = courseData => {
    const headers = Object.keys(courseData);
    return headers.map(header => (
      <tr>
        <td className={moduleStyles.courseHeaders}>
          {header}
          {renderOfferings(Object.values(courseData[header]))}
        </td>
      </tr>
    ));
  };

  const renderOfferings = courseValues => {
    const values = courseValues.map(cv => cv.display_name);
    return values.map(display_name => (
      <Radio
        className={moduleStyles.radio}
        name={display_name}
        value={display_name}
        checked={assignedCourse === display_name}
        onChange={e => {
          updateSection('course', e.target.value);
          setAssignedCourse(display_name);
        }}
      >
        {display_name}
      </Radio>
    ));
  };

  return (
    <div className={moduleStyles.multiTables}>
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
  updateSection: PropTypes.func.isRequired
};
