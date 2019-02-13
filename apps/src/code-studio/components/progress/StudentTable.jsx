import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

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
    padding: 10
  },
  selected: {
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white,
    backgroundColor: color.light_cyan
  }
};

class StudentTable extends React.Component {
  static propTypes = {
    students: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      })
    ).isRequired,
    onSelectUser: PropTypes.func.isRequired,
    getSelectedUserId: PropTypes.func.isRequired
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
    const {students, onSelectUser, getSelectedUserId} = this.props;
    const selectedUserId = getSelectedUserId();

    return (
      <table style={styles.table}>
        <tbody>
          <tr
            style={this.getRowStyle(selectedUserId, null)}
            onClick={() => onSelectUser(null)}
          >
            <td style={styles.td}>{i18n.studentTableTeacherDemo()}</td>
          </tr>
          {students.map(student => (
            <tr
              key={`tr-${student.id}`}
              style={this.getRowStyle(selectedUserId, student.id)}
              onClick={() => onSelectUser(student.id)}
            >
              <td key={`td-${student.id}`} style={styles.td}>
                {student.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default Radium(StudentTable);
