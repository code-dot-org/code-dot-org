import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Select from 'react-select';
import i18n from '@cdo/locale';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import {reload} from '@cdo/apps/utils';
import {queryUserProgress} from '@cdo/apps/code-studio/progressRedux';
import {levelWithProgress} from '@cdo/apps/code-studio/components/progress/teacherPanel/types';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import style from './rubrics.module.scss';
import {
  BodyThreeText,
  EmText,
  OverlineThreeText,
} from '@cdo/apps/componentLibrary/typography';

const NO_SELECTED_SECTION_VALUE = '';

function StudentSelector({
  styleName,
  selectedUserId,
  reloadOnChange,

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
                <BodyThreeText className={style.submitStatusText}>{`${
                  student.name
                } ${student.familyName || ''}`}</BodyThreeText>
                <StudentProgressStatus
                  level={levelsWithProgress.find(
                    userLevel => student.id === userLevel.userId
                  )}
                />
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
