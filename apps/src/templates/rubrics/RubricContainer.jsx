import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import style from './rubrics.module.scss';
import i18n from '@cdo/locale';
import classnames from 'classnames';
import {BodyFourText, Heading6} from '@cdo/apps/componentLibrary/typography';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  reportingDataShape,
  rubricShape,
  studentLevelInfoShape,
} from './rubricShapes';
import RubricContent from './RubricContent';
import RubricSettings from './RubricSettings';
import RubricTabButtons from './RubricTabButtons';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';
import i18n from '@cdo/locale';
import Draggable from 'react-draggable';

import HttpClient from '@cdo/apps/util/HttpClient';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import Button from '@cdo/apps/templates/Button';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';

const TAB_NAMES = {
  RUBRIC: 'rubric',
  SETTINGS: 'settings',
};

export default function RubricContainer({
  rubric,
  studentLevelInfo,
  teacherHasEnabledAi,
  currentLevelName,
  reportingData,
  open,
  closeRubric,
  sectionId,
}) {
  const onLevelForEvaluation = currentLevelName === rubric.level.name;
  const canProvideFeedback = !!studentLevelInfo && onLevelForEvaluation;
  const rubricTabSessionKey = 'rubricFABTabSessionKey';

  const [selectedTab, setSelectedTab] = useState(
    tryGetSessionStorage(rubricTabSessionKey, TAB_NAMES.RUBRIC) ||
      TAB_NAMES.RUBRIC
  );
  const [aiEvaluations, setAiEvaluations] = useState(null);

  // TODO move to separate footer component
  const [isSubmittingToStudent, setIsSubmittingToStudent] = useState(false);
  const [errorSubmitting, setErrorSubmitting] = useState(false);
  const [lastSubmittedTimestamp, setLastSubmittedTimestamp] = useState(false);
  const [feedbackAdded, setFeedbackAdded] = useState(false);
  const [keepWorking, setKeepWorking] = useState(false);

  useEffect(() => {
    if (open) {
      // Get the teacher feedback
      const studentId = studentLevelInfo.user_id;
      const endPoint = `/rubrics/${rubric.id}/get_teacher_feedback?student=${studentId}`;
      fetch(endPoint)
        .then(response => response.json())
        .then(json => {
          setKeepWorking(json.review_state === 'keepWorking');
          const lastSubmittedDateObj = new Date(json.updated_at);
          setLastSubmittedTimestamp(lastSubmittedDateObj.toLocaleString());
        });
    }
  }, [open, rubric.id, studentLevelInfo.user_id]);

  const submitFeedbackToStudent = () => {
    analyticsReporter.sendEvent(EVENTS.TA_RUBRIC_SUBMITTED, {
      ...reportingData,
      studentId: studentLevelInfo.user_id,
    });
    setIsSubmittingToStudent(true);
    setErrorSubmitting(false);
    const body = JSON.stringify({
      student_id: studentLevelInfo.user_id,
      keep_working: keepWorking,
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

  const tabSelectCallback = tabSelection => {
    setSelectedTab(tabSelection);
  };

  const fetchAiEvaluations = useCallback(() => {
    if (!!studentLevelInfo && teacherHasEnabledAi) {
      const studentId = studentLevelInfo.user_id;
      const rubricId = rubric.id;
      const dataUrl = `/rubrics/${rubricId}/get_ai_evaluations?student_id=${studentId}`;

      fetch(dataUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setAiEvaluations(data);
        })
        .catch(error => {
          console.log(
            'There was a problem with the fetch operation:',
            error.message
          );
        });
    }
  }, [studentLevelInfo, teacherHasEnabledAi, rubric.id]);

  useEffect(() => {
    fetchAiEvaluations();
  }, [fetchAiEvaluations]);

  useEffect(() => {
    trySetSessionStorage(rubricTabSessionKey, selectedTab);
  }, [selectedTab]);

  // Currently the settings tab only provides a way to manually run AI.
  // In the future, we should update or remove this conditional when we
  // add more functionality to the settings tab.
  const showSettings = onLevelForEvaluation && teacherHasEnabledAi;

  return (
    <Draggable>
      <div
        data-testid="draggable-test-id"
        id="draggable-id"
        className={classnames(style.rubricContainer, {
          [style.hiddenRubricContainer]: !open,
        })}
      >
        <div className={style.rubricHeaderRedesign}>
          <div className={style.rubricHeaderLeftSide}>
            <FontAwesome icon="house" />
            {i18n.rubricAiHeaderText()}
          </div>
          <div className={style.rubricHeaderRightSide}>
            <button
              type="button"
              onClick={closeRubric}
              className={classnames(style.buttonStyle, style.closeButton)}
            >
              <FontAwesome icon="xmark" />
            </button>
          </div>
        </div>

        <div className={style.fabBackground}>
          <RubricTabButtons
            tabSelectCallback={tabSelectCallback}
            selectedTab={selectedTab}
            showSettings={showSettings}
            canProvideFeedback={canProvideFeedback}
            teacherHasEnabledAi={teacherHasEnabledAi}
            studentUserId={studentLevelInfo && studentLevelInfo['user_id']}
            refreshAiEvaluations={fetchAiEvaluations}
            rubric={rubric}
            studentName={studentLevelInfo && studentLevelInfo.name}
          />

          <RubricContent
            rubric={rubric}
            open={open}
            studentLevelInfo={studentLevelInfo}
            teacherHasEnabledAi={teacherHasEnabledAi}
            canProvideFeedback={canProvideFeedback}
            onLevelForEvaluation={onLevelForEvaluation}
            reportingData={reportingData}
            visible={selectedTab === TAB_NAMES.RUBRIC}
            aiEvaluations={aiEvaluations}
          />
          {showSettings && (
            <RubricSettings
              visible={selectedTab === TAB_NAMES.SETTINGS}
              rubric={rubric}
              sectionId={sectionId}
            />
          )}
        </div>
        {canProvideFeedback && (
          <div className={style.rubricFooter}>
            <div className={style.rubricFooterContent}>
              <Checkbox
                label={'Student should keep working'}
                size="xs"
                name="keepWorking"
                onChange={() => {
                  setKeepWorking(!keepWorking);
                }}
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
                disabled={isSubmittingToStudent}
              />
              {errorSubmitting && (
                <div>
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
        )}
      </div>
    </Draggable>
  );
}

RubricContainer.propTypes = {
  rubric: rubricShape,
  reportingData: reportingDataShape,
  studentLevelInfo: studentLevelInfoShape,
  teacherHasEnabledAi: PropTypes.bool,
  currentLevelName: PropTypes.string,
  closeRubric: PropTypes.func,
  open: PropTypes.bool,
  sectionId: PropTypes.number,
};

const HeaderTab = ({text, isSelected, onClick}) => {
  return (
    <button
      className={classnames(
        'uitest-rubric-header-tab',
        style.rubricHeaderTab,
        style.buttonStyle,
        {
          [style.selectedTab]: isSelected,
          [style.unselectedTab]: !isSelected,
        }
      )}
      onClick={onClick}
      type="button"
    >
      <Heading6>{text}</Heading6>
    </button>
  );
};

HeaderTab.propTypes = {
  text: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};
