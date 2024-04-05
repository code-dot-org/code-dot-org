import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import i18n from '@cdo/locale';
import classnames from 'classnames';
import {Heading6} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  reportingDataShape,
  rubricShape,
  studentLevelInfoShape,
} from './rubricShapes';
import RubricContent from './RubricContent';
import RubricSettings from './RubricSettings';
import RubricTabButtons from './RubricTabButtons';
import RubricSubmitFooter from './RubricSubmitFooter';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';
import Draggable from 'react-draggable';
import {TAB_NAMES} from './rubricHelpers';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';
// import evidenceDemo from '@cdo/static/ai-evidence-demo.gif';

// intro.js
// import './introjs.scss';
// import {Steps} from 'intro.js-react';

export default function RubricContainer({
  rubric,
  studentLevelInfo,
  teacherHasEnabledAi,
  currentLevelName,
  reportingData,
  open,
  closeRubric,
  sectionId,
}) {
  const onLevelForEvaluation = currentLevelName === rubric.level.name;
  const canProvideFeedback = !!studentLevelInfo && onLevelForEvaluation;
  const rubricTabSessionKey = 'rubricFABTabSessionKey';
  const rubricPositionX = 'rubricFABPositionX';
  const rubricPositionY = 'rubricFABPositionY';

  const [selectedTab, setSelectedTab] = useState(
    tryGetSessionStorage(rubricTabSessionKey, TAB_NAMES.RUBRIC) ||
      TAB_NAMES.RUBRIC
  );

  const [positionX, setPositionX] = useState(
    parseInt(tryGetSessionStorage(rubricPositionX, 0)) || 0
  );

  const [positionY, setPositionY] = useState(
    parseInt(tryGetSessionStorage(rubricPositionY, 0)) || 0
  );

  const [aiEvaluations, setAiEvaluations] = useState(null);

  const [feedbackAdded, setFeedbackAdded] = useState(false);

  // const [stepsEnabled, setStepsEnabled] = useState(false);
  // const [tourButtonLabel, setTourButtonLabel] = useState('Next');

  const tabSelectCallback = tabSelection => {
    setSelectedTab(tabSelection);
  };

  const fetchAiEvaluations = useCallback(() => {
    if (!!studentLevelInfo && teacherHasEnabledAi) {
      const studentId = studentLevelInfo.user_id;
      const rubricId = rubric.id;
      const dataUrl = `/rubrics/${rubricId}/get_ai_evaluations?student_id=${studentId}`;

      fetch(dataUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setAiEvaluations(data);
        })
        .catch(error => {
          console.log(
            'There was a problem with the fetch operation:',
            error.message
          );
        });
    }
  }, [studentLevelInfo, teacherHasEnabledAi, rubric.id]);

  useEffect(() => {
    fetchAiEvaluations();
  }, [fetchAiEvaluations]);

  useEffect(() => {
    trySetSessionStorage(rubricTabSessionKey, selectedTab);
  }, [selectedTab]);

  useEffect(() => {
    trySetSessionStorage(rubricPositionX, positionX);
  }, [positionX]);

  useEffect(() => {
    trySetSessionStorage(rubricPositionY, positionY);
  }, [positionY]);

  const onStopHandler = (event, dragElement) => {
    setPositionX(dragElement.x);
    setPositionY(dragElement.y);
  };

  // Currently the settings tab only provides a way to manually run AI.
  // In the future, we should update or remove this conditional when we
  // add more functionality to the settings tab.
  const showSettings = onLevelForEvaluation && teacherHasEnabledAi;

  // const updateTourStatus = useCallback(() => {
  //   const url = `/rubrics/${rubric.id}/update_ai_rubrics_tour_seen?seen=${stepsEnabled}`;
  //   fetch(url)
  //     .then(response => {
  //       return response.json();
  //     })
  //     .then(json => {
  //       if (json['seen'] === 'true') {
  //         setStepsEnabled(false);
  //       } else {
  //         setStepsEnabled(true);
  //       }
  //     });
  // }, [rubric.id, stepsEnabled]);

  // const getTourStatus = useCallback(() => {
  //   const url = `/rubrics/${rubric.id}/get_ai_rubrics_tour_seen`;
  //   fetch(url)
  //     .then(response => {
  //       return response.json();
  //     })
  //     .then(json => {
  //       if (json['seen'] === 'true') {
  //         setStepsEnabled(false);
  //       } else {
  //         setStepsEnabled(true);
  //       }
  //     });
  // }, [rubric.id]);

  // useEffect(() => {
  //   getTourStatus();
  // }, [getTourStatus]);

  // const initialStep = 0;
  // const steps = [
  //   {
  //     element: '#ui-floatingActionButton',
  //     title: 'Getting Started with AI Teaching Assistant',
  //     intro:
  //       '<p>Launch AI Teaching Assistant from the bottom left corner of the screen.</p>',
  //   },
  //   {
  //     element: '#tour-ai-assessment',
  //     title: 'Understanding the AI Assessment',
  //     intro:
  //       '<p>AI Teaching Assistant analyzes students’ code for each learning goal with AI enabled, then recommends a rubric score(s). AI will provide one score for learning goals where our AI has trained extensively. It will provide two scores where more training data is needed.</p><p>The final score is always up to you. AI Teaching Assistant will provide evidence for its recommendation.</p>',
  //   },
  //   {
  //     element: '#tour-ai-evidence',
  //     title: 'Using Evidence',
  //     position: 'top',
  //     intro: `<p>Where possible, AI Teaching Assistant will highlight the relevant lines of code in the student’s project so it is easy for you to double-check.</p><img src=${evidenceDemo}>`,
  //   },
  //   {
  //     element: '#tour-ai-confidence',
  //     title: 'Understanding AI Confidence',
  //     intro:
  //       "<p>The confidence rating gives you an idea of how often the AI agreed with teachers when scoring this learning goal. Just like humans, AI isn't perfect.</p>",
  //   },
  //   {
  //     element: '#tour-evidence-levels',
  //     title: 'Assigning a Rubric Score',
  //     intro:
  //       "<p>Once you have reviewed the AI Assessment and the student's code, assign a rubric score for the learning goal.</p>",
  //   },
  //   {
  //     element: '#tour-ai-assessment-feedback',
  //     title: 'How did we do?',
  //     intro:
  //       '<p>Your feedback helps us make the AI Teaching Assistant more helpful to you – let us know how it did.</p>',
  //   },
  // ];

  // // Dummy props for product tour
  // const rubricDummy = {
  //   id: 1,
  //   learningGoals: [
  //     {
  //       id: 1,
  //       key: '1',
  //       learningGoal: 'Variables',
  //       aiEnabled: true,
  //       evidenceLevels: rubric.learningGoals[0].evidenceLevels,
  //     },
  //   ],
  //   lesson: {
  //     position: 3,
  //     name: 'Data Structures',
  //   },
  //   level: {
  //     name: 'test_level',
  //     position: 7,
  //   },
  // };

  // const studentLevelInfoDummy = {
  //   name: 'Grace Hopper',
  //   timeSpent: 305,
  //   lastAttempt: '1980-07-31T00:00:00.000Z',
  //   attempts: 6,
  // };

  // const aiEvaluationsDummy = [
  //   {
  //     id: 1,
  //     learning_goal_id: 1,
  //     understanding: 2,
  //     aiConfidencePassFail: 2,
  //     evidence: '',
  //   },
  // ];

  // const onTourStart = stepIndex => {
  //   setTourButtonLabel('Next Tip');
  // };

  // const onTourExit = () => {
  //   updateTourStatus();
  // };

  // const onStepChange = (nextStepIndex, nextElement) => {
  //   if (nextStepIndex === 1) {
  //     document.getElementById('tour-fab-bg').scrollBy(0, 1000);
  //   }
  // };

  // const beforeStepChange = (nextStepIndex, nextElement) => {
  //   if (nextStepIndex === 1) {
  //     if (!open) {
  //       document.getElementById('ui-floatingActionButton').click();
  //     }
  //   }
  //   if (nextStepIndex === 2) {
  //     document
  //       .getElementById('tour-ai-assessment')
  //       .setAttribute('z-index', 99999);
  //   } else if (nextStepIndex === 4) {
  //     document
  //       .getElementById('tour-ai-confidence')
  //       .setAttribute('z-index', 99999);
  //   }
  // };

  // const onAfterStepChange = (newStepIndex, newElement) => {
  //   if (newStepIndex === 4) {
  //     document.getElementsByClassName(style.evidenceLevel)[3].click();
  //   }
  // };

  return (
    <Draggable
      defaultPosition={{x: positionX, y: positionY}}
      onStop={onStopHandler}
    >
      <div
        data-testid="draggable-test-id"
        id="draggable-id"
        className={classnames(style.rubricContainer, {
          [style.hiddenRubricContainer]: !open,
        })}
      >
        {/* <Steps
            enabled={stepsEnabled}
            initialStep={initialStep}
            steps={steps}
            onExit={onTourExit}
            onChange={onStepChange}
            onBeforeChange={beforeStepChange}
            onAfterChange={onAfterStepChange}
            onStart={onTourStart}
            options={{
              scrollToElement: false,
              exitOnOverlayClick: false,
              hidePrev: true,
              nextLabel: tourButtonLabel,
              showBullets: false,
              showStepNumbers: true,
            }}
          /> */}
        <div className={style.rubricHeaderRedesign}>
          <div className={style.rubricHeaderLeftSide}>
            <img
              src={aiBotOutlineIcon}
              className={style.aiBotOutlineIcon}
              alt={i18n.rubricAiHeaderText()}
            />
            <span>{i18n.rubricAiHeaderText()}</span>
          </div>
          <div className={style.rubricHeaderRightSide}>
            {/* <button
              type="button"
              onClick={updateTourStatus}
              className={classnames(style.buttonStyle, style.closeButton)}
            >
              <FontAwesome icon="circle-question" />
            </button> */}
            <button
              type="button"
              onClick={closeRubric}
              className={classnames(style.buttonStyle, style.closeButton)}
            >
              <FontAwesome icon="xmark" />
            </button>
          </div>
        </div>

        <div className={style.fabBackground}>
          <RubricTabButtons
            tabSelectCallback={tabSelectCallback}
            selectedTab={selectedTab}
            showSettings={showSettings}
            canProvideFeedback={canProvideFeedback}
            teacherHasEnabledAi={teacherHasEnabledAi}
            studentUserId={studentLevelInfo && studentLevelInfo['user_id']}
            refreshAiEvaluations={fetchAiEvaluations}
            rubric={rubric}
            studentName={studentLevelInfo && studentLevelInfo.name}
          />

          <RubricContent
            rubric={rubric}
            open={open}
            studentLevelInfo={studentLevelInfo}
            teacherHasEnabledAi={teacherHasEnabledAi}
            canProvideFeedback={canProvideFeedback}
            onLevelForEvaluation={onLevelForEvaluation}
            reportingData={reportingData}
            visible={selectedTab === TAB_NAMES.RUBRIC}
            aiEvaluations={aiEvaluations}
            feedbackAdded={feedbackAdded}
            setFeedbackAdded={setFeedbackAdded}
            sectionId={sectionId}
          />
          {showSettings && (
            <RubricSettings
              visible={selectedTab === TAB_NAMES.SETTINGS}
              refreshAiEvaluations={fetchAiEvaluations}
              rubric={rubric}
              sectionId={sectionId}
              tabSelectCallback={tabSelectCallback}
              reportingData={reportingData}
            />
          )}
        </div>
        {canProvideFeedback && (
          <RubricSubmitFooter
            open={open}
            rubric={rubric}
            reportingData={reportingData}
            studentLevelInfo={studentLevelInfo}
            feedbackAdded={feedbackAdded}
            setFeedbackAdded={setFeedbackAdded}
          />
        )}
      </div>
    </Draggable>
  );
}

RubricContainer.propTypes = {
  rubric: rubricShape,
  reportingData: reportingDataShape,
  studentLevelInfo: studentLevelInfoShape,
  teacherHasEnabledAi: PropTypes.bool,
  currentLevelName: PropTypes.string,
  closeRubric: PropTypes.func,
  open: PropTypes.bool,
  sectionId: PropTypes.number,
};

const HeaderTab = ({text, isSelected, onClick}) => {
  return (
    <button
      className={classnames(
        'uitest-rubric-header-tab',
        style.rubricHeaderTab,
        style.buttonStyle,
        {
          [style.selectedTab]: isSelected,
          [style.unselectedTab]: !isSelected,
        }
      )}
      onClick={onClick}
      type="button"
    >
      <Heading6>{text}</Heading6>
    </button>
  );
};

HeaderTab.propTypes = {
  text: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};
