import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import {TeacherPanelProgressBubble} from '@cdo/apps/code-studio/components/progress/TeacherPanelProgressBubble';
import Button from '@cdo/apps/templates/Button';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

const styles = {
  main: {
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  bubble: {
    marginLeft: 81
  },
  name: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'bold',
    fontSize: 15
  },
  timeHeader: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'bold'
  }
};

export class SelectedStudentInfo extends React.Component {
  static propTypes = {
    selectedStudent: PropTypes.object,
    level: PropTypes.object
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

  render() {
    const {selectedStudent, level} = this.props;

    return (
      <div style={styles.main}>
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
          <div>
            <Button
              text={i18n.clearResponse()}
              color="blue"
              onClick={this.onClearResponse}
              disabled={level.status === LevelStatus.not_tried}
            />
          </div>
        )}
      </div>
    );
  }
}
