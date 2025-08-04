import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {
  asyncLoadCoursesWithProgress,
  setUnit,
  getSelectedCourseId,
  getSelectedUnitPosition,
} from '@cdo/apps/redux/unitSelectionRedux';
import {loadUnitProgress} from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';
import i18n from '@cdo/locale';

import firehoseClient from '../metrics/firehose';

import styles from './unit-selector-v2.module.scss';
import skeletonizeContent from '@cdo/apps/sharedComponents/skeletonize-content.module.scss';

const recordEvent = (eventName, sectionId, dataJson = {}) => {
  firehoseClient.putRecord(
    {
      study: 'teacher_dashboard_actions',
      study_group: 'progress_v2',
      event: eventName,
      data_json: JSON.stringify({
        section_id: sectionId,
        ...dataJson,
      }),
    },
    {includeUserId: true}
  );
};

function UnitSelectorV2({
  filterToSelectedCourse = false,
  sectionId,
  unitId,
  courseVersionId,
  courseId,
  unitPosition,
  coursesWithProgress,
  className,
  setUnit,
  asyncLoadCoursesWithProgress,
  isLoadingCourses,
  isLoadingSectionData,
  selectedSectionCourse,
}) {
  // Reload courses with progress when selected section changes.
  React.useEffect(() => {
    if (sectionId) {
      asyncLoadCoursesWithProgress();
    }
  }, [sectionId, asyncLoadCoursesWithProgress]);

  const onSelectUnit = React.useCallback(
    e => {
      const value = e.target.value;
      const [newCourseVersionId, newUnitId] = value
        .split('-')
        .map(id => parseInt(id));
      setUnit(newUnitId, newCourseVersionId);
      const currentState = getStore().getState();
      const newCourseId = getSelectedCourseId(currentState);
      const newUnitPosition = getSelectedUnitPosition(currentState);
      loadUnitProgress(newUnitId, sectionId, newCourseId, newUnitPosition);

      recordEvent('change_script', sectionId, {
        old_script_id: unitId,
        new_script_id: newUnitId,
      });

      analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_CHANGE_UNIT, {
        sectionId: sectionId,
        oldUnitId: unitId,
        unitId: newUnitId,
      });
    },
    [unitId, setUnit, sectionId]
  );

  const itemGroups = coursesWithProgress
    .filter(
      version =>
        !filterToSelectedCourse ||
        version.id === selectedSectionCourse ||
        !version.id
    )
    .map(version => ({
      label: version.display_name,
      groupItems: version.units.map(unit => {
        const itemValue = `${version.id}-${unit.id}`;
        return {
          value: itemValue,
          text: unit.name,
        };
      }),
    }));

  const loadingDropdown = () => (
    <div
      className={classNames(
        skeletonizeContent.skeletonizeContent,
        styles.skeleton
      )}
    />
  );

  if (isLoadingCourses || isLoadingSectionData) {
    return loadingDropdown();
  } else if (!coursesWithProgress || coursesWithProgress.length === 0) {
    return null;
  }

  return (
    <SimpleDropdown
      itemGroups={itemGroups}
      selectedValue={`${courseVersionId}-${unitId}`}
      name="unitSelector"
      onChange={onSelectUnit}
      className={className}
      isLabelVisible={false}
      size="s"
      dropdownTextThickness="thin"
      id="unit-selector-v2"
      color="gray"
      labelText={i18n.selectUnit()}
    />
  );
}

UnitSelectorV2.propTypes = {
  filterToSelectedCourse: PropTypes.bool,
  unitId: PropTypes.number,
  courseVersionId: PropTypes.number,
  courseId: PropTypes.number,
  unitPosition: PropTypes.number,
  sectionId: PropTypes.number,
  coursesWithProgress: PropTypes.array.isRequired,
  setUnit: PropTypes.func.isRequired,
  className: PropTypes.string,
  asyncLoadCoursesWithProgress: PropTypes.func.isRequired,
  isLoadingCourses: PropTypes.bool,
  isLoadingSectionData: PropTypes.bool.isRequired,
  selectedSectionCourse: PropTypes.any,
};

export const UnconnectedUnitSelectorV2 = UnitSelectorV2;

export default connect(
  state => ({
    unitId: state.unitSelection.scriptId,
    courseVersionId: state.unitSelection.courseVersionId,
    courseId: getSelectedCourseId(state),
    unitPosition: getSelectedUnitPosition(state),
    sectionId: state.teacherSections.selectedSectionId,
    coursesWithProgress: state.unitSelection.coursesWithProgress,
    isLoadingCourses: state.unitSelection.isLoadingCoursesWithProgress,
    isLoadingSectionData: state.teacherSections.isLoadingSectionData,
    selectedSectionCourse:
      state.teacherSections.sections[state.teacherSections.selectedSectionId]
        ?.courseVersionId,
  }),
  dispatch => ({
    setUnit(unitId, courseVersionId) {
      dispatch(setUnit(unitId, courseVersionId));
    },
    asyncLoadCoursesWithProgress() {
      dispatch(asyncLoadCoursesWithProgress());
    },
  })
)(UnitSelectorV2);
