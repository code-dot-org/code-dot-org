import PropTypes from 'prop-types';
import React from 'react';

import {Heading4} from '@cdo/apps/componentLibrary/typography';
import {CourseOfferingCurriculumTypes as curriculumTypes} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import {assignmentCourseOfferingShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import i18n from '@cdo/locale';

import {renderRows} from './QuickAssignTableHelpers';

import moduleStyles from './sections-refresh.module.scss';

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
  sectionCourse,
}) {
  // Key is type of curriculum e.g. 'Course' or 'Module', which is the singular
  // version of the title we want for the column
  const renderTable = (key, title) => {
    return (
      <table className={moduleStyles.table}>
        <thead>
          <tr className={moduleStyles.headerRow}>
            <td className={moduleStyles.headerCell}>
              <Heading4>{title}</Heading4>
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
  courseOfferings: assignmentCourseOfferingShape.isRequired,
  setSelectedCourseOffering: PropTypes.func.isRequired,
  updateCourse: PropTypes.func.isRequired,
  sectionCourse: PropTypes.object,
};
