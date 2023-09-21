import React, {useState} from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import i18n from '@cdo/locale';
import {
  BodyThreeText,
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
import Button from '../Button';
import HttpClient from '@cdo/apps/util/HttpClient';

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
  reportingData,
}) {
  const {lesson} = rubric;
  const rubricLevel = rubric.level;

  const [isSubmittingToStudent, setIsSubmittingToStudent] = useState(false);
  const [errorSubmitting, setErrorSubmitting] = useState(false);
  const [lastSubmittedTimestamp, setLastSubmittedTimestamp] = useState(false);
  const submitFeedbackToStudent = () => {
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

  return (
    <div className={style.rubricContent}>
      {!!studentLevelInfo && (
        <div className={style.studentInfo}>
          <Heading2>{studentLevelInfo.name}</Heading2>
          <div className={style.levelAndStudentDetails}>
            <Heading5>
              {i18n.lessonNumbered({
                lessonNumber: lesson.position,
                lessonName: lesson.name,
              })}
            </Heading5>
            {canProvideFeedback && (
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
            {!canProvideFeedback && rubricLevel?.position && (
              <BodyThreeText>
                {i18n.feedbackAvailableOnLevel({
                  levelPosition: rubricLevel.position,
                })}
              </BodyThreeText>
            )}
          </div>
        </div>
      )}
      <div className={style.learningGoalContainer}>
        {rubric.learningGoals.map(lg => (
          <LearningGoal
            key={lg.key}
            learningGoal={lg}
            teacherHasEnabledAi={teacherHasEnabledAi}
            canProvideFeedback={canProvideFeedback}
            reportingData={reportingData}
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
  canProvideFeedback: PropTypes.bool,
  rubric: rubricShape.isRequired,
  reportingData: reportingDataShape,
  studentLevelInfo: studentLevelInfoShape,
  teacherHasEnabledAi: PropTypes.bool,
};
