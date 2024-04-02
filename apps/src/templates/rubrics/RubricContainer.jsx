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
import evidenceDemo from '@cdo/static/ai-evidence-demo.gif';
import HttpClient from '@cdo/apps/util/HttpClient';

// intro.js
import 'intro.js/introjs.css';
import {Steps} from 'intro.js-react';

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

  const [stepsEnabled, setStepsEnabled] = useState(true);
  const [tourButtonLabel, setTourButtonLabel] = useState('Next');

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

  const updateTourStatus = async () => {
    const url = `/rubrics/${rubric.id}/update_ai_rubrics_tour_seen`;
    let bodyData;
    if (stepsEnabled) {
      bodyData = JSON.stringify({seen: true});
    } else {
      bodyData = JSON.stringify({seen: false});
    }

    HttpClient.post(url, bodyData, {
      'Content-Type': 'application/json',
    })
      .then(response => {
        return response.json();
      })
      .then(json => {
        if (json['seen']) {
          setStepsEnabled(false);
        } else {
          setStepsEnabled(true);
        }
        console.log('status updated to', json['seen']);
      });
  };

  const getTourStatus = async () => {
    const url = `/rubrics/${rubric.id}/get_ai_rubrics_tour_seen`;
    fetch(url)
      .then(response => {
        return response.json();
      })
      .then(json => {
        if (json['seen']) {
          setStepsEnabled(false);
        } else {
          setStepsEnabled(true);
        }
        console.log('tour status is', json['seen']);
      });
  };

  useEffect(() => {
    getTourStatus();
  });

  // Currently the settings tab only provides a way to manually run AI.
  // In the future, we should update or remove this conditional when we
  // add more functionality to the settings tab.
  const showSettings = onLevelForEvaluation && teacherHasEnabledAi;

  // Steps for product tour
  const initialStep = 0;
  const steps = [
    {
      element: '#ui-floatingActionButton',
      title: 'Getting Started with AI Teaching Assistant',
      intro:
        '<p>Launch AI Teaching Assistant from the bottom left corner of the screen in sprite lab.</p><p><b>Click on the AI Teaching Assistant to get started!</b></p>',
    },
    {
      element: '#tour-ai-assessment',
      title: 'Understanding the AI Assessment',
      intro:
        '<p>AI Teaching Assistant analyzes students’ code for each learning goal with AI enabled, then recommends a rubric score(s). AI will provide one score for learning goals where our AI has trained extensively. It will provide two scores where more training data is needed.</p><p>The final score is always up to you. AI Teaching Assistant will provide evidence for its recommendation.</p>',
    },
    {
      // TODO: Add evidence image
      element: '#draggable-id',
      title: 'Using Evidence',
      intro: `<p>Where possible, AI Teaching Assistant will highlight the relevant lines of code in the student’s project so it is easy for you to double-check.</p><img src=${evidenceDemo}>`,
    },
    {
      element: '#tour-ai-confidence',
      title: 'How did we do?',
      intro:
        "<p>The confidence rating gives you an idea of how often the AI agreed with teachers when scoring this learning goal. Just like humans, AI isn't perfect.</p>",
    },
    {
      element: '#tour-ai-assessment-feedback',
      title: 'How did we do?',
      intro:
        '<p>Your feedback helps us make the AI Teaching Assistant more helpful to you –  let us know how it did.</p><p><b>Finish up by providing feedback about the AI Assessment.</b></p>',
    },
    {
      element: '#tour-evidence-levels',
      title: 'Assigning a Rubric Score',
      intro:
        "<p>Once you have reviewed the AI Assessment and the student's code, assign a rubric score for the learning goal.</p>",
    },
  ];

  const onExit = () => {
    setStepsEnabled(false);
    updateTourStatus();
  };

  // Dummy props for product tour
  const rubricDummy = {
    id: 1,
    learningGoals: [
      {
        id: 1,
        key: '1',
        learningGoal: 'goal 1',
        aiEnabled: true,
        evidenceLevels: rubric.learningGoals[0].evidenceLevels,
      },
    ],
    lesson: {
      position: 3,
      name: 'Data Structures',
    },
    level: {
      name: 'test_level',
      position: 7,
    },
  };

  const studentLevelInfoDummy = {
    name: 'Grace Hopper',
    timeSpent: 305,
    lastAttempt: '1980-07-31T00:00:00.000Z',
    attempts: 6,
  };

  const aiEvaluationsDummy = [
    {id: 1, learning_goal_id: 1, understanding: 2, aiConfidencePassFail: 2},
  ];

  const onStepChange = (nextStepIndex, nextElement) => {
    if (nextStepIndex === 1) {
      document.getElementById('tour-fab-bg').scrollBy(0, 1000);
      setTourButtonLabel('See how evidence works');
    } else if (nextStepIndex === 2) {
      setTourButtonLabel('Got it!');
    } else {
      setTourButtonLabel('Next');
    }
  };

  const beforeStepChange = (nextStepIndex, nextElement) => {
    if (nextStepIndex === 1) {
      return open;
    } else if (nextStepIndex === 2) {
      document
        .getElementById('tour-ai-assessment')
        .setAttribute('z-index', 99999);
    } else if (nextStepIndex === 4) {
      document
        .getElementById('tour-ai-confidence')
        .setAttribute('z-index', 99999);
    }
  };

  return (
    <Draggable
      defaultPosition={{x: positionX, y: positionY}}
      onStop={onStopHandler}
    >
      {stepsEnabled ? (
        <div
          data-testid="draggable-test-id"
          id="draggable-id"
          className={classnames(style.rubricContainer, {
            [style.hiddenRubricContainer]: !open,
          })}
        >
          <Steps
            enabled={stepsEnabled}
            initialStep={initialStep}
            steps={steps}
            onExit={onExit}
            onChange={onStepChange}
            onBeforeChange={beforeStepChange}
            options={{
              scrollToElement: false,
              exitOnOverlayClick: false,
              hidePrev: true,
              nextLabel: tourButtonLabel,
              tooltipClass: style.productTourToolTip,
              buttonClass: style.productTourButtons,
              showBullets: false,
              showStepNumbers: true,
            }}
          />
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
              <button
                type="button"
                onClick={closeRubric}
                className={classnames(style.buttonStyle, style.closeButton)}
              >
                <FontAwesome icon="xmark" />
              </button>
            </div>
          </div>

          <div id="tour-fab-bg" className={style.fabBackground}>
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
              productTour={stepsEnabled}
              rubric={rubricDummy}
              open={open}
              studentLevelInfo={studentLevelInfoDummy}
              teacherHasEnabledAi={true}
              canProvideFeedback={true}
              onLevelForEvaluation={true}
              reportingData={reportingData}
              visible={selectedTab === TAB_NAMES.RUBRIC}
              aiEvaluations={aiEvaluationsDummy}
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
      ) : (
        <div
          data-testid="draggable-test-id"
          id="draggable-id"
          className={classnames(style.rubricContainer, {
            [style.hiddenRubricContainer]: !open,
          })}
        >
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
      )}
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
