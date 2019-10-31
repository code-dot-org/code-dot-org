import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import {TeacherPanelProgressBubble} from '@cdo/apps/code-studio/components/progress/TeacherPanelProgressBubble';
import Button from '@cdo/apps/templates/Button';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import Radium from 'radium';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {studentShape} from './StudentTable';

const RadiumFontAwesome = Radium(FontAwesome);

const styles = {
  main: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  studentInfo: {
    width: 150,
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
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

export class SelectedStudentInfo extends React.Component {
  static propTypes = {
    students: PropTypes.arrayOf(studentShape).isRequired,
    selectedStudent: PropTypes.object,
    level: PropTypes.object,
    onSelectUser: PropTypes.func.isRequired,
    getSelectedUserId: PropTypes.func.isRequired
  };

  onUnsubmit = () => {
    $.ajax({
      url: `/user_levels/${this.props.level.id}`,
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

  onClearResponse = () => {
    $.ajax({
      url: `/user_levels/${this.props.level.id}`,
      method: 'DELETE'
    })
      .done(data => {
        // Refresh, so that we no longer have the students response loaded
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
    const {selectedStudent, level} = this.props;

    return (
      <div style={styles.main}>
        <RadiumFontAwesome
          icon="caret-left"
          onClick={this.previousStudent}
          style={styles.arrow}
        />
        <div style={styles.studentInfo}>
          <div style={styles.name}>{selectedStudent.name}</div>
          {level.paired && (
            <div>
              <div>{i18n.workedWith()}</div>
              {level.navigator && (
                <div key={level.navigator}>
                  {i18n.partner({partner: level.navigator})}
                </div>
              )}
              {level.driver && (
                <div key={level.driver}>
                  {i18n.loggedIn({partner: level.driver})}
                </div>
              )}
            </div>
          )}
          <div style={styles.bubble}>
            <TeacherPanelProgressBubble level={level} />
          </div>
          {!level.submitLevel && (
            <div>
              <div style={styles.timeHeader}>{i18n.lastUpdatedNoTime()}</div>
              <div>
                {level.status !== LevelStatus.not_tried
                  ? new Date(level.updated_at).toLocaleString()
                  : i18n.notApplicable()}
              </div>
            </div>
          )}
          {level.submitLevel && (
            <div>
              <div style={styles.timeHeader}>{i18n.submittedOn()}</div>
              <div>
                {level.status === LevelStatus.submitted
                  ? new Date(level.updated_at).toLocaleString()
                  : i18n.notApplicable()}
              </div>
              <Button
                text={i18n.unsubmit()}
                color="blue"
                onClick={this.onUnsubmit}
                id="unsubmit-button-uitest"
                disabled={level.status !== LevelStatus.submitted}
              />
            </div>
          )}
          {level.contained && (
            <Button
              text={i18n.clearResponse()}
              color="blue"
              onClick={this.onClearResponse}
              disabled={level.status === LevelStatus.not_tried}
            />
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
