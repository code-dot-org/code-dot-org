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

const STATUS = {
  // we are waiting for initial status from the server
  INITIAL_LOAD: 'initial_load',
  // the student has not attempted this level
  NOT_ATTEMPTED: 'not_attempted',
  // after initial load, the student has submitted work, but it has already been evaluated
  ALREADY_EVALUATED: 'already_evaluated',
  // the student has work which is ready to evaluate
  READY: 'ready',
  EVALUATION_PENDING: 'evaluation_pending',
  SUCCESS: 'success',
  ERROR: 'error',
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
}) {
  const [csrfToken, setCsrfToken] = useState('');
  const [status, setStatus] = useState(STATUS.INITIAL_LOAD);
  const polling = useMemo(() => status === STATUS.EVALUATION_PENDING, [status]);

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
      case STATUS.ERROR:
        return i18n.aiEvaluationStatus_error();
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
              if (data.lastAttemptEvaluated) {
                setStatus(STATUS.SUCCESS);
                refreshAiEvaluations();
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
      className={classnames(style.settings, {
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
            text={i18n.runAiAssessment()}
            color={Button.ButtonColor.brandSecondaryDefault}
            onClick={handleRunAiAssessment}
            style={{margin: 0}}
            disabled={status !== STATUS.READY}
          >
            {status === STATUS.EVALUATION_PENDING && (
              <i className="fa fa-spinner fa-spin" />
            )}
          </Button>
          {statusText() && <BodyTwoText>{statusText()}</BodyTwoText>}
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
};
