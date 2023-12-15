import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import classnames from 'classnames';
import i18n from '@cdo/locale';
import {
  BodyTwoText,
  Heading2,
  Heading5,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import {rubricShape} from './rubricShapes';
import Button from '@cdo/apps/templates/Button';
import {RubricAiEvaluationStatus} from '@cdo/apps/util/sharedConstants';
import SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';
import experiments from '@cdo/apps/util/experiments';

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

const fetchAiEvaluationStatus = (rubricId, studentUserId) => {
  return fetch(
    `/rubrics/${rubricId}/ai_evaluation_status_for_user?user_id=${studentUserId}`
  );
};

export default function RubricSettings({
  canProvideFeedback,
  rubricId,
  studentUserId,
  visible,
  refreshAiEvaluations,
  rubric,
}) {
  const {lesson} = rubric;
  const [csrfToken, setCsrfToken] = useState('');
  const [status, setStatus] = useState(STATUS.INITIAL_LOAD);
  const polling = useMemo(
    () =>
      status === STATUS.EVALUATION_PENDING ||
      status === STATUS.EVALUATION_RUNNING,
    [status]
  );

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

  useEffect(() => {
    if (!!rubricId && !!studentUserId) {
      fetchAiEvaluationStatus(rubricId, studentUserId).then(response => {
        if (!response.ok) {
          setStatus(STATUS.ERROR);
        } else {
          response.json().then(data => {
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
              // we can't fetch the csrf token from the DOM because CSRF protection
              // is disabled on script level pages.
              setCsrfToken(data.csrfToken);
              setStatus(STATUS.READY);
            }
          });
        }
      });
    }
  }, [rubricId, studentUserId]);

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
  }, [rubricId, studentUserId, polling, refreshAiEvaluations]);

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
    <div
      className={classnames('uitest-rubric-settings', style.settings, {
        [style.settingsVisible]: visible,
        [style.settingsHidden]: !visible,
      })}
    >
      {!experiments.isEnabled('ai-rubrics-redesign') && (
        <Heading2>{i18n.settings()}</Heading2>
      )}
      {experiments.isEnabled('ai-rubrics-redesign') && (
        <div className={style.studentInfoGroup}>
          <Heading5>
            {i18n.lessonNumbered({
              lessonNumber: lesson.position,
              lessonName: lesson.name,
            })}
          </Heading5>
          <div className={style.selectors}>
            <SectionSelector reloadOnChange={true} requireSelection={false} />
          </div>
        </div>
      )}
      {canProvideFeedback && (
        <div className={style.aiAssessmentOptions}>
          {/* {experiments.isEnabled('ai-rubrics-redesign') && (
            <div className={style.selectors}>
              <SectionSelector reloadOnChange={true} requireSelection={false} />
            </div>
          )} */}
          <div>
            <BodyTwoText>
              <StrongText>{i18n.aiAssessment()}</StrongText>
            </BodyTwoText>
            <BodyTwoText>{i18n.runAiAssessmentDescription()}</BodyTwoText>
          </div>
          <Button
            className="uitest-run-ai-assessment"
            text={i18n.runAiAssessment()}
            color={Button.ButtonColor.brandSecondaryDefault}
            onClick={handleRunAiAssessment}
            style={{margin: 0}}
            disabled={status !== STATUS.READY}
          >
            {polling && <i className="fa fa-spinner fa-spin" />}
          </Button>
          {statusText() && (
            <BodyTwoText className="uitest-eval-status-text">
              {statusText()}
            </BodyTwoText>
          )}
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
  rubric: rubricShape.isRequired,
};
