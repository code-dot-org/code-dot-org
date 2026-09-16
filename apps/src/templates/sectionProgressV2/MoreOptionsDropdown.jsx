import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  getSelectedCourseId,
  getSelectedUnitPosition,
} from '@cdo/apps/redux/unitSelectionRedux';
import {studentShape} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import i18n from '@cdo/locale';

import ResetProgressDialog from './ResetProgressDialog';
import {
  collapseMetadataForStudents,
  expandMetadataForStudents,
} from './sectionProgressRedux';

import styles from './progress-table-v2.module.scss';

function MoreOptionsDropdown({
  students,
  expandMetadataForStudents,
  collapseMetadataForStudents,
  sectionId,
  scriptId,
  courseId,
  unitPosition,
}) {
  const [showResetProgressDialog, setShowResetProgressDialog] =
    React.useState(false);
  const studentIds = React.useMemo(
    () => students.map(student => student.id),
    [students]
  );

  const expandAll = React.useCallback(() => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_ALL_ROWS_EXPANDED, {
      sectionId,
    });
    expandMetadataForStudents(studentIds);
  }, [expandMetadataForStudents, studentIds, sectionId]);

  const collapseAll = React.useCallback(() => {
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_ALL_ROWS_COLLAPSED, {
      sectionId,
    });
    collapseMetadataForStudents(studentIds);
  }, [collapseMetadataForStudents, studentIds, sectionId]);

  return (
    <>
      <ActionDropdown
        name="more-options-dropdown"
        labelText={i18n.additionalOptions()}
        menuPlacement="left"
        size="s"
        triggerButtonProps={{
          id: 'ui-see-more-options-dropdown',
          'aria-label': i18n.additionalOptions(),
          children: (
            <FontAwesomeV6Icon
              iconName="ellipsis-vertical"
              iconStyle="solid"
            />
          ),
          className: styles.moreOptionsDropdownButton,
          variant: 'outlined',
          color: 'tertiary',
          size: 'small',
        }}
        options={[
          {
            value: 'expand-all',
            label: i18n.expandAll(),
            icon: {iconName: 'arrows-from-line', iconStyle: 'solid'},
            onClick: expandAll,
          },
          {
            value: 'collapse-all',
            label: i18n.collapseAll(),
            icon: {iconName: 'arrows-to-line', iconStyle: 'solid'},
            onClick: collapseAll,
          },
          {
            value: 'reset-progress',
            label: i18n.resetProgress(),
            icon: {iconName: 'rotate-left', iconStyle: 'solid'},
            onClick: () => setShowResetProgressDialog(true),
          },
        ]}
      />
      {showResetProgressDialog && (
        <ResetProgressDialog
          students={students}
          unitId={scriptId}
          sectionId={sectionId}
          courseId={courseId}
          unitPosition={unitPosition}
          onClose={() => setShowResetProgressDialog(false)}
        />
      )}
    </>
  );
}
MoreOptionsDropdown.propTypes = {
  students: PropTypes.arrayOf(studentShape),
  expandMetadataForStudents: PropTypes.func,
  collapseMetadataForStudents: PropTypes.func,
  sectionId: PropTypes.number,
  scriptId: PropTypes.number,
  courseId: PropTypes.number,
  unitPosition: PropTypes.number,
};

export const UnconnectedMoreOptionsDropdown = MoreOptionsDropdown;

export default connect(
  state => ({
    students: state.teacherSections.selectedStudents,
    sectionId: state.teacherSections.selectedSectionId,
    scriptId: state.unitSelection.scriptId,
    courseId: getSelectedCourseId(state),
    unitPosition: getSelectedUnitPosition(state),
  }),
  dispatch => ({
    expandMetadataForStudents: studentIds =>
      dispatch(expandMetadataForStudents(studentIds)),
    collapseMetadataForStudents: studentIds =>
      dispatch(collapseMetadataForStudents(studentIds)),
  })
)(MoreOptionsDropdown);
