import classNames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import DCDO from '@cdo/apps/dcdo';

import FontAwesome from '../FontAwesome';
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
  const expandedMetadataEnabled = React.useMemo(
    () => DCDO.get('progress-v2-metadata-enabled', false),
    []
  );

  const getFullName = student =>
    student.familyName ? `${student.name} ${student.familyName}` : student.name;

  const getUnexpandableRow = (student, ind) => (
    <div
      className={classNames(styles.gridBox, styles.gridBoxStudent)}
      key={ind}
    >
      {getFullName(student)}
    </div>
  );

  const studentColumnBox = (student, ind) => {
    if (isSkeleton) {
      return skeletonCell(ind);
    }

    if (!expandedMetadataEnabled) {
      return getUnexpandableRow(student, ind);
    }

    if (expandedMetadataStudentIds.includes(student.id)) {
      return (
        <button
          className={classNames(
            styles.gridBoxStudentExpandable,
            styles.gridBox
          )}
          key={ind}
          onClick={() => collapseMetadataForStudents([student.id])}
          type="button"
        >
          <FontAwesome
            icon="caret-down"
            title="caret"
            className={styles.gridBoxStudentExpandableCaret}
          />
          {getFullName(student)}
        </button>
      );
    }

    return (
      <button
        className={classNames(styles.gridBoxStudentExpandable, styles.gridBox)}
        key={ind}
        onClick={() => expandMetadataForStudents([student.id])}
        type="button"
      >
        <FontAwesome
          icon="caret-right"
          title="caret"
          className={styles.gridBoxStudentExpandableCaret}
        />
        {getFullName(student)}
      </button>
    );
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
