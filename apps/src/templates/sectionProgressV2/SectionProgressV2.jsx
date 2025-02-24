import {Heading1, Heading6} from '@code-dot-org/component-library/typography';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {useParams} from 'react-router-dom';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import i18n from '@cdo/locale';

import {unitDataPropType} from '../sectionProgress/sectionProgressConstants';
import {loadUnitProgress} from '../sectionProgress/sectionProgressLoader';
import {
  getCurrentUnitData,
  loadExpandedLessonsFromLocalStorage,
} from '../sectionProgress/sectionProgressRedux';
import {showV2TeacherDashboard} from '../teacherNavigation/TeacherNavFlagUtils';
import UnitSelectorV2 from '../UnitSelectorV2';

import IconKey from './IconKey';
import MoreOptionsDropdown from './MoreOptionsDropdown';
import ProgressTableV2 from './ProgressTableV2';

import styles from './progress-table-v2.module.scss';

function SectionProgressV2({
  scriptId,
  sectionId,
  unitData,
  isLoadingProgress,
  isRefreshingProgress,
  isLevelProgressLoaded,
  isLoadingSectionData,
  expandedLessonIds,
  loadExpandedLessonsFromLocalStorage,
  hideTopHeading,
}) {
  const params = useParams();
  React.useEffect(() => {
    loadExpandedLessonsFromLocalStorage(scriptId, sectionId);
    analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_VIEW, {
      sectionId: sectionId,
      unitId: scriptId,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    });
  }, [scriptId, sectionId, loadExpandedLessonsFromLocalStorage]);

  const levelDataInitialized = React.useMemo(() => {
    return unitData && isLevelProgressLoaded;
  }, [unitData, isLevelProgressLoaded]);

  // We don't want to load data more than necessary, so we only load data when
  // the scriptId or sectionId changes, and only if we haven't already loaded
  // data for that scriptId and sectionId recently.
  const [loadedData, setLoadedData] = React.useState({
    scriptId: null,
    sectionId: null,
  });

  React.useEffect(() => {
    let isMounted = true;
    if (
      (!unitData || unitData.id !== scriptId) &&
      (scriptId !== loadedData.scriptId ||
        sectionId !== loadedData.sectionId) &&
      !isLoadingProgress &&
      !isRefreshingProgress &&
      sectionId &&
      scriptId &&
      isMounted // only update loaded data if component is still mounted.
    ) {
      loadUnitProgress(scriptId, sectionId).then(() =>
        setLoadedData({scriptId, sectionId})
      );
    }
    return () => {
      isMounted = false;
    };
  }, [
    scriptId,
    sectionId,
    unitData,
    isLoadingProgress,
    isRefreshingProgress,
    loadedData,
    setLoadedData,
  ]);

  const isViewingValidatedLevel = React.useMemo(() => {
    return unitData?.lessons
      .filter(lesson => expandedLessonIds.includes(lesson.id))
      .some(lesson => lesson.levels.some(level => level.isValidated));
  }, [expandedLessonIds, unitData]);

  const isLoading = React.useMemo(() => {
    if (showV2TeacherDashboard() && parseInt(params.sectionId) !== sectionId) {
      // If we're in the V2 teacher dashboard, we want to show a loading state if the
      // redux section does not yet match the URL section.
      return true;
    }
    return (
      !levelDataInitialized ||
      isLoadingSectionData ||
      isLoadingProgress ||
      isRefreshingProgress
    );
  }, [
    levelDataInitialized,
    isLoadingSectionData,
    isLoadingProgress,
    isRefreshingProgress,
    params.sectionId,
    sectionId,
  ]);

  return (
    // eslint-disable-next-line react/forbid-dom-props
    <div className={styles.progressV2Page} data-testid="section-progress-v2">
      {!hideTopHeading && <Heading1>{i18n.progressBeta()}</Heading1>}
      <IconKey
        isViewingValidatedLevel={isViewingValidatedLevel}
        expandedLessonIds={expandedLessonIds}
        sectionId={sectionId}
      />
      <div className={styles.title}>
        <Heading6 className={styles.titleStudents}>{i18n.students()}</Heading6>
        <Heading6 className={styles.titleUnitSelector}>
          {i18n.lessonsIn()}

          <UnitSelectorV2 className={styles.titleUnitSelectorDropdown} />
          <MoreOptionsDropdown />
        </Heading6>
      </div>
      <ProgressTableV2 isSkeleton={isLoading} />
    </div>
  );
}

SectionProgressV2.propTypes = {
  scriptId: PropTypes.number,
  sectionId: PropTypes.number,
  unitData: unitDataPropType,
  isLoadingProgress: PropTypes.bool.isRequired,
  isRefreshingProgress: PropTypes.bool.isRequired,
  isLevelProgressLoaded: PropTypes.bool.isRequired,
  isLoadingSectionData: PropTypes.bool.isRequired,
  expandedLessonIds: PropTypes.array,
  loadExpandedLessonsFromLocalStorage: PropTypes.func.isRequired,
  hideTopHeading: PropTypes.bool,
};

export default connect(
  state => ({
    scriptId: state.unitSelection.scriptId,
    sectionId: state.teacherSections.selectedSectionId,
    unitData: getCurrentUnitData(state),
    isLoadingProgress: state.sectionProgress.isLoadingProgress,
    isRefreshingProgress: state.sectionProgress.isRefreshingProgress,
    isLevelProgressLoaded:
      !!state.sectionProgress.studentLevelProgressByUnit[
        state.unitSelection.scriptId
      ],
    isLoadingSectionData: state.teacherSections.isLoadingSectionData,
    expandedLessonIds:
      state.sectionProgress.expandedLessonIds[
        state.teacherSections.selectedSectionId
      ] || [],
  }),
  dispatch => ({
    loadExpandedLessonsFromLocalStorage(scriptId, sectionId) {
      dispatch(loadExpandedLessonsFromLocalStorage(scriptId, sectionId));
    },
  })
)(SectionProgressV2);
