import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import i18n from '@cdo/locale';
import {
  BodyThreeText,
  BodyTwoText,
  Heading2,
  Heading5,
} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  reportingDataShape,
  rubricShape,
  studentLevelInfoShape,
} from './rubricShapes';
import LearningGoal from './LearningGoal';
import Button from '@cdo/apps/templates/Button';
import HttpClient from '@cdo/apps/util/HttpClient';
import classnames from 'classnames';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

const formatTimeSpent = timeSpent => {
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  return i18n.timeSpent({minutes, seconds});
};

const formatLastAttempt = lastAttempt => {
  const date = new Date(lastAttempt);
  return i18n.levelLastUpdated({
    lastUpdatedDate: date.toLocaleDateString(),
  });
};

export default function RubricContent({
  studentLevelInfo,
  rubric,
  teacherHasEnabledAi,
  canProvideFeedback,
  onLevelForEvaluation,
  reportingData,
  visible,
}) {
  const {lesson} = rubric;
  const rubricLevel = rubric.level;

  const [aiEvaluation, setAiEvaluations] = useState(null);
  const [isSubmittingToStudent, setIsSubmittingToStudent] = useState(false);
  const [errorSubmitting, setErrorSubmitting] = useState(false);
  const [lastSubmittedTimestamp, setLastSubmittedTimestamp] = useState(false);
  const submitFeedbackToStudent = () => {
    analyticsReporter.sendEvent(EVENTS.TA_RUBRIC_SUBMITTED, {
      ...reportingData,
      studentId: studentLevelInfo.user_id,
    });
    setIsSubmittingToStudent(true);
    setErrorSubmitting(false);
    const body = JSON.stringify({
      student_id: studentLevelInfo.user_id,
    });
    const endPoint = `/rubrics/${rubric.id}/submit_evaluations`;
    HttpClient.post(endPoint, body, true, {'Content-Type': 'application/json'})
      .then(response => response.json())
      .then(json => {
        setIsSubmittingToStudent(false);
        if (!json.submittedAt) {
          throw new Error('Unexpected response object');
        }
        const lastSubmittedDateObj = new Date(json.submittedAt);
        setLastSubmittedTimestamp(lastSubmittedDateObj.toLocaleString());
      })
      .catch(() => {
        setIsSubmittingToStudent(false);
        setErrorSubmitting(true);
      });
  };

  useEffect(() => {
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
  }, [rubric.id, studentLevelInfo, teacherHasEnabledAi]);

  const getAiUnderstanding = learningGoalId => {
    if (!!aiEvaluation) {
      const aiInfo = aiEvaluation.find(
        item => item.learning_goal_id === learningGoalId
      );
      return aiInfo?.understanding;
    } else {
      return null;
    }
  };

  const getAiConfidence = learningGoalId => {
    if (!!aiEvaluation) {
      const aiInfo = aiEvaluation.find(
        item => item.learning_goal_id === learningGoalId
      );
      return aiInfo?.ai_confidence;
    } else {
      return null;
    }
  };

  let infoText = null;
  if (!onLevelForEvaluation) {
    infoText = i18n.rubricCanOnlyBeEvaluatedOnProjectLevelAlert();
  } else if (!studentLevelInfo) {
    infoText = i18n.selectAStudentToEvaluateAlert();
  }
  return (
    <div
      className={classnames(style.rubricContent, {
        [style.visibleRubricContent]: visible,
        [style.hiddenRubricContent]: !visible,
      })}
    >
      {infoText && <InfoAlert text={infoText} />}
      <div>
        {!!studentLevelInfo && (
          <Heading2 className={style.studentName}>
            {studentLevelInfo.name}
          </Heading2>
        )}
        <Heading5>
          {i18n.lessonNumbered({
            lessonNumber: lesson.position,
            lessonName: lesson.name,
          })}
        </Heading5>
        {!!studentLevelInfo && (
          <div className={style.studentInfo}>
            <div className={style.levelAndStudentDetails}>
              {onLevelForEvaluation && (
                <div className={style.studentMetadata}>
                  {studentLevelInfo.timeSpent && (
                    <BodyThreeText className={style.singleMetadatum}>
                      <FontAwesome icon="clock" />
                      <span>{formatTimeSpent(studentLevelInfo.timeSpent)}</span>
                    </BodyThreeText>
                  )}
                  <BodyThreeText className={style.singleMetadatum}>
                    <FontAwesome icon="rocket" />
                    {i18n.numAttempts({
                      numAttempts: studentLevelInfo.attempts || 0,
                    })}
                  </BodyThreeText>
                  {studentLevelInfo.lastAttempt && (
                    <BodyThreeText className={style.singleMetadatum}>
                      <FontAwesome icon="calendar" />
                      <span>
                        {formatLastAttempt(studentLevelInfo.lastAttempt)}
                      </span>
                    </BodyThreeText>
                  )}
                </div>
              )}
              {!onLevelForEvaluation && rubricLevel?.position && (
                <BodyThreeText>
                  {i18n.feedbackAvailableOnLevel({
                    levelPosition: rubricLevel.position,
                  })}
                </BodyThreeText>
              )}
            </div>
          </div>
        )}
      </div>
      <div className={style.learningGoalContainer}>
        {rubric.learningGoals.map(lg => (
          <LearningGoal
            key={lg.key}
            learningGoal={lg}
            teacherHasEnabledAi={teacherHasEnabledAi}
            canProvideFeedback={canProvideFeedback}
            reportingData={reportingData}
            studentLevelInfo={studentLevelInfo}
            aiUnderstanding={getAiUnderstanding(lg.id)}
            aiConfidence={getAiConfidence(lg.id)}
            isStudent={false}
          />
        ))}
      </div>
      {canProvideFeedback && (
        <div className={style.rubricContainerFooter}>
          <div className={style.submitToStudentButtonAndError}>
            <Button
              text={i18n.submitToStudent()}
              color={Button.ButtonColor.brandSecondaryDefault}
              onClick={submitFeedbackToStudent}
              className={style.submitToStudentButton}
              disabled={isSubmittingToStudent}
            />
            {errorSubmitting && (
              <BodyThreeText className={style.errorMessage}>
                {i18n.errorSubmittingFeedback()}
              </BodyThreeText>
            )}
            {!errorSubmitting && !!lastSubmittedTimestamp && (
              <BodyThreeText>
                {i18n.feedbackSubmittedAt({
                  timestamp: lastSubmittedTimestamp,
                })}
              </BodyThreeText>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

RubricContent.propTypes = {
  onLevelForEvaluation: PropTypes.bool,
  canProvideFeedback: PropTypes.bool,
  rubric: rubricShape.isRequired,
  reportingData: reportingDataShape,
  studentLevelInfo: studentLevelInfoShape,
  teacherHasEnabledAi: PropTypes.bool,
  visible: PropTypes.bool,
};

const InfoAlert = ({text}) => {
  return (
    <div className={style.infoAlert}>
      <FontAwesome icon="info-circle" className={style.infoAlertIcon} />
      <BodyTwoText>{text}</BodyTwoText>
    </div>
  );
};

InfoAlert.propTypes = {
  text: PropTypes.string.isRequired,
};
