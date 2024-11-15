import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';

import {queryUserProgress} from '@cdo/apps/code-studio/progressRedux';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import i18n from '@cdo/locale';

import style from './unit-overview.module.scss';

const NO_SELECTED_STUDENT_ID = '';
const MAX_NAME_LENGTH = 20;

function StudentSelector({
  //from redux
  students,
  selectUser,
}) {
  const url_params = new URLSearchParams(window.location.search);
  const [selectedUserId, setSelectedUserId] = useState(
    url_params.get('user_id')
  );

  const handleSelectStudentChange = event => {
    const newUserId = event.value;
    updateQueryParam(
      'user_id',
      newUserId === NO_SELECTED_STUDENT_ID ? undefined : newUserId
    );
    setSelectedUserId(newUserId);
    selectUser(newUserId);
  };

  if (students.length === 0) {
    return null;
  }

  return (
    <Select
      className={style.studentSelect}
      name="students"
      clearable={false}
      searchable={false}
      aria-label={i18n.selectStudentOption()}
      value={selectedUserId || NO_SELECTED_STUDENT_ID}
      onChange={handleSelectStudentChange}
      options={[
        {
          value: NO_SELECTED_STUDENT_ID,
          label: <BodyThreeText>{i18n.Me()}</BodyThreeText>,
        },
      ].concat(
        students.map(student => ({
          value: student.id,
          label: (
            <BodyThreeText>
              {student.familyName
                ? student.familyName.length + student.name.length <
                  MAX_NAME_LENGTH
                  ? `${student.name} ${student.familyName}`
                  : `${student.name} ${student.familyName}`
                      .substring(0, MAX_NAME_LENGTH - 1)
                      .concat('', '...')
                : `${student.name}`}
            </BodyThreeText>
          ),
        }))
      )}
    />
  );
}

StudentSelector.propTypes = {
  //from redux
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectUser: PropTypes.func.isRequired,
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
