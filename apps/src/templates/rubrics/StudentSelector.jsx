import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {updateQueryParam} from '@cdo/apps/code-studio/utils';
import {reload} from '@cdo/apps/utils';
import {queryUserProgress} from '@cdo/apps/code-studio/progressRedux';

const NO_SELECTED_SECTION_VALUE = '';

function StudentSelector({
  styleName,
  style,
  selectedUserId,
  reloadOnChange,

  //from redux
  students,
  selectUser,
}) {
  const handleSelectStudentChange = event => {
    const newUserId = event.target.value;
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
    <select
      className={styleName ? styleName : 'uitest-studentselect'}
      name="students"
      aria-label={i18n.selectStudentOption()}
      value={selectedUserId || NO_SELECTED_SECTION_VALUE}
      style={{
        ...style,
      }}
      onChange={handleSelectStudentChange}
    >
      <option key={NO_SELECTED_SECTION_VALUE} value={NO_SELECTED_SECTION_VALUE}>
        {i18n.selectStudentOption()}
      </option>

      {students.map(student => (
        <option key={student.id} value={student.id}>
          {`${student.name} ${student.familyName || ''}`}
        </option>
      ))}
    </select>
  );
}

StudentSelector.propTypes = {
  styleName: PropTypes.string,
  selectedUserId: PropTypes.number,
  reloadOnChange: PropTypes.bool,
  style: PropTypes.object,

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
