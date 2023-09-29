import React, {useEffect, useState, useRef} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import classnames from 'classnames';
import style from './rubrics.module.scss';
import {
  learningGoalShape,
  reportingDataShape,
  studentLevelInfoShape,
} from './rubricShapes';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  BodyThreeText,
  BodyFourText,
  ExtraStrongText,
  Heading6,
} from '@cdo/apps/componentLibrary/typography';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import EvidenceLevels from './EvidenceLevels';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import HttpClient from '@cdo/apps/util/HttpClient';
import {UNDERSTANDING_LEVEL_STRINGS} from './rubricHelpers';

export default function LearningGoal({
  learningGoal,
  teacherHasEnabledAi,
  canProvideFeedback,
  reportingData,
  studentLevelInfo,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const [isAutosaving, setIsAutosaving] = useState(false);
  const [autosaved, setAutosaved] = useState(false);
  const [errorAutosaving, setErrorAutosaving] = useState(false);
  const [learningGoalEval, setLearningGoalEval] = useState(null);
  const [displayFeedback, setDisplayFeedback] = useState('');
  const [displayUnderstanding, setDisplayUnderstanding] = useState(-1);
  const understandingLevel = useRef(0);
  const teacherFeedback = useRef('');

  const aiEnabled = learningGoal.aiEnabled && teacherHasEnabledAi;
  const base_endpoint = '/learning_goal_evaluations';

  // Timer variables for autosaving
  const autosaveTimer = useRef();
  const saveAfter = 2000;

  const handleClick = () => {
    const eventName = isOpen
      ? EVENTS.RUBRIC_LEARNING_GOAL_COLLAPSED_EVENT
      : EVENTS.RUBRIC_LEARNING_GOAL_EXPANDED_EVENT;
    analyticsReporter.sendEvent(eventName, {
      ...(reportingData || {}),
      learningGoalKey: learningGoal.key,
      learningGoal: learningGoal.learningGoal,
    });
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
    HttpClient.put(`${base_endpoint}/${learningGoalEval.id}`, bodyData, true, {
      'Content-Type': 'application/json',
    })
      .then(() => {
        setIsAutosaving(false);
        setAutosaved(true);
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
      HttpClient.post(`${base_endpoint}/get_or_create_evaluation`, body, true, {
        'Content-Type': 'application/json',
      })
        .then(response => response.json())
        .then(json => {
          setLearningGoalEval(json);
          if (json.feedback) {
            teacherFeedback.current = json.feedback;
            setDisplayFeedback(teacherFeedback.current);
          }
          if (json.understanding >= 0 && json.understanding !== null) {
            understandingLevel.current = json.understanding;
            setDisplayUnderstanding(json.understanding);
          }
          console.log(understandingLevel.current);
        })
        .catch(error => console.log(error));
    }
  }, [studentLevelInfo, learningGoal]);

  // Callback to retrieve understanding data from EvidenceLevels
  const radioButtonCallback = radioButtonData => {
    understandingLevel.current = radioButtonData;
    setDisplayUnderstanding(radioButtonData);
    if (!isAutosaving) {
      autosave();
    }
  };

  return (
    <details className={style.learningGoalRow}>
      <summary className={style.learningGoalHeader} onClick={handleClick}>
        <div className={style.learningGoalHeaderLeftSide}>
          {isOpen && (
            <FontAwesome
              icon="angle-up"
              onClick={() => setIsOpen(false)}
              className={style.arrowIcon}
            />
          )}
          {!isOpen && (
            <FontAwesome
              icon="angle-down"
              onClick={() => setIsOpen(true)}
              className={style.arrowIcon}
            />
          )}
          {/*TODO: [DES-321] Label-two styles here*/}
          <span>{learningGoal.learningGoal}</span>
        </div>
        <div className={style.learningGoalHeaderRightSide}>
          {aiEnabled && <AiToken />}
          {/*TODO: Display status of feedback*/}
          {displayUnderstanding === -1 ? (
            canProvideFeedback && aiEnabled ? (
              <BodyThreeText>{i18n.approve()}</BodyThreeText>
            ) : (
              <BodyThreeText>{i18n.evaluate()}</BodyThreeText>
            )
          ) : (
            <BodyThreeText>
              {UNDERSTANDING_LEVEL_STRINGS[understandingLevel.current]}
            </BodyThreeText>
          )}
        </div>
      </summary>
      <div className={style.learningGoalExpanded}>
        <EvidenceLevels
          learningGoalKey={learningGoal.key}
          evidenceLevels={learningGoal.evidenceLevels}
          canProvideFeedback={canProvideFeedback}
          understanding={understandingLevel.current}
          radioButtonCallback={radioButtonCallback}
        />
        {learningGoal.tips && (
          <div>
            <Heading6>{i18n.tipsForEvaluation()}</Heading6>
            <div className={style.learningGoalTips}>
              <SafeMarkdown markdown={learningGoal.tips} />
            </div>
          </div>
        )}
        <div className={style.feedbackArea}>
          <label className={style.evidenceLevelLabel}>
            <span>{i18n.feedback()}</span>
            <textarea
              className={style.inputTextbox}
              name="teacherFeedback"
              value={displayFeedback}
              onChange={handleFeedbackChange}
              disabled={!studentLevelInfo}
            />
          </label>
          {isAutosaving ? (
            <span className={style.autosaveMessage}>{i18n.saving()}</span>
          ) : (
            autosaved && (
              <span className={style.autosaveMessage}>
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
};

const AiToken = () => {
  return (
    <div>
      {' '}
      <BodyFourText className={classnames(style.aiToken, style.aiTokenText)}>
        <ExtraStrongText>
          {i18n.artificialIntelligenceAbbreviation()}
        </ExtraStrongText>

        <FontAwesome icon="check" title={i18n.aiAssessmentEnabled()} />
      </BodyFourText>
    </div>
  );
};
