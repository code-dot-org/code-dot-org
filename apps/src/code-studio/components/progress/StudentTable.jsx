import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import {TeacherPanelProgressBubble} from '@cdo/apps/code-studio/components/progress/TeacherPanelProgressBubble';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {
  studentType,
  levelType,
  studentLevelProgressType
} from '@cdo/apps/templates/progress/progressTypes';

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
  nameInScript: {
    paddingLeft: 5,
    margin: '1px 1px 1px 0',
    flexGrow: 1
  },
  nameWithBubble: {
    paddingLeft: 5,
    margin: '1px 1px 1px 0',
    flexGrow: 1
  },
  linkIcon: {
    marginLeft: 10
  }
};

class StudentTable extends React.Component {
  static propTypes = {
    students: PropTypes.arrayOf(studentType).isRequired,
    onSelectUser: PropTypes.func.isRequired,
    getSelectedUserId: PropTypes.func.isRequired,
    levels: PropTypes.arrayOf(levelType),
    levelProgressByStudent: PropTypes.objectOf(
      PropTypes.objectOf(studentLevelProgressType)
    ),
    sectionId: PropTypes.number,
    scriptName: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.getRowLink = this.getRowLink.bind(this);
    this.getRowStyle = this.getRowStyle.bind(this);
  }

  getRowLink(studentId) {
    let url;
    const queryStr = `?section_id=${this.props.sectionId}&user_id=${studentId}`;

    if (this.props.levels) {
      url = this.props.levels[0].bonus
        ? 'extras'
        : this.props.levels[0].levelNumber;
    } else {
      url = this.props.scriptName;
    }

    return url + queryStr;
  }

  getRowStyle(selectedUserId, id) {
    const isSelected = selectedUserId === id;
    if (isSelected) {
      return [styles.tr, styles.selected];
    } else {
      return styles.tr;
    }
  }

  render() {
    const {
      students,
      onSelectUser,
      getSelectedUserId,
      levels,
      levelProgressByStudent
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
          {students.map(student => {
            let level;
            let levelProgress;
            if (levels) {
              level = levels.find(level => student.id === level.user_id);
              levelProgress = levelProgressByStudent[student.id][level.id];
            }
            return (
              <tr
                key={`tr-${student.id}`}
                style={this.getRowStyle(selectedUserId, student.id)}
                onClick={() => onSelectUser(student.id)}
              >
                <td key={`td-${student.id}`} style={styles.td}>
                  <div style={styles.studentTableRow}>
                    {levels && (
                      <TeacherPanelProgressBubble
                        level={level}
                        levelProgress={levelProgress}
                      />
                    )}
                    <div
                      style={
                        levels ? styles.nameWithBubble : styles.nameInScript
                      }
                    >
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
            );
          })}
        </tbody>
      </table>
    );
  }
}

export default Radium(StudentTable);
