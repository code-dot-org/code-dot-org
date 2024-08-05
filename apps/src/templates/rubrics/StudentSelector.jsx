import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';

import {levelWithProgress} from '@cdo/apps/code-studio/components/progress/teacherPanel/types';
import {queryUserProgress} from '@cdo/apps/code-studio/progressRedux';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import {
  BodyThreeText,
  EmText,
  OverlineThreeText,
} from '@cdo/apps/componentLibrary/typography';
import {EVENTS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import {reload} from '@cdo/apps/utils';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import {reportingDataShape} from './rubricShapes';

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
}) {
  const handleSelectStudentChange = event => {
    const newUserId = event.value;
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

  if (students.length === 0) {
    return null;
  }

  return (
    <Select
      className={styleName ? styleName : 'uitest-studentselect'}
      name="students"
      clearable={false}
      searchable={false}
      aria-label={i18n.selectStudentOption()}
      value={selectedUserId || NO_SELECTED_SECTION_VALUE}
      onChange={handleSelectStudentChange}
      options={(selectedUserId
        ? []
        : [
            {
              value: NO_SELECTED_SECTION_VALUE,
              label: (
                <BodyThreeText className={style.submitStatusText}>
                  <EmText>{i18n.selectStudentOption()}</EmText>
                </BodyThreeText>
              ),
            },
          ]
      ).concat(
        students.map(student => ({
          value: student.id,
          label: (
            <div className={style.studentDropdownOptionContainer}>
              <div className={style.studentDropdownOption}>
                <BodyThreeText className={style.submitStatusText}>
                  {student.familyName
                    ? student.familyName.length + student.name.length <
                      MAX_NAME_LENGTH
                      ? `${student.name} ${student.familyName}`
                      : `${student.name} ${student.familyName}`
                          .substring(0, MAX_NAME_LENGTH - 1)
                          .concat('', '...')
                    : `${student.name}`}
                </BodyThreeText>
                {!!levelsWithProgress && (
                  <StudentProgressStatus
                    level={levelsWithProgress.find(
                      userLevel => student.id === userLevel.userId
                    )}
                  />
                )}
              </div>
            </div>
          ),
        }))
      )}
    />
  );
}

StudentSelector.propTypes = {
  styleName: PropTypes.string,
  selectedUserId: PropTypes.number,
  reloadOnChange: PropTypes.bool,
  sectionId: PropTypes.number,
  reportingData: reportingDataShape,

  //from redux
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectUser: PropTypes.func.isRequired,
  levelsWithProgress: PropTypes.arrayOf(levelWithProgress),
};

export const UnconnectedStudentSelector = StudentSelector;

export default connect(
  state => ({
    students: state.teacherSections.selectedStudents,
    levelsWithProgress: state.teacherPanel.levelsWithProgress,
  }),
  dispatch => ({
    selectUser(userId) {
      dispatch(queryUserProgress(userId));
    },
  })
)(StudentSelector);

function StudentProgressStatus({level}) {
  const bubbleColor = () => {
    if (!level || level.status === LevelStatus.not_tried) {
      return style.grayStatusBlob;
    } else if (
      level.status === LevelStatus.attempted ||
      level.status === LevelStatus.passed
    ) {
      return style.yellowStatusBlob;
    } else if (
      level.status === LevelStatus.submitted ||
      level.status === LevelStatus.perfect ||
      level.status === LevelStatus.completed_assessment ||
      level.status === LevelStatus.free_play_complete
    ) {
      return style.greenStatusBlob;
    }
  };

  const bubbleText = () => {
    if (!level || level.status === LevelStatus.not_tried) {
      return i18n.notStarted();
    } else if (
      level.status === LevelStatus.attempted ||
      level.status === LevelStatus.passed
    ) {
      return i18n.inProgress();
    } else if (
      level.status === LevelStatus.submitted ||
      level.status === LevelStatus.perfect ||
      level.status === LevelStatus.completed_assessment ||
      level.status === LevelStatus.free_play_complete
    ) {
      return i18n.submitted();
    } else {
      return null;
    }
  };

  if (bubbleText === null) {
    return null;
  }

  return (
    <OverlineThreeText className={bubbleColor()}>
      {bubbleText()}
    </OverlineThreeText>
  );
}

StudentProgressStatus.propTypes = {
  level: levelWithProgress,
};
