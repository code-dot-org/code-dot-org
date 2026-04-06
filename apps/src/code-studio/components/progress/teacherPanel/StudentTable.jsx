import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import stringKeyComparator from '@cdo/apps/util/stringKeyComparator';
import i18n from '@cdo/locale';

import {levelWithProgress, studentShape} from './types';

import styles from './student-table.module.scss';

class StudentTable extends React.Component {
  static propTypes = {
    students: PropTypes.arrayOf(studentShape).isRequired,
    onSelectUser: PropTypes.func.isRequired,
    selectedUserId: PropTypes.number,
    levelsWithProgress: PropTypes.arrayOf(levelWithProgress),
    sectionId: PropTypes.number,
    unitName: PropTypes.string,

    // provided by redux
    isSortedByFamilyName: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {sortedStudents: []};
  }

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

  getRowClass = (selectedUserId, id) => {
    const isSelected = selectedUserId === id;
    return classNames(styles.row, {[styles.selected]: isSelected});
  };

  componentDidMount() {
    this.setState({sortedStudents: this.sortStudents()});
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isSortedByFamilyName !== this.props.isSortedByFamilyName) {
      this.setState({sortedStudents: this.sortStudents()});
    }
  }

  sortStudents() {
    const {students, isSortedByFamilyName} = this.props;
    return isSortedByFamilyName
      ? [...students].sort(stringKeyComparator(['familyName', 'name']))
      : [...students].sort(stringKeyComparator(['name', 'familyName']));
  }

  render() {
    const {onSelectUser, selectedUserId, levelsWithProgress} = this.props;
    const {sortedStudents} = this.state;

    return (
      <table className={classNames(styles.table, 'student-table')}>
        <tbody>
          <tr
            className={this.getRowClass(selectedUserId, null)}
            onClick={() => onSelectUser(null)}
          >
            <td className={styles.meRow}>{i18n.studentTableTeacherDemo()}</td>
          </tr>
          {sortedStudents.map(student => (
            <tr
              key={`tr-${student.id}`}
              className={this.getRowClass(selectedUserId, student.id)}
              onClick={() => onSelectUser(student.id)}
            >
              <td key={`td-${student.id}`} className={styles.td}>
                <div className={styles.studentTableRow}>
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
                  <div className={styles.name}>
                    {`${student.name} ${student.familyName || ''}`}
                    <a
                      href={this.getRowLink(student.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkIcon}
                    >
                      <FontAwesome icon="arrow-up-right-from-square" />
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

export const UnconnectedStudentTable = StudentTable;
export default connect(state => ({
  isSortedByFamilyName: state.currentUser.isSortedByFamilyName,
}))(UnconnectedStudentTable);
