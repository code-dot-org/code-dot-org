import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import style from './rubrics.module.scss';
import aiFabIcon from '@cdo/static/ai-bot-centered-teal.png';
import rubricFabIcon from '@cdo/static/rubric-fab-background.png';
import taIcon from '@cdo/static/ai-bot-tag-TA.png';
import RubricContainer from './RubricContainer';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {
  rubricShape,
  reportingDataShape,
  studentLevelInfoShape,
} from './rubricShapes';
import {selectedSection} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';
import classNames from 'classnames';

// intro.js
import 'intro.js/introjs.css';
import {Steps} from 'intro.js-react';

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
  const [stepsEnabled, setStepsEnabled] = useState(true);

  const eventData = useMemo(() => {
    return {
      ...reportingData,
      viewingStudentWork: !!studentLevelInfo,
      viewingEvaluationLevel: rubric.level.name === currentLevelName,
    };
  }, [reportingData, studentLevelInfo, rubric.level.name, currentLevelName]);

  const initialStep = 0;
  const steps = [
    {
      element: '#ui-floatingActionButton',
      position: 'top',
      title: 'Getting Started with AI Teaching Assistant',
      intro:
        'Launch AI Teaching Assistant from the bottom left corner of the screen in sprite lab.\nClick on the AI Teaching Assistant to get started!',
    },
    {
      element: '.uitest-ai-assessment',
      position: 'left',
      title: 'Understanding the AI Assessment',
      intro:
        "AI Teaching Assistant analyzes students' code for each learning goal, then recommends a rubric score(s).  AI will provide one score for learning goals where our AI has trained extensively.  It will provide two scores where it needs more training data.\nThe final score is always up to you. AI Teaching Assistant will provide evidence for its recommendation.",
    },
    {
      // TODO: Add evidence image
      element: '#dropletCodeTextbox',
      position: 'left',
      title: 'Using Evidence',
      intro:
        'Where possible, AI Teaching Assistant will highlight the relevant lines of code in the student’s project so it is easy for you to double-check.',
    },
    {
      element: '#tour-ai-assessment-feedback',
      position: 'left',
      title: 'How did we do?',
      intro:
        'Your feedback helps us make the AI Teaching Assistant more helpful to you –  let us know how it did.\nFinish up by providing feedback about the AI Assessment.',
    },
    {
      element: '#tour-evidence-levels-for-teachers',
      position: 'left',
      title: 'Assigning a Rubric Score',
      intro:
        'Once you have reviewed the AI Assessment and the student’s code, assign a rubric score for the learning goal.',
    },
  ];

  const onExit = () => setStepsEnabled(false);

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
    trySetSessionStorage(sessionStorageKey, isOpen);
  }, [isOpen]);

  const fabIcon = aiEnabled ? aiFabIcon : rubricFabIcon;

  const showPulse = isFirstSession && isFabImageLoaded && isTaImageLoaded;
  const classes = showPulse
    ? classNames(style.floatingActionButton, style.pulse, 'unittest-fab-pulse')
    : style.floatingActionButton;

  return (
    <div id="fab-contained">
      <Steps
        enabled={stepsEnabled}
        initialStep={initialStep}
        steps={steps}
        onExit={onExit}
        options={{
          scrollToElement: true,
        }}
      />
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
