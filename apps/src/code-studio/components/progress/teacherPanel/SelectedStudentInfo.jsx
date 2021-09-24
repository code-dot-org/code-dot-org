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

    // While levelWithProgress is loading display arrows and student name only
    if (!levelWithProgress) {
      return (
        <div style={styles.main}>
          <RadiumFontAwesome
            icon="caret-left"
            onClick={this.previousStudent}
            style={styles.arrow}
          />
          <div style={styles.studentInfo}>
            <div style={styles.name}>{selectedStudent.name}</div>
          </div>
          <RadiumFontAwesome
            icon="caret-right"
            onClick={this.nextStudent}
            style={styles.arrow}
          />
        </div>
      );
    }

    const {
      isDriver,
      isNavigator,
      driver,
      navigators,
      submitLevel,
      status,
      updatedAt
    } = levelWithProgress;

    const paired = isDriver || isNavigator;
    const partner =
      (isDriver && navigators && navigators[0]) ||
      (isNavigator && driver) ||
      i18n.pairingUnknownPartnerName();

    return (
      <div style={styles.main}>
        <RadiumFontAwesome
          icon="caret-left"
          onClick={this.previousStudent}
          style={styles.arrow}
        />
        <div style={styles.studentInfo}>
          <div style={styles.name}>{selectedStudent.name}</div>
          {paired && (
            <div>
              <div>{i18n.workedWith()}</div>
              {isDriver && <div>{i18n.partner({partner: partner})}</div>}
              {isNavigator && <div>{i18n.loggedIn({partner: partner})}</div>}
            </div>
          )}
          <div style={styles.bubble}>
            <ProgressBubble
              level={levelWithProgress}
              disabled={true}
              hideTooltips={true}
              hideAssessmentBadge={true}
            />
          </div>
          {!submitLevel && (
            <div>
              <div style={styles.timeHeader}>{i18n.lastUpdatedNoTime()}</div>
              <div>
                {status !== LevelStatus.not_tried && updatedAt
                  ? new Date(updatedAt).toLocaleString()
                  : i18n.notApplicable()}
              </div>
            </div>
          )}
          {submitLevel && (
            <div>
              <div style={styles.timeHeader}>{i18n.submittedOn()}</div>
              <div>
                {status === LevelStatus.submitted
                  ? new Date(updatedAt).toLocaleString()
                  : i18n.notApplicable()}
              </div>
              <Button
                __useDeprecatedTag
                text={i18n.unsubmit()}
                color="blue"
                onClick={this.onUnsubmit}
                id="unsubmit-button-uitest"
                disabled={status !== LevelStatus.submitted}
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
    alignItems: 'center',
    flexDirection: 'column'
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
