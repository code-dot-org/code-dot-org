import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';

import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import {BodyFourText} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {updateTeacherFeedback} from '@cdo/apps/templates/instructions/teacherFeedback/teacherFeedbackDataApi';
import {getTeacherFeedbackForStudent} from '@cdo/apps/templates/instructions/topInstructionsDataApi';
import HttpClient from '@cdo/apps/util/HttpClient';
import i18n from '@cdo/locale';

import {
  reportingDataShape,
  rubricShape,
  studentLevelInfoShape,
} from './rubricShapes';

import style from './rubrics.module.scss';

function RubricSubmitFooter({
  rubric,
  reportingData,
  studentLevelInfo,
  open,
  feedbackAdded,
  setFeedbackAdded,

  // redux
  teacherId,
}) {
  const [feedbackLoaded, setFeedbackLoaded] = useState(false);
  const [isSubmittingToStudent, setIsSubmittingToStudent] = useState(false);
  const [errorSubmitting, setErrorSubmitting] = useState(false);
  const [lastSubmittedTimestamp, setLastSubmittedTimestamp] = useState(false);
  const [keepWorking, setKeepWorking] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  // When the rubric opens, we should get the current feedback, if any
  useEffect(() => {
    if (open && studentLevelInfo) {
      // Get the teacher feedback
      const studentId = studentLevelInfo.user_id;
      const levelId = rubric.level.id;
      const scriptId = rubric.script.id;

      getTeacherFeedbackForStudent(studentId, levelId, scriptId).done(
        (data, _, request) => {
          // Get the token for the future submission
          setCsrfToken(request.getResponseHeader('csrf-token'));

          // It returns all feedback records, we can just get the first one
          const json = data[0];
          if (json) {
            setKeepWorking(json.review_state === 'keepWorking');
            const lastSubmittedDateObj = new Date(json.created_at);
            setLastSubmittedTimestamp(lastSubmittedDateObj.toLocaleString());
          }

          setFeedbackLoaded(true);
        }
      );
    }
  }, [
    open,
    teacherId,
    rubric.id,
    rubric.level.id,
    rubric.script.id,
    studentLevelInfo,
  ]);

  // The first stage of submission is the progress state submission
  // via the teacher_feedbacks API
  const submitFeedbackToStudent = () => {
    analyticsReporter.sendEvent(EVENTS.TA_RUBRIC_SUBMITTED, {
      ...reportingData,
      studentId: studentLevelInfo.user_id,
    });
    setIsSubmittingToStudent(true);
    setErrorSubmitting(false);

    // Submit 'feedback' record
    const studentId = studentLevelInfo.user_id;
    const levelId = rubric.level.id;
    const scriptId = rubric.script.id;

    const payload = {
      comment: '',
      review_state: keepWorking ? 'keepWorking' : null,
      student_id: studentId,
      script_id: scriptId,
      level_id: levelId,
      teacher_id: teacherId,
    };

    // Submit the teacher feedback and then submit the rubric feedback
    updateTeacherFeedback(payload, csrfToken)
      .done(submitFeedbackToEndpoint)
      .fail(() => {
        setIsSubmittingToStudent(false);
        setErrorSubmitting(true);
      });
  };

  // The second stage of submission is the feedback submission
  // via the rubrics API
  const submitFeedbackToEndpoint = () => {
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
      })
      .catch(() => {
        setIsSubmittingToStudent(false);
        setErrorSubmitting(true);
      });
  };

  return (
    <div className={style.rubricFooter}>
      <div className={style.rubricFooterContent}>
        <Checkbox
          label={i18n.aiSubmitShouldKeepWorking()}
          size="xs"
          name="keepWorking"
          onChange={() => {
            setKeepWorking(!keepWorking);
          }}
          disabled={!feedbackLoaded}
          checked={keepWorking}
        />
      </div>
      <div className={style.submitToStudentButtonAndError}>
        <Button
          id="ui-submitFeedbackButton"
          text={i18n.submitToStudent()}
          color={Button.ButtonColor.brandSecondaryDefault}
          onClick={submitFeedbackToStudent}
          className={style.submitToStudentButton}
          disabled={isSubmittingToStudent || !feedbackLoaded}
        />
        {errorSubmitting && (
          <div id="ui-feedback-submitted-error">
            <BodyFourText className={style.errorMessage}>
              {i18n.errorSubmittingFeedback()}
            </BodyFourText>
          </div>
        )}
        {!errorSubmitting && (
          <div id="ui-feedback-submitted-timestamp">
            <BodyFourText>
              {!!lastSubmittedTimestamp &&
                i18n.feedbackSubmittedAt({
                  timestamp: lastSubmittedTimestamp,
                })}
            </BodyFourText>
          </div>
        )}
      </div>
    </div>
  );
}

export const UnconnectedRubricSubmitFooter = RubricSubmitFooter;

RubricSubmitFooter.propTypes = {
  rubric: rubricShape,
  reportingData: reportingDataShape,
  studentLevelInfo: studentLevelInfoShape,
  open: PropTypes.bool,
  feedbackAdded: PropTypes.bool,
  setFeedbackAdded: PropTypes.func,
  teacherId: PropTypes.number,
};

export default connect(state => ({
  teacherId: state.currentUser.userId,
}))(RubricSubmitFooter);
