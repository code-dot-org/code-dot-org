import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import aiFabIcon from '@cdo/static/ai-fab-background.png';
import rubricFabIcon from '@cdo/static/rubric-fab-background.png';
import RubricContainer from './RubricContainer';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {
  rubricShape,
  reportingDataShape,
  studentLevelInfoShape,
} from './rubricShapes';

export default function RubricFloatingActionButton({
  rubric,
  studentLevelInfo,
  currentLevelName,
  reportingData,
  aiEnabled,
}) {
  const [isOpen, setIsOpen] = useState(false);

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

  const icon = aiEnabled ? aiFabIcon : rubricFabIcon;

  return (
    <div id="fab-contained">
      <button
        id="ui-floatingActionButton"
        className={style.floatingActionButton}
        // I couldn't get an image url to work in the SCSS module, so using an inline style for now
        style={{backgroundImage: `url(${icon})`}}
        onClick={handleClick}
        type="button"
      />
      {/* TODO: do not hardcode in AI setting */}
      <RubricContainer
        rubric={rubric}
        studentLevelInfo={studentLevelInfo}
        reportingData={reportingData}
        currentLevelName={currentLevelName}
        teacherHasEnabledAi={aiEnabled}
        open={isOpen}
        closeRubric={handleClick}
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
};
