import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {levelWithProgress} from '@cdo/apps/code-studio/components/progress/teacherPanel/types';
import {queryUserProgress} from '@cdo/apps/code-studio/progressRedux';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {reload} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import {reportingDataShape} from './rubricShapes';
import {selectStudentProgressStatusMap} from './teacherRubricRedux';

import style from './rubrics.module.scss';

const NO_SELECTED_SECTION_VALUE = '';
const MAX_NAME_LENGTH = 20;

function StudentSelector({
  styleName,
  selectedUserId,
  reloadOnChange,
  reportingData,
  sectionId,

  //from redux
  students,
  selectUser,
  levelsWithProgress,
  hasTeacherFeedbackMap,
  aiEvalStatusMap,
}) {
  const handleSelectStudentChange = selectedOption => {
    const newUserId = selectedOption.value;
    updateQueryParam(
      'user_id',
      newUserId === NO_SELECTED_SECTION_VALUE ? undefined : newUserId
    );
    analyticsReporter.sendEvent(EVENTS.TA_RUBRIC_DROPDOWN_STUDENT_SELECTED, {
      ...(reportingData || {}),
      studentId: newUserId,
      sectionId: sectionId,
    });
    if (reloadOnChange) {
      reload();
    } else {
      selectUser(newUserId);
    }
  };

  const studentProgressStatusMap = useAppSelector(
    selectStudentProgressStatusMap
  );

  if (students.length === 0) {
    return null;
  }

  const getStudentProgressStatusForUser = userId => {
    return studentProgressStatusMap[userId];
  };

  const handleOptionClick = value => {
    const selectedOption = {value};
    handleSelectStudentChange(selectedOption);
  };

  const getStudentDisplayName = student => {
    return student.familyName
      ? student.familyName.length + student.name.length < MAX_NAME_LENGTH
        ? `${student.name} ${student.familyName}`
        : `${student.name} ${student.familyName}`
            .substring(0, MAX_NAME_LENGTH - 1)
            .concat('', '...')
      : `${student.name}`;
  };

  const selectedDisplayValue = selectedUserId
    ? (() => {
        const selectedStudent = students.find(s => s.id === selectedUserId);
        return selectedStudent ? getStudentDisplayName(selectedStudent) : '';
      })()
    : i18n.selectStudentOption();

  return (
    <CustomDropdown
      className={styleName ? styleName : 'uitest-studentselect'}
      name="students"
      size="s"
      styleAsFormField={true}
      selectedValueText={selectedDisplayValue}
      aria-label={i18n.selectStudentOption()}
    >
      <ul>
        {!selectedUserId && (
          <li className={style.unselectableDropdownOption} key="select-student">
            <div className={style.dropdownOption}>
              <span>{i18n.selectStudentOption()}</span>
            </div>
          </li>
        )}
        {students.map(student => (
          <li key={student.id}>
            <button
              className={style.dropdownOption}
              onClick={() => handleOptionClick(student.id)}
              type="button"
            >
              <span>{getStudentDisplayName(student)}</span>
              {!!levelsWithProgress && aiEvalStatusMap && (
                <StudentProgressStatus
                  aiEvalStatus={aiEvalStatusMap[student.id]}
                  hasTeacherFeedback={hasTeacherFeedbackMap[student.id]}
                  status={getStudentProgressStatusForUser(student.id)}
                />
              )}
            </button>
          </li>
        ))}
      </ul>
    </CustomDropdown>
  );
}

StudentSelector.propTypes = {
  styleName: PropTypes.string,
  selectedUserId: PropTypes.number,
  reloadOnChange: PropTypes.bool,
  sectionId: PropTypes.number,
  reportingData: reportingDataShape,
  aiEvalStatusMap: PropTypes.object,

  //from redux
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectUser: PropTypes.func.isRequired,
  levelsWithProgress: PropTypes.arrayOf(levelWithProgress),
  hasTeacherFeedbackMap: PropTypes.object,
};

export const UnconnectedStudentSelector = StudentSelector;

export default connect(
  state => ({
    students: state.teacherSections.selectedStudents,
    levelsWithProgress: state.teacherPanel.levelsWithProgress,
    hasTeacherFeedbackMap: state.teacherRubric.hasTeacherFeedbackMap,
    aiEvalStatusMap: state.teacherRubric.aiEvalStatusMap,
  }),
  dispatch => ({
    selectUser(userId) {
      dispatch(queryUserProgress(userId));
    },
  })
)(StudentSelector);

const STATUS_BUBBLE_COLOR = {
  NOT_STARTED: style.grayStatusBlob,
  IN_PROGRESS: style.yellowStatusBlob,
  SUBMITTED: style.purpleStatusBlob,
  READY_TO_REVIEW: style.redStatusBlob,
  EVALUATED: style.greenStatusBlob,
};

const STATUS_BUBBLE_TEXT = {
  NOT_STARTED: i18n.notStarted(),
  IN_PROGRESS: i18n.inProgress(),
  SUBMITTED: i18n.submitted(),
  READY_TO_REVIEW: i18n.readyToReview(),
  EVALUATED: i18n.evaluated(),
};

function StudentProgressStatus({status}) {
  if (!status) {
    return null;
  }

  const bubbleColor = STATUS_BUBBLE_COLOR[status];
  const bubbleText = STATUS_BUBBLE_TEXT[status];

  const classes = classNames(
    'uitest-student-progress-status',
    style.statusBlob,
    bubbleColor
  );
  return <span className={classes}>{bubbleText}</span>;
}

StudentProgressStatus.propTypes = {
  status: PropTypes.string,
};
