import React, {useEffect, useState, useRef} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import classnames from 'classnames';
import style from './rubrics.module.scss';
import {
  learningGoalShape,
  reportingDataShape,
  studentLevelInfoShape,
  submittedEvaluationShape,
  aiEvaluationShape,
} from './rubricShapes';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  BodyThreeText,
  BodyFourText,
  ExtraStrongText,
  StrongText,
  Heading6,
} from '@cdo/apps/componentLibrary/typography';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import EvidenceLevels from './EvidenceLevels';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import AiAssessment from './AiAssessment';
import HttpClient from '@cdo/apps/util/HttpClient';
import {UNDERSTANDING_LEVEL_STRINGS} from './rubricHelpers';

const invalidUnderstanding = -1;

export default function LearningGoals({
  learningGoals,
  teacherHasEnabledAi,
  canProvideFeedback,
  reportingData,
  studentLevelInfo,
  submittedEvaluation,
  isStudent,
  feedbackAdded,
  setFeedbackAdded,
  aiEvaluations,
}) {
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [autosaved, setAutosaved] = useState(false);
  const [errorAutosaving, setErrorAutosaving] = useState(false);
  const [learningGoalEval, setLearningGoalEval] = useState(null);
  const [displayFeedback, setDisplayFeedback] = useState('');
  const [displayUnderstanding, setDisplayUnderstanding] =
    useState(invalidUnderstanding);
  const [currentLearningGoal, setCurrentLearningGoal] = useState(0);
  const teacherFeedback = useRef('');
  const understandingLevel = useRef(invalidUnderstanding);

  const aiEnabled =
    learningGoals[currentLearningGoal].aiEnabled && teacherHasEnabledAi;
  const base_teacher_evaluation_endpoint = '/learning_goal_teacher_evaluations';

  // Timer variables for autosaving
  const autosaveTimer = useRef();
  const saveAfter = 2000;

  const handleFeedbackChange = event => {
    if (studentLevelInfo.user_id && learningGoals[currentLearningGoal].id) {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
      teacherFeedback.current = event.target.value;
      setDisplayFeedback(teacherFeedback.current);
      autosaveTimer.current = setTimeout(() => {
        autosave();
      }, saveAfter);
    }
  };

  const getAiUnderstanding = learningGoalId => {
    if (!!aiEvaluations) {
      const aiInfo = aiEvaluations.find(
        item => item.learning_goal_id === learningGoalId
      );
      return aiInfo?.understanding;
    } else {
      return null;
    }
  };

  const getAiConfidence = learningGoalId => {
    if (!!aiEvaluations) {
      const aiInfo = aiEvaluations.find(
        item => item.learning_goal_id === learningGoalId
      );
      return aiInfo?.ai_confidence;
    } else {
      return null;
    }
  };

  const getAiInfo = learningGoalId => {
    if (!!aiEvaluations) {
      const aiInfo = aiEvaluations.find(
        item => item.learning_goal_id === learningGoalId
      );
      return aiInfo;
    } else {
      return null;
    }
  };

  const aiUnderstanding = getAiUnderstanding(
    learningGoals[currentLearningGoal].id
  );
  const aiConfidence = getAiConfidence(learningGoals[currentLearningGoal].id);
  const aiEvalInfo = getAiInfo(learningGoals[currentLearningGoal].id);

  const autosave = () => {
    setAutosaved(false);
    setIsAutosaving(true);
    setErrorAutosaving(false);
    const bodyData = JSON.stringify({
      studentId: studentLevelInfo.user_id,
      learningGoalId: learningGoals[currentLearningGoal].id,
      feedback: teacherFeedback.current,
      understanding: understandingLevel.current,
    });
    HttpClient.put(
      `${base_teacher_evaluation_endpoint}/${learningGoalEval.id}`,
      bodyData,
      true,
      {
        'Content-Type': 'application/json',
      }
    )
      .then(() => {
        setIsAutosaving(false);
        setAutosaved(true);
        if (!feedbackAdded) {
          setFeedbackAdded(true);
        }
      })
      .catch(error => {
        console.log(error);
        setIsAutosaving(false);
        setErrorAutosaving(true);
      });
    clearTimeout(autosaveTimer.current);
  };

  useEffect(() => {
    if (studentLevelInfo && learningGoals[currentLearningGoal].id) {
      const body = JSON.stringify({
        userId: studentLevelInfo.user_id,
        learningGoalId: learningGoals[currentLearningGoal].id,
      });
      HttpClient.post(
        `${base_teacher_evaluation_endpoint}/get_or_create_evaluation`,
        body,
        true,
        {
          'Content-Type': 'application/json',
        }
      )
        .then(response => response.json())
        .then(json => {
          setLearningGoalEval(json);
          if (json.feedback) {
            teacherFeedback.current = json.feedback;
            setDisplayFeedback(teacherFeedback.current);
          }
          if (json.understanding >= 0 && json.understanding !== null) {
            setDisplayUnderstanding(json.understanding);
            understandingLevel.current = json.understanding;
          }
        })
        .catch(error => console.log(error));
    }
  }, [studentLevelInfo, learningGoals, currentLearningGoal]);

  // Callback to retrieve understanding data from EvidenceLevels
  const radioButtonCallback = radioButtonData => {
    analyticsReporter.sendEvent(EVENTS.TA_RUBRIC_EVIDENCE_LEVEL_SELECTED, {
      ...(reportingData || {}),
      learningGoalId: learningGoals[currentLearningGoal].id,
      learningGoal: learningGoals[currentLearningGoal].learningGoal,
      newlySelectedEvidenceLevel: radioButtonData,
      previouslySelectedEvidenceLevel: understandingLevel.current,
    });
    setDisplayUnderstanding(radioButtonData);
    understandingLevel.current = radioButtonData;
    if (!isAutosaving) {
      autosave();
    }
  };

  const renderAutoSaveTextbox = () => {
    return (
      <div className={`${style.feedbackArea} uitest-learning-goal`}>
        <label className={style.evidenceLevelLabel}>
          <span>{i18n.feedback()}</span>
          <textarea
            id="ui-teacherFeedback"
            className={style.inputTextbox}
            name="teacherFeedback"
            value={displayFeedback}
            onChange={handleFeedbackChange}
            disabled={!canProvideFeedback}
          />
        </label>
        {isAutosaving ? (
          <span className={style.autosaveMessage}>{i18n.saving()}</span>
        ) : (
          autosaved && (
            <span id="ui-autosaveConfirm" className={style.autosaveMessage}>
              <FontAwesome icon="circle-check" /> {i18n.savedToGallery()}
            </span>
          )
        )}
        {errorAutosaving && (
          <span className={style.autosaveMessage}>
            {i18n.feedbackSaveError()}
          </span>
        )}
      </div>
    );
  };

  const renderSubmittedFeedbackTextbox = () => {
    return (
      <div className={style.feedbackArea}>
        <label className={style.evidenceLevelLabel}>
          <span>{i18n.feedback()}</span>
          <textarea
            className={style.inputTextbox}
            name="teacherFeedback"
            value={submittedEvaluation.feedback}
            disabled
          />
        </label>
      </div>
    );
  };

  const onCarouselPress = buttonValue => {
    let currentIndex = currentLearningGoal;
    currentIndex += buttonValue;
    if (currentIndex < 0) {
      currentIndex = learningGoals.length - 1;
    } else if (currentIndex >= learningGoals.length) {
      currentIndex = 0;
    }
    setCurrentLearningGoal(currentIndex);
    if (!isStudent) {
      const eventName = EVENTS.TA_RUBRIC_LEARNING_GOAL_SELECTED;
      analyticsReporter.sendEvent(eventName, {
        ...(reportingData || {}),
        learningGoalKey: learningGoals[currentIndex].key,
        learningGoal: learningGoals[currentIndex].learningGoal,
      });
    }
  };

  return (
    <div className={style.learningGoalsContainer}>
      <div className={style.learningGoalsHeader}>
        <button
          type="button"
          className={style.learningGoalButton}
          onClick={() => onCarouselPress(-1)}
        >
          <FontAwesome icon="angle-left" />
        </button>
        <div className={style.learningGoalsHeaderLeftSide}>
          {/*TODO: [DES-321] Label-two styles here*/}
          <StrongText>
            {learningGoals[currentLearningGoal].learningGoal}
          </StrongText>
        </div>
        <div className={style.learningGoalsHeaderRightSide}>
          {aiEnabled && displayUnderstanding === invalidUnderstanding && (
            <AiToken />
          )}
          {/*TODO: Display status of feedback*/}
          {canProvideFeedback &&
            aiEnabled &&
            displayUnderstanding === invalidUnderstanding && (
              <BodyThreeText>{i18n.approve()}</BodyThreeText>
            )}
          {canProvideFeedback &&
            !aiEnabled &&
            displayUnderstanding === invalidUnderstanding && (
              <BodyThreeText>{i18n.evaluate()}</BodyThreeText>
            )}
          {displayUnderstanding >= 0 && (
            <BodyThreeText>
              {UNDERSTANDING_LEVEL_STRINGS[displayUnderstanding]}
            </BodyThreeText>
          )}
          {submittedEvaluation && (
            <div className={style.submittedEvaluation}>
              {submittedEvaluation.understanding !== null && (
                <BodyThreeText>
                  {
                    UNDERSTANDING_LEVEL_STRINGS[
                      submittedEvaluation.understanding
                    ]
                  }
                </BodyThreeText>
              )}
              {submittedEvaluation.feedback && (
                <FontAwesome
                  icon="message"
                  className="fa-regular"
                  title={i18n.feedback()}
                />
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          className={style.learningGoalButton}
          onClick={() => onCarouselPress(1)}
        >
          <FontAwesome icon="angle-right" />
        </button>
      </div>

      {/*TODO: Pass through data to child component*/}
      <div>
        {teacherHasEnabledAi &&
          !!studentLevelInfo &&
          !!aiEvalInfo &&
          aiUnderstanding !== undefined && (
            <div className={style.openedAiAssessment}>
              <AiAssessment
                isAiAssessed={learningGoals[currentLearningGoal].aiEnabled}
                studentName={studentLevelInfo.name}
                aiConfidence={aiConfidence}
                aiUnderstandingLevel={aiUnderstanding}
                aiEvalInfo={aiEvalInfo}
              />
            </div>
          )}
        <div className={style.learningGoalExpanded}>
          {!!submittedEvaluation && renderSubmittedFeedbackTextbox()}
          <EvidenceLevels
            learningGoalKey={learningGoals[currentLearningGoal].key}
            evidenceLevels={learningGoals[currentLearningGoal].evidenceLevels}
            canProvideFeedback={canProvideFeedback}
            understanding={displayUnderstanding}
            radioButtonCallback={radioButtonCallback}
            submittedEvaluation={submittedEvaluation}
            isStudent={isStudent}
          />
          {learningGoals[currentLearningGoal].tips && !isStudent && (
            <div>
              <Heading6>{i18n.tipsForEvaluation()}</Heading6>
              <div className={style.learningGoalTips}>
                <SafeMarkdown
                  markdown={learningGoals[currentLearningGoal].tips}
                />
              </div>
            </div>
          )}
          {!!studentLevelInfo && renderAutoSaveTextbox()}
        </div>
      </div>
    </div>
  );
}

LearningGoals.propTypes = {
  teacherHasEnabledAi: PropTypes.bool,
  canProvideFeedback: PropTypes.bool,
  reportingData: reportingDataShape,
  studentLevelInfo: studentLevelInfoShape,
  submittedEvaluation: submittedEvaluationShape,
  isStudent: PropTypes.bool,
  feedbackAdded: PropTypes.bool,
  setFeedbackAdded: PropTypes.func,
  learningGoals: PropTypes.arrayOf(learningGoalShape),
  aiEvaluations: PropTypes.arrayOf(aiEvaluationShape),
};

const AiToken = () => {
  return (
    <div className="uitest-uses-ai">
      {' '}
      <BodyFourText className={classnames(style.aiToken, style.aiTokenText)}>
        <ExtraStrongText>{i18n.usesAi()}</ExtraStrongText>
      </BodyFourText>
    </div>
  );
};
