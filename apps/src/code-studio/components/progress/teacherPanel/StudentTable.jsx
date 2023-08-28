import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import DCDO from '@cdo/apps/dcdo';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {levelWithProgress, studentShape} from './types';

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
      selectedUserId,
      levelsWithProgress,
      isSortedByFamilyName,
    } = this.props;

    // Sort using system default locale.
    const collator = new Intl.Collator();

    // Returns a comparator function that sorts objects a and b by the given
    // keys, in order of priority.
    // Example: comparator(['familyName', 'name']) will sort by familyName
    // first, looking at name if necessary to break ties.
    const comparator = keys => (a, b) =>
      keys.reduce(
        (result, key) => result || letterCompare(a[key] || '', b[key] || ''),
        0
      );

    const letterCompare = (a, b) => {
      // Strip out any non-alphabetic characters from the strings before sorting
      // (https://unicode.org/reports/tr44/#Alphabetic)
      const aLetters = a.replace(/[^\p{Alphabetic}]/gu, '');
      const bLetters = b.replace(/[^\p{Alphabetic}]/gu, '');

      const initialCompare = collator.compare(aLetters, bLetters);

      // Sort strings with letters before strings without
      if (initialCompare > 0 && !!aLetters && !bLetters) {
        return -1;
      }
      if (initialCompare < 0 && !aLetters && !!bLetters) {
        return 1;
      }

      // Use original strings as a fallback if the special-character-stripped
      // version compares as equal.
      return initialCompare || collator.compare(a, b);
    };

    // Sort students, in-place.
    isSortedByFamilyName
      ? students.sort(comparator(['familyName', 'name']))
      : students.sort(comparator(['name', 'familyName']));

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
                    {!!DCDO.get('family-name-features', false) &&
                      ` ${student.familyName || ''}`}
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
    margin: 'auto',
  },
  tr: {
    height: 41,
    color: color.cyan,
    border: `1px solid ${color.lighter_cyan}`,
    backgroundColor: color.lightest_gray,
    ':hover': {
      backgroundColor: color.lighter_cyan,
      cursor: 'pointer',
    },
  },
  td: {
    padding: 1,
  },
  selected: {
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.white,
    backgroundColor: color.light_cyan,
  },
  studentTableRow: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  meRow: {
    padding: '1px 1px 1px 5px',
  },
  name: {
    paddingLeft: 5,
    margin: '1px 1px 1px 0',
    flexGrow: 1,
  },
  linkIcon: {
    marginLeft: 10,
  },
};

export const UnconnectedStudentTable = Radium(StudentTable);
export default connect(state => ({
  isSortedByFamilyName: state.currentUser.isSortedByFamilyName,
}))(UnconnectedStudentTable);
