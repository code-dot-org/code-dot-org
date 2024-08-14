import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import ReactTooltip from 'react-tooltip';

import SegmentedButtons from '@cdo/apps/componentLibrary/segmentedButtons/SegmentedButtons';
import {RubricAiEvaluationLimits} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {TAB_NAMES} from './rubricHelpers';
import {reportingDataShape, rubricShape} from './rubricShapes';
import RunAIAssessmentButton, {STATUS} from './RunAIAssessmentButton';

import style from './rubrics.module.scss';

export default function RubricTabButtons({
  tabSelectCallback,
  selectedTab,
  showSettings,
  canProvideFeedback,
  teacherHasEnabledAi,
  studentUserId,
  refreshAiEvaluations,
  rubric,
  studentName,
  reportingData,
}) {
  const [status, setStatus] = useState(STATUS.INITIAL_LOAD);

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
      case STATUS.REQUEST_TOO_LARGE:
        return i18n.aiEvaluationStatus_request_too_large();
      case STATUS.TEACHER_LIMIT_EXCEEDED:
        return i18n.aiEvaluationStatus_teacher_limit_exceeded({
          limit: RubricAiEvaluationLimits.TEACHER_LIMIT,
        });
    }
  };

  const runButtonTooltipId = _.uniqueId();

  return (
    <div>
      <div className={style.rubricTabGroup}>
        <SegmentedButtons
          className="uitest-rubric-tab-buttons"
          selectedButtonValue={selectedTab}
          size="s"
          buttons={[
            {label: i18n.rubricTabStudent(), value: TAB_NAMES.RUBRIC},
            {
              label: i18n.rubricTabClassManagement(),
              value: TAB_NAMES.SETTINGS,
              disabled: !showSettings,
            },
          ]}
          onChange={value => tabSelectCallback(value)}
        />
        {selectedTab === TAB_NAMES.RUBRIC && teacherHasEnabledAi && (
          <div data-tip data-for={runButtonTooltipId}>
            <RunAIAssessmentButton
              canProvideFeedback={canProvideFeedback}
              teacherHasEnabledAi={teacherHasEnabledAi}
              studentUserId={studentUserId}
              refreshAiEvaluations={refreshAiEvaluations}
              rubric={rubric}
              studentName={studentName}
              status={status}
              setStatus={setStatus}
              reportingData={reportingData}
            />
            {!!statusText() && (
              <ReactTooltip
                id={runButtonTooltipId}
                role="tooltip"
                effect="solid"
                place="bottom"
              >
                <div style={{maxWidth: 400}}>
                  <p>{statusText()}</p>
                </div>
              </ReactTooltip>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

RubricTabButtons.propTypes = {
  tabSelectCallback: PropTypes.func,
  selectedTab: PropTypes.string,
  showSettings: PropTypes.bool,
  canProvideFeedback: PropTypes.bool,
  teacherHasEnabledAi: PropTypes.bool,
  updateTeacherAiSetting: PropTypes.func,
  studentUserId: PropTypes.number,
  refreshAiEvaluations: PropTypes.func,
  rubric: rubricShape.isRequired,
  studentName: PropTypes.string,
  reportingData: reportingDataShape,
};
