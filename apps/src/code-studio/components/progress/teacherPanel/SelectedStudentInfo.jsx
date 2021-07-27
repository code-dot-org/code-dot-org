import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import Radium from 'radium';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import {levelWithProgress, studentShape} from './types';

const RadiumFontAwesome = Radium(FontAwesome);

export default class SelectedStudentInfo extends React.Component {
  static propTypes = {
    students: PropTypes.arrayOf(studentShape).isRequired,
    selectedStudent: PropTypes.object,
    levelWithProgress: levelWithProgress,
    onSelectUser: PropTypes.func.isRequired,
    getSelectedUserId: PropTypes.func.isRequired
  };

  onUnsubmit = () => {
    $.ajax({
      url: `/user_levels/${this.props.levelWithProgress.userLevelId}`,
      method: 'PUT',
      data: {
        user_level: {
          best_result: 1,
          submitted: false
        }
      }
    })
      .done(data => {
        // Let's just refresh so that the dots are correct, etc.
        location.reload();
      })
      .fail(err => console.error(err));
  };

  nextStudent = () => {
    const currentUserId = this.props.getSelectedUserId();
    const currentStudentIndex = this.props.students.findIndex(
      student => student.id === currentUserId
    );
    if (currentStudentIndex === this.props.students.length - 1) {
      this.props.onSelectUser(null);
    } else {
      this.props.onSelectUser(this.props.students[currentStudentIndex + 1].id);
    }
  };

  previousStudent = () => {
    const currentUserId = this.props.getSelectedUserId();
    const currentStudentIndex = this.props.students.findIndex(
      student => student.id === currentUserId
    );
    if (currentStudentIndex === 0) {
      this.props.onSelectUser(null);
    } else if (currentStudentIndex === -1) {
      this.props.onSelectUser(
        this.props.students[this.props.students.length - 1].id
      );
    } else {
      this.props.onSelectUser(this.props.students[currentStudentIndex - 1].id);
    }
  };

  render() {
    const {selectedStudent, levelWithProgress} = this.props;

    return (
      <div style={styles.main}>
        <RadiumFontAwesome
          icon="caret-left"
          onClick={this.previousStudent}
          style={styles.arrow}
        />
        <div style={styles.studentInfo}>
          <div style={styles.name}>{selectedStudent.name}</div>
          {levelWithProgress?.paired && (
            <div>
              <div>{i18n.workedWith()}</div>
              {levelWithProgress.navigator && (
                <div key={levelWithProgress.navigator}>
                  {i18n.partner({partner: levelWithProgress.navigator})}
                </div>
              )}
              {levelWithProgress.driver && (
                <div key={levelWithProgress.driver}>
                  {i18n.loggedIn({partner: levelWithProgress.driver})}
                </div>
              )}
            </div>
          )}
          {levelWithProgress && (
            <div style={styles.bubble}>
              <ProgressBubble
                level={levelWithProgress}
                disabled={true}
                hideTooltips={true}
                hideAssessmentBadge={true}
              />
            </div>
          )}
          {levelWithProgress && !levelWithProgress.submitLevel && (
            <div>
              <div style={styles.timeHeader}>{i18n.lastUpdatedNoTime()}</div>
              <div>
                {levelWithProgress.status !== LevelStatus.not_tried &&
                levelWithProgress.updatedAt
                  ? new Date(levelWithProgress.updatedAt).toLocaleString()
                  : i18n.notApplicable()}
              </div>
            </div>
          )}
          {levelWithProgress?.submitLevel && (
            <div>
              <div style={styles.timeHeader}>{i18n.submittedOn()}</div>
              <div>
                {levelWithProgress.status === LevelStatus.submitted
                  ? new Date(levelWithProgress.updatedAt).toLocaleString()
                  : i18n.notApplicable()}
              </div>
              <Button
                __useDeprecatedTag
                text={i18n.unsubmit()}
                color="blue"
                onClick={this.onUnsubmit}
                id="unsubmit-button-uitest"
                disabled={levelWithProgress.status !== LevelStatus.submitted}
              />
            </div>
          )}
        </div>
        <RadiumFontAwesome
          icon="caret-right"
          onClick={this.nextStudent}
          style={styles.arrow}
        />
      </div>
    );
  }
}

const styles = {
  main: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  studentInfo: {
    minHeight: 80,
    width: 150,
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center'
  },
  bubble: {
    marginLeft: 0
  },
  name: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'bold',
    fontSize: 15
  },
  timeHeader: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'bold'
  },
  arrow: {
    fontSize: 40,
    cursor: 'pointer',
    position: 'relative',
    top: 30
  }
};
