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

export default function LearningGoal({
  learningGoal,
  teacherHasEnabledAi,
  canProvideFeedback,
  reportingData,
  studentLevelInfo,
  aiUnderstanding,
  aiConfidence,
  submittedEvaluation,
  isStudent,
  feedbackAdded,
  setFeedbackAdded,
  aiEvalInfo,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [autosaved, setAutosaved] = useState(false);
  const [errorAutosaving, setErrorAutosaving] = useState(false);
  const [learningGoalEval, setLearningGoalEval] = useState(null);
  const [displayFeedback, setDisplayFeedback] = useState('');
  const [displayUnderstanding, setDisplayUnderstanding] =
    useState(invalidUnderstanding);
  const teacherFeedback = useRef('');
  const understandingLevel = useRef(invalidUnderstanding);

  const aiEnabled = learningGoal.aiEnabled && teacherHasEnabledAi;
  const base_teacher_evaluation_endpoint = '/learning_goal_teacher_evaluations';

  // Timer variables for autosaving
  const autosaveTimer = useRef();
  const saveAfter = 2000;

  const handleClick = () => {
    if (!isStudent) {
      const eventName = isOpen
        ? EVENTS.TA_RUBRIC_LEARNING_GOAL_COLLAPSED_EVENT
        : EVENTS.TA_RUBRIC_LEARNING_GOAL_EXPANDED_EVENT;
      analyticsReporter.sendEvent(eventName, {
        ...(reportingData || {}),
        learningGoalKey: learningGoal.key,
        learningGoal: learningGoal.learningGoal,
      });
    }
    setIsOpen(!isOpen);
  };

  const handleFeedbackChange = event => {
    if (studentLevelInfo.user_id && learningGoal.id) {
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

  const autosave = () => {
    setAutosaved(false);
    setIsAutosaving(true);
    setErrorAutosaving(false);
    const bodyData = JSON.stringify({
      studentId: studentLevelInfo.user_id,
      learningGoalId: learningGoal.id,
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
    if (studentLevelInfo && learningGoal.id) {
      const body = JSON.stringify({
        userId: studentLevelInfo.user_id,
        learningGoalId: learningGoal.id,
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
  }, [studentLevelInfo, learningGoal]);

  // Callback to retrieve understanding data from EvidenceLevels
  const radioButtonCallback = radioButtonData => {
    analyticsReporter.sendEvent(EVENTS.TA_RUBRIC_EVIDENCE_LEVEL_SELECTED, {
      ...(reportingData || {}),
      learningGoalId: learningGoal.id,
      learningGoal: learningGoal.learningGoal,
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

  return (
    <details className={style.learningGoalRow}>
      <summary className={style.learningGoalHeader} onClick={handleClick}>
        <div className={style.learningGoalHeaderLeftSide}>
          {/*TODO: [DES-321] Label-two styles here*/}
          <StrongText>{learningGoal.learningGoal}</StrongText>
        </div>
        <div className={style.learningGoalHeaderRightSide}>
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
      </summary>

      {/*TODO: Pass through data to child component*/}
      <div>
        {teacherHasEnabledAi &&
          !!studentLevelInfo &&
          !!aiEvalInfo &&
          aiUnderstanding !== undefined && (
            <div className={style.openedAiAssessment}>
              <AiAssessment
                isAiAssessed={learningGoal.aiEnabled}
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
            learningGoalKey={learningGoal.key}
            evidenceLevels={learningGoal.evidenceLevels}
            canProvideFeedback={canProvideFeedback}
            understanding={displayUnderstanding}
            radioButtonCallback={radioButtonCallback}
            submittedEvaluation={submittedEvaluation}
            isStudent={isStudent}
          />
          {learningGoal.tips && !isStudent && (
            <div>
              <Heading6>{i18n.tipsForEvaluation()}</Heading6>
              <div className={style.learningGoalTips}>
                <SafeMarkdown markdown={learningGoal.tips} />
              </div>
            </div>
          )}
          {!!studentLevelInfo && renderAutoSaveTextbox()}
        </div>
      </div>
    </details>
  );
}

LearningGoal.propTypes = {
  learningGoal: learningGoalShape.isRequired,
  teacherHasEnabledAi: PropTypes.bool,
  canProvideFeedback: PropTypes.bool,
  reportingData: reportingDataShape,
  studentLevelInfo: studentLevelInfoShape,
  aiUnderstanding: PropTypes.number,
  aiConfidence: PropTypes.number,
  submittedEvaluation: submittedEvaluationShape,
  isStudent: PropTypes.bool,
  feedbackAdded: PropTypes.bool,
  setFeedbackAdded: PropTypes.func,
  aiEvalInfo: aiEvaluationShape,
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
