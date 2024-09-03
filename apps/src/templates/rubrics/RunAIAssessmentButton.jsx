import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {RubricAiEvaluationStatus} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {reportingDataShape, rubricShape} from './rubricShapes';

export const STATUS = {
  // we are waiting for initial status from the server
  INITIAL_LOAD: 'initial_load',
  // the student has not attempted this level
  NOT_ATTEMPTED: 'not_attempted',
  // after initial load, the student has submitted work, but it has already been evaluated
  ALREADY_EVALUATED: 'already_evaluated',
  // the student has work which is ready to evaluate
  READY: 'ready',
  // evaluation queued and ready to run
  EVALUATION_PENDING: 'evaluation_pending',
  // evaluation currently in progress
  EVALUATION_RUNNING: 'evaluation_running',
  // evaluation successfully completed
  SUCCESS: 'success',
  // general evaluation error
  ERROR: 'error',
  // personal identifying info present in code
  PII_ERROR: 'pii_error',
  // profanity present in code
  PROFANITY_ERROR: 'profanity_error',
  // request too large
  REQUEST_TOO_LARGE: 'request_too_large',
  // teacher exceeded limit of evaluations per student project
  TEACHER_LIMIT_EXCEEDED: 'teacher_limit_exceeded',
};

const fetchAiEvaluationStatus = (rubricId, studentUserId) => {
  return fetch(
    `/rubrics/${rubricId}/ai_evaluation_status_for_user?user_id=${studentUserId}`
  );
};

export default function RunAIAssessmentButton({
  canProvideFeedback,
  studentUserId,
  refreshAiEvaluations,
  rubric,
  studentName,
  status,
  setStatus,
  reportingData,
}) {
  const rubricId = rubric.id;
  const [csrfToken, setCsrfToken] = useState('');
  const polling = useMemo(
    () =>
      status === STATUS.EVALUATION_PENDING ||
      status === STATUS.EVALUATION_RUNNING,
    [status]
  );

  const studentButtonText = () => {
    return i18n.runAiAssessment();
  };

  // fetch initial status
  useEffect(() => {
    if (!!rubricId && !!studentUserId) {
      fetchAiEvaluationStatus(rubricId, studentUserId).then(response => {
        if (!response.ok) {
          setStatus(STATUS.ERROR);
        } else {
          response.json().then(data => {
            // we can't fetch the csrf token from the DOM because CSRF protection
            // is disabled on script level pages.
            setCsrfToken(data.csrfToken);
            if (!data.attempted) {
              setStatus(STATUS.NOT_ATTEMPTED);
            } else if (data.lastAttemptEvaluated) {
              setStatus(STATUS.ALREADY_EVALUATED);
            } else if (data.status === RubricAiEvaluationStatus.QUEUED) {
              setStatus(STATUS.EVALUATION_PENDING);
            } else if (data.status === RubricAiEvaluationStatus.RUNNING) {
              setStatus(STATUS.EVALUATION_RUNNING);
            } else if (data.status === RubricAiEvaluationStatus.FAILURE) {
              setStatus(STATUS.ERROR);
            } else if (data.status === RubricAiEvaluationStatus.PII_VIOLATION) {
              setStatus(STATUS.PII_ERROR);
            } else if (
              data.status === RubricAiEvaluationStatus.PROFANITY_VIOLATION
            ) {
              setStatus(STATUS.PROFANITY_ERROR);
            } else if (
              data.status === RubricAiEvaluationStatus.REQUEST_TOO_LARGE
            ) {
              setStatus(STATUS.REQUEST_TOO_LARGE);
            } else if (
              data.status === RubricAiEvaluationStatus.TEACHER_LIMIT_EXCEEDED
            ) {
              setStatus(STATUS.TEACHER_LIMIT_EXCEEDED);
            } else {
              setStatus(STATUS.READY);
            }
          });
        }
      });
    }
  }, [rubricId, studentUserId, setStatus]);

  // poll for status updates
  useEffect(() => {
    if (polling && !!rubricId && !!studentUserId) {
      const intervalId = setInterval(() => {
        fetchAiEvaluationStatus(rubricId, studentUserId).then(response => {
          if (!response.ok) {
            setStatus(STATUS.ERROR);
          } else {
            response.json().then(data => {
              if (
                data.lastAttemptEvaluated &&
                data.status === RubricAiEvaluationStatus.SUCCESS
              ) {
                setStatus(STATUS.SUCCESS);
                refreshAiEvaluations();
              } else if (data.status === RubricAiEvaluationStatus.QUEUED) {
                setStatus(STATUS.EVALUATION_PENDING);
              } else if (data.status === RubricAiEvaluationStatus.RUNNING) {
                setStatus(STATUS.EVALUATION_RUNNING);
              } else if (data.status === RubricAiEvaluationStatus.FAILURE) {
                setStatus(STATUS.ERROR);
              } else if (
                data.status === RubricAiEvaluationStatus.PII_VIOLATION
              ) {
                setStatus(STATUS.PII_ERROR);
              } else if (
                data.status === RubricAiEvaluationStatus.PROFANITY_VIOLATION
              ) {
                setStatus(STATUS.PROFANITY_ERROR);
              } else if (
                data.status === RubricAiEvaluationStatus.REQUEST_TOO_LARGE
              ) {
                setStatus(STATUS.REQUEST_TOO_LARGE);
              } else if (
                data.status === RubricAiEvaluationStatus.TEACHER_LIMIT_EXCEEDED
              ) {
                setStatus(STATUS.TEACHER_LIMIT_EXCEEDED);
              }
            });
          }
        });
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [rubricId, studentUserId, polling, refreshAiEvaluations, setStatus]);

  const handleRunAiAssessment = () => {
    setStatus(STATUS.EVALUATION_PENDING);
    const url = `/rubrics/${rubricId}/run_ai_evaluations_for_user`;
    const params = {user_id: studentUserId};
    const eventName = EVENTS.TA_RUBRIC_INDIVIDUAL_AI_EVAL;
    analyticsReporter.sendEvent(
      eventName,
      {
        ...(reportingData || {}),
        rubricId: rubricId,
        studentId: studentUserId,
      },
      PLATFORMS.BOTH
    );
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(params),
    }).then(response => {
      if (!response.ok) {
        setStatus(STATUS.ERROR);
      }
    });
  };

  return (
    <div>
      {canProvideFeedback && (
        <div>
          <Button
            id="uitest-run-ai-assessment"
            text={studentButtonText()}
            color={Button.ButtonColor.neutralDark}
            onClick={handleRunAiAssessment}
            style={{margin: 0}}
            disabled={status !== STATUS.READY && status !== STATUS.ERROR}
          >
            {polling && <i className="fa fa-spinner fa-spin" />}
          </Button>
        </div>
      )}
    </div>
  );
}

RunAIAssessmentButton.propTypes = {
  canProvideFeedback: PropTypes.bool,
  teacherHasEnabledAi: PropTypes.bool,
  updateTeacherAiSetting: PropTypes.func,
  studentUserId: PropTypes.number,
  refreshAiEvaluations: PropTypes.func,
  rubric: rubricShape.isRequired,
  studentName: PropTypes.string,
  status: PropTypes.string,
  setStatus: PropTypes.func,
  reportingData: reportingDataShape,
};
