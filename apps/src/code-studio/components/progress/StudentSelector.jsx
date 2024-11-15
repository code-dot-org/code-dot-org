import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';

import {levelWithProgress} from '@cdo/apps/code-studio/components/progress/teacherPanel/types';
import {queryUserProgress} from '@cdo/apps/code-studio/progressRedux';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import {BodyThreeText, EmText} from '@cdo/apps/componentLibrary/typography';
import {reload} from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import style from './unit-overview.module.scss';

const NO_SELECTED_SECTION_VALUE = '';
const MAX_NAME_LENGTH = 20;

function StudentSelector({
  styleName,
  selectedUserId,
  reloadOnChange,
  sectionId,

  //from redux
  students,
  selectUser,
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
  }),
  dispatch => ({
    selectUser(userId) {
      dispatch(queryUserProgress(userId));
    },
  })
)(StudentSelector);
