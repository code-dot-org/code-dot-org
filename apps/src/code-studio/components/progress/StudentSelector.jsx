import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import {queryUserProgress} from '@cdo/apps/code-studio/progressRedux';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import i18n from '@cdo/locale';

import style from './unit-overview.module.scss';

const NO_SELECTED_STUDENT_ID = '';

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
    const newUserId = event.target.value;
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

  const student_list = [
    {
      value: NO_SELECTED_STUDENT_ID,
      text: i18n.Me(),
    },
  ].concat(
    students.map(student => ({
      value: student.id,
      text: student.familyName
        ? `${student.name} ${student.familyName}`
        : `${student.name}`,
    }))
  );

  return (
    <SimpleDropdown
      className={style.studentSelector}
      labelText={i18n.viewingProgressFor()}
      aria-label={i18n.selectStudentOption()}
      selectedValue={selectedUserId ? selectedUserId : NO_SELECTED_STUDENT_ID}
      onChange={event => handleSelectStudentChange(event)}
      size="s"
      name="students"
      items={student_list}
      id="uitest-view-as-student-selector"
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
