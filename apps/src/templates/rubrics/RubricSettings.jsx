import React, {useEffect, useState} from 'react';
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
import SectionSelector from '@cdo/apps/code-studio/components/progress/SectionSelector';
import Link from '@cdo/apps/componentLibrary/link/Link';

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

const fetchAiEvaluationStatusAll = (rubricId, sectionId) => {
  return fetch(
    `/rubrics/${rubricId}/ai_evaluation_status_for_all?section_id=${sectionId}`
  );
};

export default function RubricSettings({
  visible,
  refreshAiEvaluations,
  rubric,
  sectionId,
}) {
  const rubricId = rubric.id;
  const {lesson} = rubric;
  const [csrfToken, setCsrfToken] = useState('');
  const [statusAll, setStatusAll] = useState(STATUS_ALL.INITIAL_LOAD);
  const [unevaluatedCount, setUnevaluatedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [evaluatedCount, setEvaluatedCount] = useState(0);
  const [displayDetails, setDisplayDetails] = useState(false);
  const polling = statusAll === STATUS_ALL.EVALUATION_PENDING;
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

  const summaryText = () => {
    return i18n.aiEvaluationStatusAll_summary({
      evaluatedCount: evaluatedCount,
      totalCount: totalCount,
    });
  };

  const showHideDetails = () => {
    setDisplayDetails(!displayDetails);
  };

  useEffect(() => {
    if (!!rubricId && !!sectionId) {
      fetchAiEvaluationStatusAll(rubricId, sectionId).then(response => {
        if (!response.ok) {
          setStatusAll(STATUS_ALL.ERROR);
        } else {
          response.json().then(data => {
            // we can't fetch the csrf token from the DOM because CSRF protection
            // is disabled on script level pages.
            setCsrfToken(data.csrfToken);
            setUnevaluatedCount(data.attemptedUnevaluatedCount);
            setTotalCount(data.attemptedCount + data.notAttemptedCount);
            setEvaluatedCount(data.lastAttemptEvaluatedCount);
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
  }, [rubricId, sectionId]);

  useEffect(() => {
    if (polling && !!rubricId && !!sectionId) {
      const intervalId = setInterval(() => {
        refreshAiEvaluations();
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
                setStatusAll(STATUS_ALL.SUCCESS);
              } else {
                setStatusAll(STATUS_ALL.READY);
              }
            });
          }
        });
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [rubricId, polling, sectionId, statusAll, refreshAiEvaluations]);

  const handleRunAiAssessmentAll = () => {
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
        setStatusAll(STATUS_ALL.ERROR);
      }
    });
  };

  return (
    <div
      className={classnames('uitest-rubric-settings', {
        [style.settingsVisible]: visible,
        [style.settingsHidden]: !visible,
      })}
    >
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

      <div className={style.settingsGroup}>
        <Heading2>{i18n.aiAssessment()}</Heading2>
        <div className={style.settingsContainers}>
          <div className={style.runAiAllStatuses}>
            <BodyTwoText className="uitest-eval-status-all-text">
              <StrongText>{summaryText()}</StrongText>
            </BodyTwoText>
            {statusAllText() && (
              <BodyTwoText>{statusAllText() || ''}</BodyTwoText>
            )}
          </div>
          <Button
            className="uitest-run-ai-assessment-all"
            text={i18n.runAiAssessmentClass()}
            color={Button.ButtonColor.brandSecondaryDefault}
            onClick={handleRunAiAssessmentAll}
            style={{margin: 0}}
            disabled={statusAll !== STATUS_ALL.READY}
          >
            {statusAll === STATUS_ALL.EVALUATION_PENDING && (
              <i className="fa fa-spinner fa-spin" />
            )}
          </Button>
          <div className={style.detailsGroup}>
            <BodyTwoText
              className={
                displayDetails ? style.detailsVisible : style.detailsHidden
              }
            >
              {i18n.aiEvaluationDetails()}
            </BodyTwoText>
            <Link onClick={showHideDetails}>
              {displayDetails ? i18n.hideDetails() : i18n.showDetails()}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

RubricSettings.propTypes = {
  teacherHasEnabledAi: PropTypes.bool,
  updateTeacherAiSetting: PropTypes.func,
  visible: PropTypes.bool,
  refreshAiEvaluations: PropTypes.func,
  rubric: rubricShape.isRequired,
  sectionId: PropTypes.number,
};
