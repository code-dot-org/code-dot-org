import React, { PropTypes, Component } from 'react';
import ProgressBubbleSet from '@cdo/apps/templates/progress/ProgressBubbleSet';
import { levelByLesson } from '@cdo/apps/code-studio/progressRedux';

const styles = {
  bubbles: {
    overflowX: 'scroll',
    whiteSpace: 'nowrap',
  }
};

export default class StudentProgressDetailCell extends Component {
  static propTypes = {
    section: PropTypes.shape({
      id: PropTypes.number.isRequired,
      students: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      })).isRequired
    }).isRequired,
    studentId: PropTypes.number.isRequired,
    stageId: PropTypes.number.isRequired,
    scriptData: PropTypes.shape({
      stages: PropTypes.arrayOf(PropTypes.shape({
        levels: PropTypes.arrayOf(PropTypes.object).isRequired
      })),
      id: PropTypes.number.isRequired,
    }).isRequired,
    studentLevelProgress: PropTypes.objectOf(
      PropTypes.objectOf(PropTypes.number)
    ).isRequired,
  };

  studentLevelProgressInStage(studentId, stageId) {
    const { scriptData, studentLevelProgress } = this.props;

    const fakeState = {
      stage: scriptData.stages[stageId],
      levelProgress: studentLevelProgress[studentId],
      currentLevelId: null
    };
    return levelByLesson(fakeState);
  }

  render() {
    const { studentId, stageId } = this.props;

    return (
      <div>
        <div style={styles.bubbles}>
          <ProgressBubbleSet
            levels={this.studentLevelProgressInStage(studentId, stageId)}
            disabled={false}
          />
        </div>
      </div>
    );
  }
}
