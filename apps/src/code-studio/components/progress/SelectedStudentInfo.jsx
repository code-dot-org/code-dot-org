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
  }
};

export class SelectedStudentInfo extends React.Component {
  static propTypes = {
    selectedStudent: PropTypes.object,
    level: PropTypes.object,
    inMiniRubricExperiment: PropTypes.bool
  };

  render() {
    const {selectedStudent, level, inMiniRubricExperiment} = this.props;

    return (
      <div style={styles.main}>
        <div>{selectedStudent.name}</div>
        {level.paired && (
          <div>
            <div>{i18n.workedWith()}</div>
            {level.navigators.length > 0 &&
              level.navigators.map(navigator => (
                <div key={navigator}>{`Partner: ${navigator}`}</div>
              ))}
            {level.drivers.length > 0 &&
              level.drivers.map(driver => (
                <div key={driver}>{`Logged in: ${driver}`}</div>
              ))}
          </div>
        )}
        <TeacherPanelProgressBubble
          level={level}
          inMiniRubricExperiment={inMiniRubricExperiment}
        />
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
            <Button text={i18n.unsubmit()} color="blue" onClick={() => {}} />
          </div>
        )}
      </div>
    );
  }
}
