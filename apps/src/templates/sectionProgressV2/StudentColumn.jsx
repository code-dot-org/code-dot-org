import classNames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import i18n from '@cdo/locale';

import FontAwesome from '../../legacySharedComponents/FontAwesome';
import {
  collapseMetadataForStudents,
  expandMetadataForStudents,
} from '../sectionProgress/sectionProgressRedux';
import SortByNameDropdown from '../SortByNameDropdown';

import styles from './progress-table-v2.module.scss';
import skeletonizeContent from '@cdo/apps/componentLibrary/skeletonize-content.module.scss';

const SECTION_PROGRESS_V2 = 'SectionProgressV2';

const skeletonCell = key => (
  <div className={classNames(styles.gridBox, styles.gridBoxStudent)} key={key}>
    <span
      className={classNames(
        skeletonizeContent.skeletonizeContent,
        styles.gridBoxSkeleton
      )}
      style={{width: _.random(30, 90) + '%'}}
      data-testid="skeleton-cell"
    />
  </div>
);

function StudentColumn({
  sortedStudents,
  unitName,
  sectionId,
  isSkeleton,
  expandedMetadataStudentIds,
  expandMetadataForStudents,
  collapseMetadataForStudents,
}) {
  const getFullName = student =>
    student.familyName ? `${student.name} ${student.familyName}` : student.name;

  const collapseRow = studentId => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_ONE_ROW_COLLAPSED, {
      sectionId: sectionId,
    });
    collapseMetadataForStudents([studentId]);
  };

  const expandRow = studentId => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_ONE_ROW_EXPANDED, {
      sectionId: sectionId,
    });
    expandMetadataForStudents([studentId]);
  };

  const getUnexpandedRow = (student, ind) => (
    <button
      className={styles.studentColumnName}
      key={ind}
      onClick={() => expandRow(student.id)}
      type="button"
      aria-expanded={false}
      id={'ui-test-student-row-unexpanded-' + getFullName(student)}
    >
      <FontAwesome
        icon="caret-right"
        title="caret"
        className={styles.studentColumnNameCaret}
      />
      {getFullName(student)}
    </button>
  );

  const getExpandedRow = (student, ind) => (
    <div className={styles.studentColumnExpandedHeader} key={ind}>
      <button
        className={styles.studentColumnName}
        onClick={() => collapseRow(student.id)}
        type="button"
        aria-expanded={true}
        id={'ui-test-student-row-expanded-' + getFullName(student)}
      >
        <FontAwesome
          icon="caret-down"
          className={styles.studentColumnNameCaret}
        />
        {getFullName(student)}
      </button>
      <div
        className={classNames(
          styles.gridBox,
          styles.studentColumnExpandedHeaderText
        )}
      >
        {i18n.timeSpentMins()}
      </div>
      <div
        className={classNames(
          styles.gridBox,
          styles.studentColumnExpandedHeaderText
        )}
      >
        {i18n.lastUpdatedTitle()}
      </div>
    </div>
  );

  const studentColumnBox = (student, ind) => {
    if (isSkeleton) {
      return skeletonCell(ind);
    }

    if (expandedMetadataStudentIds.includes(student.id)) {
      return getExpandedRow(student, ind);
    }

    return getUnexpandedRow(student, ind);
  };

  return (
    <div className={styles.studentColumn}>
      <SortByNameDropdown
        sectionId={sectionId}
        unitName={unitName}
        source={SECTION_PROGRESS_V2}
        className={styles.sortDropdown}
      />
      <div className={styles.grid}>
        {sortedStudents.map((student, ind) => studentColumnBox(student, ind))}
      </div>
    </div>
  );
}

StudentColumn.propTypes = {
  sectionId: PropTypes.number,
  unitName: PropTypes.string,
  sortedStudents: PropTypes.array,
  isSkeleton: PropTypes.bool,
  expandedMetadataStudentIds: PropTypes.array,
  expandMetadataForStudents: PropTypes.func,
  collapseMetadataForStudents: PropTypes.func,
};

export default connect(
  state => ({
    expandedMetadataStudentIds:
      state.sectionProgress.expandedMetadataStudentIds,
  }),
  dispatch => ({
    expandMetadataForStudents: studentIds =>
      dispatch(expandMetadataForStudents(studentIds)),
    collapseMetadataForStudents: studentIds =>
      dispatch(collapseMetadataForStudents(studentIds)),
  })
)(StudentColumn);
