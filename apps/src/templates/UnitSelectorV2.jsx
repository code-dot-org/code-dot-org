import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {
  asyncLoadCoursesWithProgress,
  setScriptId,
} from '@cdo/apps/redux/unitSelectionRedux';
import {loadUnitProgress} from '@cdo/apps/templates/sectionProgress/sectionProgressLoader';

import firehoseClient from '../lib/util/firehose';

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
  sectionId,
  scriptId,
  coursesWithProgress,
  className,
  setScriptId,
  asyncLoadCoursesWithProgress,
  isLoadingCourses,
}) {
  React.useEffect(() => {
    if (!coursesWithProgress || coursesWithProgress.length === 0) {
      asyncLoadCoursesWithProgress();
    }
  }, [coursesWithProgress, asyncLoadCoursesWithProgress]);

  const unitId = React.useMemo(() => scriptId, [scriptId]);
  const onSelectUnit = React.useCallback(
    e => {
      const newUnitId = parseInt(e.target.value);
      setScriptId(newUnitId);
      loadUnitProgress(newUnitId, sectionId);

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
    [unitId, setScriptId, sectionId]
  );

  const itemGroups = coursesWithProgress.map(version => ({
    label: version.display_name,
    groupItems: version.units.map(unit => ({
      value: unit.id,
      text: unit.name,
    })),
  }));

  const loadingDropdown = () => (
    <div
      className={classNames(
        skeletonizeContent.skeletonizeContent,
        styles.skeleton
      )}
    />
  );

  return isLoadingCourses ||
    !coursesWithProgress ||
    coursesWithProgress.length === 0 ? (
    loadingDropdown()
  ) : (
    <SimpleDropdown
      itemGroups={itemGroups}
      selectedValue={unitId}
      name="unitSelector"
      onChange={onSelectUnit}
      className={className}
      isLabelVisible={false}
      size="s"
      dropdownTextThickness="thin"
      id="unit-selector-v2"
      color="gray"
    />
  );
}

UnitSelectorV2.propTypes = {
  scriptId: PropTypes.number,
  sectionId: PropTypes.number,
  coursesWithProgress: PropTypes.array.isRequired,
  setScriptId: PropTypes.func.isRequired,
  className: PropTypes.string,
  asyncLoadCoursesWithProgress: PropTypes.func.isRequired,
  isLoadingCourses: PropTypes.bool,
};

export const UnconnectedUnitSelectorV2 = UnitSelectorV2;

export default connect(
  state => ({
    scriptId: state.unitSelection.scriptId,
    sectionId: state.teacherSections.selectedSectionId,
    coursesWithProgress: state.unitSelection.coursesWithProgress,
    isLoadingCourses: state.unitSelection.isLoadingCoursesWithProgress,
  }),
  dispatch => ({
    setScriptId(scriptId) {
      dispatch(setScriptId(scriptId));
    },
    asyncLoadCoursesWithProgress() {
      dispatch(asyncLoadCoursesWithProgress());
    },
  })
)(UnitSelectorV2);
