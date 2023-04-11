import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import moduleStyles from './sections-refresh.module.scss';
import i18n from '@cdo/locale';
import {CourseOfferingCurriculumTypes as curriculumTypes} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import {renderRows} from './QuickAssignTableHelpers';

/*
Represents the (collection of) tables in Curriculum Quick Assign.
They display side by side as if they were columns, but leaving them
as independent tables makes styling them simpler.
*/
export default function QuickAssignTable({
  marketingAudience,
  courseOfferings,
  setSelectedCourseOffering,
  updateCourse,
  sectionCourse
}) {
  // Key is type of curriculum e.g. 'Course' or 'Module', which is the singular
  // version of the title we want for the column

  useEffect(() => {
    const startingData =
      courseOfferings[marketingAudience][curriculumTypes.course];
    const headers = Object.keys(startingData);

    headers.map(header => {
      const courseDataByHeaderValues = Object.values(startingData[header]);

      courseDataByHeaderValues.map(course =>
        sectionCourse?.courseOfferingId === course.id
          ? setSelectedCourseOffering(course)
          : null
      );
    });
  }, []);

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
          {renderRows(
            courseOfferings[marketingAudience][key],
            sectionCourse,
            updateCourse,
            setSelectedCourseOffering
          )}
        </tbody>
      </table>
    );
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
  marketingAudience: PropTypes.string.isRequired,
  courseOfferings: PropTypes.object.isRequired,
  setSelectedCourseOffering: PropTypes.func.isRequired,
  updateCourse: PropTypes.func.isRequired,
  sectionCourse: PropTypes.object
};
