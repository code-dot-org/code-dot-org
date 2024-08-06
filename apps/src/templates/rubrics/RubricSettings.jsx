import classnames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {CSVLink} from 'react-csv';
import {connect} from 'react-redux';

import Link from '@cdo/apps/componentLibrary/link/Link';
import Toggle from '@cdo/apps/componentLibrary/toggle/Toggle';
import {
  BodyTwoText,
  BodyThreeText,
  Heading3,
  Heading4,
  StrongText,
} from '@cdo/apps/componentLibrary/typography';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import {setAiRubricsDisabled} from '@cdo/apps/templates/currentUserRedux';
import UserPreferences from '@cdo/apps/util/UserPreferences';
import i18n from '@cdo/locale';

import {UNDERSTANDING_LEVEL_STRINGS_V2, TAB_NAMES} from './rubricHelpers';
import {reportingDataShape, rubricShape} from './rubricShapes';
import SectionSelector from './SectionSelector';

import style from './rubrics.module.scss';

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

function RubricSettings({
  visible,
  refreshAiEvaluations,
  rubric,
  sectionId,
  tabSelectCallback,
  reportingData,
  aiRubricsDisabled,
  setAiRubricsDisabled,
}) {
  const rubricId = rubric.id;
  const {lesson} = rubric;
  const [csrfToken, setCsrfToken] = useState('');
  const [statusAll, setStatusAll] = useState(STATUS_ALL.INITIAL_LOAD);
  const [unevaluatedCount, setUnevaluatedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [evaluatedCount, setEvaluatedCount] = useState(0);
  const [displayDetails, setDisplayDetails] = useState(false);
  const [teacherEval, setTeacherEval] = useState(null);
  const [teacherEvalCount, setTeacherEvalCount] = useState(0);
  const polling = statusAll === STATUS_ALL.EVALUATION_PENDING;
  const headers = [
    {label: i18n.studentName(), key: 'user_name'},
    {label: i18n.familyName(), key: 'user_family_name'},
  ].concat(
    ..._.sortBy(rubric.learningGoals, 'id').map(lg => {
      return {label: String(lg.learningGoal), key: String(lg.id)};
    })
  );

  const updateAiRubricsDisabled = () => {
    new UserPreferences().setAiRubricsDisabled(!aiRubricsDisabled);
    setAiRubricsDisabled(!aiRubricsDisabled);
  };

  const fetchAiEvaluationStatusAll = (rubricId, sectionId) => {
    return fetch(
      `/rubrics/${rubricId}/ai_evaluation_status_for_all?section_id=${sectionId}`
    );
  };

  const fetchTeacherEvaluationAll = (rubricId, sectionId) => {
    return fetch(
      `/rubrics/${rubricId}/get_teacher_evaluations_for_all?section_id=${sectionId}`
    );
  };

  const getHeadersSlice = () => {
    return headers.slice(2, headers.length);
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
      case STATUS_ALL.ALREADY_EVALUATED:
        return i18n.aiEvaluationStatusAll_already_evaluated();
      case STATUS_ALL.NOT_ATTEMPTED:
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

  // load initial ai evaluation status
  useEffect(() => {
    const abort = new AbortController();
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
    return () => abort.abort();
  }, [rubricId, sectionId]);

  useEffect(() => {
    const abort = new AbortController();
    if (!!rubricId && !!sectionId) {
      fetchTeacherEvaluationAll(rubricId, sectionId).then(response => {
        if (response.ok) {
          response.json().then(data => {
            var teachEvalArr = [];
            var count = 0;
            data.forEach(student => {
              var teachEvalRow = {
                user_name: student.user_name,
                user_family_name: !!student.user_family_name
                  ? student.user_family_name
                  : '',
              };
              if (student.eval.length > 0) {
                count++;
                student.eval.forEach(e => {
                  teachEvalRow[String(e.learning_goal_id)] =
                    e.understanding !== null
                      ? UNDERSTANDING_LEVEL_STRINGS_V2[e.understanding]
                      : '';
                });
              } else {
                // add dummy values to keep the shape for students
                // with no evaluations
                getHeadersSlice().forEach(h => {
                  teachEvalRow[String(h.key)] = '';
                });
              }
              teachEvalArr.push(teachEvalRow);
            });
            setTeacherEval(teachEvalArr);
            setTeacherEvalCount(count);
          });
        }
      });
    }
    return () => abort.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rubricId, sectionId]);

  // after ai eval is requested, poll for status changes
  useEffect(() => {
    const abort = new AbortController();
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
              setEvaluatedCount(data.lastAttemptEvaluatedCount);
              if (data.attemptedCount === 0) {
                setStatusAll(STATUS_ALL.NOT_ATTEMPTED);
              } else if (data.pendingCount > 0) {
                setStatusAll(STATUS_ALL.EVALUATION_PENDING);
              } else {
                setStatusAll(STATUS_ALL.SUCCESS);
              }
            });
          }
        });
      }, 5000);
      return () => clearInterval(intervalId);
    }
    return () => abort.abort();
  }, [rubricId, polling, sectionId, statusAll, refreshAiEvaluations]);

  const handleRunAiAssessmentAll = () => {
    setStatusAll(STATUS_ALL.EVALUATION_PENDING);
    const url = `/rubrics/${rubricId}/run_ai_evaluations_for_all`;
    const params = {section_id: sectionId};
    const eventName = EVENTS.TA_RUBRIC_SECTION_AI_EVAL;
    analyticsReporter.sendEvent(
      eventName,
      {
        ...(reportingData || {}),
        rubricId: rubricId,
        sectionId: sectionId,
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
        setStatusAll(STATUS_ALL.ERROR);
      }
    });
  };

  const onClickSwitchTab = () => {
    tabSelectCallback(TAB_NAMES.RUBRIC);
  };

  const onClickDownloadCSV = () => {
    analyticsReporter.sendEvent(EVENTS.TA_RUBRIC_CSV_DOWNLOADED, {
      ...(reportingData || {}),
      sectionId: sectionId,
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
        <Heading3>
          {i18n.lessonNumbered({
            lessonNumber: lesson.position,
            lessonName: lesson.name,
          })}
        </Heading3>
        <div className={style.selectors}>
          <SectionSelector reloadOnChange={true} />
        </div>
      </div>

      <div className={style.settingsContent}>
        <div className={style.settingsGroup}>
          <Heading4>{i18n.aiAssessment()}</Heading4>
          <div className={style.settingsContainers}>
            <div className={style.runAiAllStatuses}>
              <BodyTwoText>
                <StrongText>{summaryText()}</StrongText>
              </BodyTwoText>
              {statusAllText() && (
                <BodyTwoText className="uitest-eval-status-all-text">
                  {statusAllText()}
                </BodyTwoText>
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

        <div className={style.settingsGroup}>
          <Heading4>{i18n.rubricSummaryClassScore()}</Heading4>
          <div className={style.settingsContainers}>
            <div className={style.runAiAllStatuses}>
              {teacherEvalCount === 0 && (
                <BodyTwoText>{i18n.rubricNoStudentEvals()}</BodyTwoText>
              )}
              {teacherEvalCount > 0 && (
                <BodyTwoText>
                  {i18n.rubricNumberStudentEvals({
                    teacherEvalCount: teacherEvalCount,
                  })}
                </BodyTwoText>
              )}
            </div>
            {teacherEvalCount === 0 && (
              <Button
                className="uitest-rubric-switch-content-tab"
                text={i18n.rubricTabStudent()}
                color={Button.ButtonColor.brandSecondaryDefault}
                onClick={onClickSwitchTab}
                style={{margin: 0}}
              />
            )}
            {!!teacherEval && teacherEvalCount > 0 && (
              <CSVLink
                headers={headers}
                data={teacherEval}
                filename={`lesson_${rubric.lesson.position}_student_scores.csv`}
              >
                <Button
                  className="uitest-rubric-download-csv"
                  text={i18n.downloadCSV()}
                  color={Button.ButtonColor.brandSecondaryDefault}
                  onClick={onClickDownloadCSV}
                  style={{margin: 0}}
                />
              </CSVLink>
            )}
          </div>
        </div>

        <div className={style.settingsGroup}>
          <Heading4>{i18n.aiSettings()}</Heading4>
          <div
            className={classnames(
              'uitest-rubric-ai-enable',
              style.settingsContainers,
              style.aiSettingsContainer
            )}
          >
            <BodyThreeText>
              <StrongText>{i18n.useAiFeaturesOnCodeOrg()}</StrongText>
            </BodyThreeText>
            <Toggle
              label={i18n.useAiFeatures()}
              checked={!aiRubricsDisabled}
              onChange={updateAiRubricsDisabled}
              size="s"
            />
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
  tabSelectCallback: PropTypes.func,
  reportingData: reportingDataShape,
  aiRubricsDisabled: PropTypes.bool,
  setAiRubricsDisabled: PropTypes.func.isRequired,
};

export const UnconnectedRubricSettings = RubricSettings;

export default connect(
  state => ({
    aiRubricsDisabled: state.currentUser.aiRubricsDisabled,
  }),
  dispatch => ({
    setAiRubricsDisabled: aiRubricsDisabled =>
      dispatch(setAiRubricsDisabled(aiRubricsDisabled)),
  })
)(RubricSettings);
