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
  }
};

export class SelectedStudentInfo extends React.Component {
  static propTypes = {
    selectedStudent: PropTypes.object,
    level: PropTypes.object,
    inMiniRubricExperiment: PropTypes.bool
  };

  onUnsubmit = () => {
    console.log('unsubmit');
  };

  onClearResponse = () => {
    console.log('clear response');
  };

  render() {
    const {selectedStudent, level, inMiniRubricExperiment} = this.props;

    return (
      <div style={styles.main}>
        <div>{selectedStudent.name}</div>
        {level.paired && (
          <div>
            <div>{i18n.workedWith()}</div>
            {level.navigator && (
              <div key={level.navigator}>{`Partner: ${level.navigator}`}</div>
            )}
            {level.driver && (
              <div key={level.driver}>{`Logged in: ${level.driver}`}</div>
            )}
          </div>
        )}
        <div style={styles.bubble}>
          <TeacherPanelProgressBubble
            level={level}
            inMiniRubricExperiment={inMiniRubricExperiment}
          />
        </div>
        {level.status !== LevelStatus.not_tried &&
          level.status !== LevelStatus.submitted && (
            <div>
              <div>{i18n.lastUpdatedNoTime()}</div>
              <div>{new Date(level.updated_at).toLocaleString()}</div>
            </div>
          )}
        {level.status === LevelStatus.submitted && (
          <div>
            <div>{i18n.submittedOn()}</div>
            <div>{new Date(level.updated_at).toLocaleString()}</div>
            <Button
              text={i18n.unsubmit()}
              color="blue"
              onClick={this.onUnsubmit}
            />
          </div>
        )}
        {level.contained && level.status !== LevelStatus.not_tried && (
          <div>
            <Button
              text={i18n.clearResponse()}
              color="blue"
              onClick={this.onClearResponse}
            />
          </div>
        )}
      </div>
    );
  }
}
