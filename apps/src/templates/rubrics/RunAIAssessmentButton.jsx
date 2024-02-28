import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {rubricShape} from './rubricShapes';
import Button from '@cdo/apps/templates/Button';
import {RubricAiEvaluationStatus} from '@cdo/apps/util/sharedConstants';

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
    return i18n.runAiAssessment({
      studentName: studentName,
    });
  };

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
            } else {
              setStatus(STATUS.READY);
            }
          });
        }
      });
    }
  }, [rubricId, studentUserId, setStatus]);

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
            className="uitest-run-ai-assessment"
            text={studentButtonText()}
            color={Button.ButtonColor.neutralDark}
            onClick={handleRunAiAssessment}
            style={{margin: 0}}
            disabled={status !== STATUS.READY}
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
};
