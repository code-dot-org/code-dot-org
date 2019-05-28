import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import {TeacherPanelProgressBubble} from '@cdo/apps/code-studio/components/progress/TeacherPanelProgressBubble';

const styles = {
  table: {
    width: '90%',
    margin: 'auto'
  },
  tr: {
    height: 41,
    color: color.cyan,
    border: `1px solid ${color.lighter_cyan}`,
    backgroundColor: color.lightest_gray,
    ':hover': {
      backgroundColor: color.lighter_cyan,
      cursor: 'pointer'
    }
  },
  td: {
    padding: 1
  },
  selected: {
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white,
    backgroundColor: color.light_cyan
  },
  studentTableRow: {
    display: 'flex',
    alignItems: 'center'
  },
  meRow: {
    padding: '1px 1px 1px 5px'
  },
  nameInScript: {
    paddingLeft: 5
  },
  nameWithBubble: {
    paddingLeft: 5
  }
};

export const studentShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired
});

class StudentTable extends React.Component {
  static propTypes = {
    students: PropTypes.arrayOf(studentShape).isRequired,
    onSelectUser: PropTypes.func.isRequired,
    getSelectedUserId: PropTypes.func.isRequired,
    levels: PropTypes.array
  };

  getRowStyle = (selectedUserId, id) => {
    const isSelected = selectedUserId === id;
    if (isSelected) {
      return [styles.tr, styles.selected];
    } else {
      return styles.tr;
    }
  };

  render() {
    const {students, onSelectUser, getSelectedUserId, levels} = this.props;
    const selectedUserId = getSelectedUserId();

    return (
      <table style={styles.table} className="student-table">
        <tbody>
          <tr
            style={this.getRowStyle(selectedUserId, null)}
            onClick={() => onSelectUser(null)}
          >
            <td style={styles.meRow}>{i18n.studentTableTeacherDemo()}</td>
          </tr>
          {students.map(student => (
            <tr
              key={`tr-${student.id}`}
              style={this.getRowStyle(selectedUserId, student.id)}
              onClick={() => onSelectUser(student.id)}
            >
              <td key={`td-${student.id}`} style={styles.td}>
                <div style={styles.studentTableRow}>
                  {levels && (
                    <TeacherPanelProgressBubble
                      level={levels.find(level => student.id === level.user_id)}
                    />
                  )}
                  <span
                    style={levels ? styles.nameWithBubble : styles.nameInScript}
                  >
                    {student.name}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default Radium(StudentTable);
