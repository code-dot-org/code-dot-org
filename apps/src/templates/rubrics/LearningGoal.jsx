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

export default function LearningGoal({
  learningGoal,
  teacherHasEnabledAi,
  canProvideFeedback,
  reportingData,
  studentLevelInfo,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [autosaved, setAutosaved] = useState(false);
  const [errorAutosaving, setErrorAutosaving] = useState(false);
  const [learningGoalEval, setLearningGoalEval] = useState(null);
  const [understanding, setUnderstanding] = useState(null);

  const aiEnabled = learningGoal.aiEnabled && teacherHasEnabledAi;
  const base_endpoint = '/learning_goal_evaluations';

  // Timer variabls for autosaving
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
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }
    setTeacherFeedback(event.target.value);
    autosaveTimer.current = setTimeout(autosaveFeedback, saveAfter);
  };

  const autosaveFeedback = () => {
    console.log('autosaving');
    setAutosaved(false);
    setIsAutosaving(true);
    setErrorAutosaving(false);
    const bodyData = JSON.stringify({
      studentId: studentLevelInfo.user_id,
      learningGoalId: learningGoal.id,
      feedback: teacherFeedback,
      understanding: understanding,
    });
    fetch('/get_token').then(response => {
      fetch(`${base_endpoint}/${learningGoalEval.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': response.headers.get('csrf-token'),
        },
        body: bodyData,
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
    });
    clearTimeout(autosaveTimer.current);
  };

  const getOrInitializeLearningGoalEvaluation = () => {
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
        if (!json.feedback) {
          setTeacherFeedback('');
        } else {
          setTeacherFeedback(json.feedback);
        }
        if (json.understanding) {
          setUnderstanding(json.understanding);
        }
      })
      .catch(error => console.log(error));
  };

  useEffect(() => {
    getOrInitializeLearningGoalEvaluation();
  }, []);

  // Callback to retrieve understanding data from EvidenceLevels
  const radioButtonCallback = radioButtonData => {
    setUnderstanding(radioButtonData);
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
          {canProvideFeedback && <BodyThreeText>Needs approval</BodyThreeText>}
        </div>
      </summary>
      <div className={style.learningGoalExpanded}>
        <EvidenceLevels
          learningGoalKey={learningGoal.key}
          evidenceLevels={learningGoal.evidenceLevels}
          canProvideFeedback={canProvideFeedback}
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
        <div>
          <label className={style.teacherFeedbackLabel}>
            <span>Teacher Feedback</span>
            <textarea
              className={style.inputTextbox}
              name="teacherFeedback"
              value={teacherFeedback}
              onChange={handleFeedbackChange}
            />
          </label>
          {isAutosaving ? (
            <span className={style.autosaveMessage}>Autosaving...</span>
          ) : (
            autosaved && (
              <span className={style.autosaveMessage}>
                Autosaved {learningGoalEval.updated_at}
              </span>
            )
          )}
          {errorAutosaving && (
            <span className={style.autosaveMessage}>
              There was an error autosaving your feedback
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
