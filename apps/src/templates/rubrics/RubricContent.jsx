import React, {useState} from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import i18n from '@cdo/locale';
import {
  BodyThreeText,
  BodyTwoText,
  Heading5,
} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  aiEvaluationShape,
  reportingDataShape,
  rubricShape,
  studentLevelInfoShape,
} from './rubricShapes';
import LearningGoals from './LearningGoals';
import Button from '@cdo/apps/templates/Button';
import HttpClient from '@cdo/apps/util/HttpClient';
import classnames from 'classnames';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import StudentSelector from './StudentSelector';
import SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';

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
  open,
  teacherHasEnabledAi,
  canProvideFeedback,
  onLevelForEvaluation,
  reportingData,
  visible,
  aiEvaluations,
}) {
  const {lesson} = rubric;
  const rubricLevel = rubric.level;

  const [isSubmittingToStudent, setIsSubmittingToStudent] = useState(false);
  const [errorSubmitting, setErrorSubmitting] = useState(false);
  const [lastSubmittedTimestamp, setLastSubmittedTimestamp] = useState(false);
  const [feedbackAdded, setFeedbackAdded] = useState(false);
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
    if (feedbackAdded) {
      analyticsReporter.sendEvent(
        EVENTS.TA_RUBRIC_SUBMITTEED_WRITTEN_FEEDBACK,
        {
          ...reportingData,
          studentId: studentLevelInfo.user_id,
        }
      );
      setFeedbackAdded(false);
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
      id="uitest-rubric-content"
      className={classnames({
        [style.visibleRubricContent]: visible,
        [style.hiddenRubricContent]: !visible,
      })}
    >
      {infoText && <InfoAlert text={infoText} />}
      <div className={style.studentInfoGroup}>
        <Heading5>
          {i18n.lessonNumbered({
            lessonNumber: lesson.position,
            lessonName: lesson.name,
          })}
        </Heading5>

        <div className={style.selectors}>
          <SectionSelector reloadOnChange={true} requireSelection={false} />
          <StudentSelector
            styleName={style.studentSelector}
            selectedUserId={studentLevelInfo ? studentLevelInfo.user_id : null}
            reloadOnChange={true}
          />
        </div>

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
      <div className={style.learningGoalsWrapper}>
        <Heading5>{i18n.rubric()}</Heading5>
        <LearningGoals
          open={open}
          learningGoals={rubric.learningGoals}
          teacherHasEnabledAi={teacherHasEnabledAi}
          canProvideFeedback={canProvideFeedback}
          reportingData={reportingData}
          studentLevelInfo={studentLevelInfo}
          isStudent={false}
          feedbackAdded={feedbackAdded}
          setFeedbackAdded={setFeedbackAdded}
          aiEvaluations={aiEvaluations}
        />
      </div>
      {canProvideFeedback && (
        <div className={style.rubricContainerFooter}>
          <div className={style.submitToStudentButtonAndError}>
            <Button
              id="ui-submitFeedbackButton"
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
              <div id="ui-feedback-submitted-timestamp">
                <BodyThreeText>
                  {i18n.feedbackSubmittedAt({
                    timestamp: lastSubmittedTimestamp,
                  })}
                </BodyThreeText>
              </div>
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
  open: PropTypes.bool,
  reportingData: reportingDataShape,
  studentLevelInfo: studentLevelInfoShape,
  teacherHasEnabledAi: PropTypes.bool,
  visible: PropTypes.bool,
  aiEvaluations: PropTypes.arrayOf(aiEvaluationShape),
};

export const InfoAlert = ({text, dismissable}) => {
  const [closed, setClosed] = useState(false);
  const closeButtonCallback = () => {
    setClosed(true);
  };

  return (
    <div
      className={classnames('uitest-info-alert', {
        [style.infoAlert]: !closed,
        [style.infoAlertClosed]: !!closed,
      })}
    >
      <div className={style.infoAlertLeft}>
        <FontAwesome icon="info-circle" className={style.infoAlertIcon} />
        <BodyTwoText>{text}</BodyTwoText>
      </div>
      {!!dismissable && (
        <button
          type="button"
          onClick={closeButtonCallback}
          className={classnames('close', style.infoAlertRight)}
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
};

InfoAlert.propTypes = {
  text: PropTypes.string.isRequired,
  dismissable: PropTypes.bool,
};
