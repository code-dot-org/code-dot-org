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
    // While this userLevel object does have the properties of a levelType,
    // it is conceptually more similar to a userLevel object. For example,
    // the id property of this object is the user_level id. To get the level
    // id, use the level_id property.
    userLevel: PropTypes.object,
    onSelectUser: PropTypes.func.isRequired,
    getSelectedUserId: PropTypes.func.isRequired
  };

  onUnsubmit = () => {
    $.ajax({
      url: `/user_levels/${this.props.userLevel.id}`,
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
      url: `/user_levels/${this.props.userLevel.id}`,
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
    const {selectedStudent, userLevel} = this.props;

    return (
      <div style={styles.main}>
        <RadiumFontAwesome
          icon="caret-left"
          onClick={this.previousStudent}
          style={styles.arrow}
        />
        <div style={styles.studentInfo}>
          <div style={styles.name}>{selectedStudent.name}</div>
          {userLevel.paired && (
            <div>
              <div>{i18n.workedWith()}</div>
              {userLevel.navigator && (
                <div key={userLevel.navigator}>
                  {i18n.partner({partner: userLevel.navigator})}
                </div>
              )}
              {userLevel.driver && (
                <div key={userLevel.driver}>
                  {i18n.loggedIn({partner: userLevel.driver})}
                </div>
              )}
            </div>
          )}
          <div style={styles.bubble}>
            <TeacherPanelProgressBubble userLevel={userLevel} />
          </div>
          {!userLevel.submitLevel && (
            <div>
              <div style={styles.timeHeader}>{i18n.lastUpdatedNoTime()}</div>
              <div>
                {userLevel.status !== LevelStatus.not_tried
                  ? new Date(userLevel.updated_at).toLocaleString()
                  : i18n.notApplicable()}
              </div>
            </div>
          )}
          {userLevel.submitLevel && (
            <div>
              <div style={styles.timeHeader}>{i18n.submittedOn()}</div>
              <div>
                {userLevel.status === LevelStatus.submitted
                  ? new Date(userLevel.updated_at).toLocaleString()
                  : i18n.notApplicable()}
              </div>
              <Button
                __useDeprecatedTag
                text={i18n.unsubmit()}
                color="blue"
                onClick={this.onUnsubmit}
                id="unsubmit-button-uitest"
                disabled={userLevel.status !== LevelStatus.submitted}
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
