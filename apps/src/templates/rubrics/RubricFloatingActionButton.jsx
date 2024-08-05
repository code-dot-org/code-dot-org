import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';
import {connect} from 'react-redux';

import {EVENTS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import {selectedSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';
import aiFabIcon from '@cdo/static/ai-bot-centered-teal.png';
import taIcon from '@cdo/static/ai-bot-tag-TA.png';
import rubricFabIcon from '@cdo/static/rubric-fab-background.png';

import RubricContainer from './RubricContainer';
import {
  rubricShape,
  reportingDataShape,
  studentLevelInfoShape,
} from './rubricShapes';

import style from './rubrics.module.scss';

function RubricFloatingActionButton({
  rubric,
  studentLevelInfo,
  currentLevelName,
  reportingData,
  aiEnabled,
  sectionId,
}) {
  const sessionStorageKey = 'RubricFabOpenStateKey';
  const [isOpen, setIsOpen] = useState(
    JSON.parse(tryGetSessionStorage(sessionStorageKey, false)) || false
  );
  // Show the pulse if this is the first time the user has seen the FAB in this
  // session. Depends on other logic which sets the open state in session storage.
  const [isFirstSession] = useState(
    JSON.parse(tryGetSessionStorage(sessionStorageKey, null)) === null
  );
  const [isFabImageLoaded, setIsFabImageLoaded] = useState(false);
  const [isTaImageLoaded, setIsTaImageLoaded] = useState(false);

  const eventData = useMemo(() => {
    return {
      ...reportingData,
      viewingStudentWork: !!studentLevelInfo,
      viewingEvaluationLevel: rubric.level.name === currentLevelName,
    };
  }, [reportingData, studentLevelInfo, rubric.level.name, currentLevelName]);

  const handleClick = () => {
    const eventName = isOpen
      ? EVENTS.TA_RUBRIC_CLOSED_FROM_FAB_EVENT
      : EVENTS.TA_RUBRIC_OPENED_FROM_FAB_EVENT;
    analyticsReporter.sendEvent(eventName, eventData);
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!!studentLevelInfo) {
      analyticsReporter.sendEvent(
        EVENTS.TA_RUBRIC_ON_STUDENT_WORK_LOADED,
        eventData
      );

      const fireUnloadEvent = () =>
        analyticsReporter.sendEvent(
          EVENTS.TA_RUBRIC_ON_STUDENT_WORK_UNLOADED,
          eventData
        );
      window.addEventListener('beforeunload', fireUnloadEvent);

      return () => {
        window.removeEventListener('beforeunload', fireUnloadEvent);
      };
    }
  }, [eventData, studentLevelInfo]); // Neither of these should change, so this should run once

  useEffect(() => {
    analyticsReporter.sendEvent(
      isOpen
        ? EVENTS.TA_RUBRIC_OPEN_ON_PAGE_LOAD
        : EVENTS.TA_RUBRIC_CLOSED_ON_PAGE_LOAD,
      eventData
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // disabling isOpen dependency because we only want this to report the initial open state once

  useEffect(() => {
    trySetSessionStorage(sessionStorageKey, isOpen);
  }, [isOpen]);

  const fabIcon = aiEnabled ? aiFabIcon : rubricFabIcon;

  const showPulse = isFirstSession && isFabImageLoaded && isTaImageLoaded;
  const classes = showPulse
    ? classNames(style.floatingActionButton, style.pulse, 'unittest-fab-pulse')
    : style.floatingActionButton;

  return (
    <div id="fab-contained">
      <button
        id="ui-floatingActionButton"
        className={classes}
        onClick={handleClick}
        type="button"
      >
        <img
          alt="AI bot"
          src={fabIcon}
          onLoad={() => !isFabImageLoaded && setIsFabImageLoaded(true)}
        />
      </button>
      <div
        className={style.taOverlay}
        style={{backgroundImage: `url(${taIcon})`}}
      >
        <img
          src={taIcon}
          alt="TA overlay"
          onLoad={() => !isTaImageLoaded && setIsTaImageLoaded(true)}
        />
      </div>
      {/* TODO: do not hardcode in AI setting */}
      <RubricContainer
        rubric={rubric}
        studentLevelInfo={studentLevelInfo}
        reportingData={reportingData}
        currentLevelName={currentLevelName}
        teacherHasEnabledAi={aiEnabled}
        open={isOpen}
        closeRubric={handleClick}
        sectionId={sectionId}
      />
    </div>
  );
}

RubricFloatingActionButton.propTypes = {
  rubric: rubricShape,
  studentLevelInfo: studentLevelInfoShape,
  currentLevelName: PropTypes.string,
  reportingData: reportingDataShape,
  aiEnabled: PropTypes.bool,
  sectionId: PropTypes.number,
};

export const UnconnectedRubricFloatingActionButton = RubricFloatingActionButton;

export default connect(state => ({
  sectionId: selectedSection(state)?.id,
}))(RubricFloatingActionButton);
