import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import classnames from 'classnames';
import i18n from '@cdo/locale';
import {
  BodyTwoText,
  Heading2,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/templates/Button';
import {RubricAiEvaluationStatus} from '@cdo/apps/util/sharedConstants';
import {queryParams} from '@cdo/apps/code-studio/utils';

const STATUS = {
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

const STATUS_ALL = {
  // we are waiting for initial status from the server
  INITIAL_LOAD: 'initial_load',
  // at least one student has work which is ready to evaluate
  READY: 'ready',
  EVALUATION_PENDING: 'evaluation_pending',
  // at least one student's work was evaluated
  SUCCESS: 'success',
  // no students have attempted this level
  NOT_ATTEMPTED: 'not_attempted',
  // all attempted work has already been evaluated
  ALREADY_EVALUATED: 'already_evaluated',
  ERROR: 'error',
};

const fetchAiEvaluationStatus = (rubricId, studentUserId) => {
  return fetch(
    `/rubrics/${rubricId}/ai_evaluation_status_for_user?user_id=${studentUserId}`
  );
};

const fetchAiEvaluationStatusAll = (rubricId, sectionId) => {
  return fetch(
    `/rubrics/${rubricId}/ai_evaluation_status_for_all?section_id=${sectionId}`
  );
};

export default function RubricSettings({
  canProvideFeedback,
  rubricId,
  studentUserId,
  visible,
  refreshAiEvaluations,
  studentName,
}) {
  const [csrfToken, setCsrfToken] = useState('');
  const [status, setStatus] = useState(STATUS.INITIAL_LOAD);
  const polling = useMemo(
    () =>
      status === STATUS.EVALUATION_PENDING ||
      status === STATUS.EVALUATION_RUNNING,
    [status]
  );
  const [statusAll, setStatusAll] = useState(STATUS_ALL.INITIAL_LOAD);
  const [unevaluatedCount, setUnevaluatedCount] = useState(0);
  const sectionId = queryParams('section_id');
  // console.log(`SECTION ID: ${sectionId}`);

  const statusText = () => {
    switch (status) {
      case STATUS.INITIAL_LOAD:
        return i18n.aiEvaluationStatus_initial_load();
      case STATUS.NOT_ATTEMPTED:
        return i18n.aiEvaluationStatus_not_attempted();
      case STATUS.ALREADY_EVALUATED:
        return i18n.aiEvaluationStatus_already_evaluated();
      case STATUS.READY:
        return null;
      case STATUS.SUCCESS:
        return i18n.aiEvaluationStatus_success();
      case STATUS.EVALUATION_PENDING:
        return i18n.aiEvaluationStatus_pending();
      case STATUS.EVALUATION_RUNNING:
        return i18n.aiEvaluationStatus_in_progress();
      case STATUS.ERROR:
        return i18n.aiEvaluationStatus_error();
      case STATUS.PII_ERROR:
        return i18n.aiEvaluationStatus_pii_error();
      case STATUS.PROFANITY_ERROR:
        return i18n.aiEvaluationStatus_profanity_error();
    }
  };

  const statusAllText = () => {
    switch (statusAll) {
      case STATUS_ALL.INITIAL_LOAD:
        return i18n.aiEvaluationStatus_initial_load();
      case STATUS_ALL.READY:
        return i18n.aiEvaluationStatusAll_ready({
          unevaluatedCount: unevaluatedCount,
        });
      case STATUS_ALL.SUCCESS:
        return i18n.aiEvaluationStatus_success();
      case STATUS_ALL.EVALUATION_PENDING:
        return i18n.aiEvaluationStatus_pending();
      case STATUS_ALL.ERROR:
        return i18n.aiEvaluationStatus_error();
      case STATUS.ALREADY_EVALUATED:
        return i18n.aiEvaluationStatusAll_already_evaluated();
      case STATUS.NOT_ATTEMPTED:
        return i18n.aiEvaluationStatusAll_not_attempted();
    }
  };

  const studentButtonText = () => {
    return i18n.runAiAssessment({
      studentName: studentName,
    });
  };

  useEffect(() => {
    if (!!rubricId && !!studentUserId && !!sectionId) {
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
      fetchAiEvaluationStatusAll(rubricId, sectionId).then(response => {
        if (!response.ok) {
          setStatusAll(STATUS_ALL.ERROR);
        } else {
          response.json().then(data => {
            // we can't fetch the csrf token from the DOM because CSRF protection
            // is disabled on script level pages.
            setCsrfToken(data.csrfToken);
            setUnevaluatedCount(data.attemptedUnevaluatedCount);
            if (data.attemptedCount === 0) {
              setStatusAll(STATUS_ALL.NOT_ATTEMPTED);
            } else if (data.attemptedUnevaluatedCount === 0) {
              setStatusAll(STATUS_ALL.ALREADY_EVALUATED);
            } else {
              setStatusAll(STATUS_ALL.READY);
            }
          });
        }
      });
    }
  }, [rubricId, studentUserId, sectionId]);

  useEffect(() => {
    if (polling && !!rubricId && !!studentUserId && !!sectionId) {
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
        fetchAiEvaluationStatusAll(rubricId, sectionId).then(response => {
          if (!response.ok) {
            setStatusAll(STATUS_ALL.ERROR);
          } else {
            response.json().then(data => {
              // we can't fetch the csrf token from the DOM because CSRF protection
              // is disabled on script level pages.
              setCsrfToken(data.csrfToken);
              setUnevaluatedCount(data.attemptedUnevaluatedCount);
              if (data.attemptedCount === 0) {
                setStatusAll(STATUS_ALL.NOT_ATTEMPTED);
              } else if (data.attemptedUnevaluatedCount === 0) {
                setStatusAll(STATUS_ALL.ALREADY_EVALUATED);
              } else {
                setStatusAll(STATUS_ALL.READY);
              }
            });
          }
        });
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [rubricId, studentUserId, polling, sectionId, refreshAiEvaluations]);

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

  const handleRunAiAssessmentAll = () => {
    //TODO: create function in rubrics_controller to run all unsubmitted
    setStatusAll(STATUS_ALL.EVALUATION_PENDING);
    const url = `/rubrics/${rubricId}/run_ai_evaluations_for_all`;
    const params = {section_id: sectionId};
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(params),
    }).then(response => {
      if (!response.ok) {
        setStatus(STATUS_ALL.ERROR);
      }
    });
  };

  return (
    <div
      className={classnames('uitest-rubric-settings', style.settings, {
        [style.settingsVisible]: visible,
        [style.settingsHidden]: !visible,
      })}
    >
      <Heading2>{i18n.settings()}</Heading2>
      {canProvideFeedback && (
        <div className={style.aiAssessmentOptions}>
          <div>
            <BodyTwoText>
              <StrongText>{i18n.aiAssessment()}</StrongText>
            </BodyTwoText>
            <BodyTwoText>{i18n.runAiAssessmentDescription()}</BodyTwoText>
          </div>
          <Button
            className="uitest-run-ai-assessment"
            text={studentButtonText()}
            color={Button.ButtonColor.brandSecondaryDefault}
            onClick={handleRunAiAssessment}
            style={{margin: 0}}
            disabled={status !== STATUS.READY}
          >
            {polling && <i className="fa fa-spinner fa-spin" />}
          </Button>
          {statusText() && <BodyTwoText>{statusText()}</BodyTwoText>}

          <div>
            <BodyTwoText>
              <StrongText>{i18n.aiAssessmentAll()}</StrongText>
            </BodyTwoText>
            <BodyTwoText>{i18n.runAiAssessmentDescriptionAll()}</BodyTwoText>
          </div>
          <Button
            text={i18n.runAiAssessmentAll()}
            color={Button.ButtonColor.brandSecondaryDefault}
            onClick={handleRunAiAssessmentAll}
            style={{margin: 0}}
            disabled={statusAll !== STATUS_ALL.READY}
          >
            {statusAll === STATUS_ALL.EVALUATION_PENDING && (
              <i className="fa fa-spinner fa-spin" />
            )}
          </Button>
          {statusAllText() && <BodyTwoText>{statusAllText()}</BodyTwoText>}
        </div>
      )}
    </div>
  );
}

RubricSettings.propTypes = {
  canProvideFeedback: PropTypes.bool,
  teacherHasEnabledAi: PropTypes.bool,
  updateTeacherAiSetting: PropTypes.func,
  rubricId: PropTypes.number,
  studentUserId: PropTypes.number,
  visible: PropTypes.bool,
  refreshAiEvaluations: PropTypes.func,
  studentName: PropTypes.string,
};
