import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {levelWithProgress, studentShape} from './types';

class StudentTable extends React.Component {
  static propTypes = {
    students: PropTypes.arrayOf(studentShape).isRequired,
    onSelectUser: PropTypes.func.isRequired,
    getSelectedUserId: PropTypes.func.isRequired,
    levelsWithProgress: PropTypes.arrayOf(levelWithProgress),
    sectionId: PropTypes.number,
    unitName: PropTypes.string
  };

  getRowLink = studentId => {
    const queryStr = `?section_id=${this.props.sectionId}&user_id=${studentId}`;

    let url;
    if (this.props.levelsWithProgress?.length) {
      url = this.props.levelsWithProgress[0].bonus
        ? 'extras'
        : this.props.levelsWithProgress[0].levelNumber;
    } else {
      url = this.props.unitName;
    }

    return url + queryStr;
  };

  getRowStyle = (selectedUserId, id) => {
    const isSelected = selectedUserId === id;
    return isSelected ? [styles.tr, styles.selected] : styles.tr;
  };

  render() {
    const {
      students,
      onSelectUser,
      getSelectedUserId,
      levelsWithProgress
    } = this.props;

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
                  {!!levelsWithProgress?.length && (
                    <ProgressBubble
                      level={levelsWithProgress.find(
                        userLevel => student.id === userLevel.userId
                      )}
                      disabled={true}
                      hideTooltips={true}
                      hideAssessmentBadge={true}
                    />
                  )}
                  <div style={styles.name}>
                    {student.name}
                    <a
                      href={this.getRowLink(student.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.linkIcon}
                    >
                      <FontAwesome icon="external-link" />
                    </a>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

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
    alignItems: 'center',
    width: '100%'
  },
  meRow: {
    padding: '1px 1px 1px 5px'
  },
  name: {
    paddingLeft: 5,
    margin: '1px 1px 1px 0',
    flexGrow: 1
  },
  linkIcon: {
    marginLeft: 10
  }
};

export default Radium(StudentTable);
