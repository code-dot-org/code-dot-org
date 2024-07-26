import PropTypes from 'prop-types';
import React from 'react';

import {Heading4} from '@cdo/apps/componentLibrary/typography';
import {assignmentCourseOfferingShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import i18n from '@cdo/locale';

import {MARKETING_AUDIENCE} from './CurriculumQuickAssign';
import {renderRows} from './QuickAssignTableHelpers';

import moduleStyles from './sections-refresh.module.scss';

const TABLE_COUNT = 3;
/*
Represents the (collection of) tables in Curriculum Quick Assign.
They display side by side as if they were columns, but leaving them
as independent tables makes styling them simpler.
*/
export default function QuickAssignTableHocPl({
  marketingAudience,
  courseOfferings,
  setSelectedCourseOffering,
  updateCourse,
  sectionCourse,
}) {
  // Begins the table construction given the first table title
  const allTables = title => {
    return (
      <div className={moduleStyles.flexDisplay}>
        {!!courseOfferings[marketingAudience] &&
          renderTable(title, retrieveTableSplit(0))}
        {!!courseOfferings[marketingAudience] &&
          renderTable('', retrieveTableSplit(1))}
        {!!courseOfferings[marketingAudience] &&
          renderTable('', retrieveTableSplit(2))}
      </div>
    );
  };

  // Renders each table (one table for each column in the component)
  const renderTable = (title, rows) => {
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
            rows,
            sectionCourse,
            updateCourse,
            setSelectedCourseOffering
          )}
        </tbody>
      </table>
    );
  };

  // Compute these values once to reduce repitition in the function below.
  const headers = Object.keys(courseOfferings[marketingAudience]);
  const headerCount = headers.length;
  const minHeadersPerTable = Math.floor(headerCount / TABLE_COUNT);
  const overflowCount = headerCount % TABLE_COUNT; // If headers do not divide evenly

  /*
  Takes in an tableIndex (0, 1, 2) and returns the corresponding reconstructed object
  of that collection of course offerings.
  For example: if HOC has 6 headers, calling this with tableIndex 1 (the middle table)
  will return an object containing courseOfferings for header indexes 1 and 4.
  If called with 8 headers, the first two tables will be given one additional header.
  */
  const retrieveTableSplit = tableIndex => {
    const offerings = {};
    // If the headers don't evenly divide, distribute extras starting at table 0
    var extraHeaderCount = overflowCount > tableIndex ? 1 : 0;
    for (var i = 0; i < minHeadersPerTable + extraHeaderCount; i++) {
      const index = i * TABLE_COUNT + tableIndex;
      const header = headers[index];
      offerings[header] = courseOfferings[marketingAudience][headers[index]];
    }
    return offerings;
  };

  return (
    <div>
      {marketingAudience === MARKETING_AUDIENCE.HOC && (
        <div>{allTables(i18n.teacherCourseHoc())}</div>
      )}
      {marketingAudience === MARKETING_AUDIENCE.PL && (
        <div>{allTables(i18n.professionalLearning())}</div>
      )}
    </div>
  );
}

QuickAssignTableHocPl.propTypes = {
  marketingAudience: PropTypes.string.isRequired,
  courseOfferings: assignmentCourseOfferingShape.isRequired,
  setSelectedCourseOffering: PropTypes.func.isRequired,
  updateCourse: PropTypes.func.isRequired,
  sectionCourse: PropTypes.object,
};
