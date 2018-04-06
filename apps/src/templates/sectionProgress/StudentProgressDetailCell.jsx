import React, { PropTypes, Component } from 'react';
import ProgressBubbleSet from '@cdo/apps/templates/progress/ProgressBubbleSet';
import { levelByLesson } from '@cdo/apps/code-studio/progressRedux';
import {
  sectionDataPropType,
  scriptDataPropType,
  studentLevelProgressPropType
} from './sectionProgressRedux';

const styles = {
  bubbles: {
    overflowX: 'scroll',
    whiteSpace: 'nowrap',
  }
};

export default class StudentProgressDetailCell extends Component {
  static propTypes = {
    section: sectionDataPropType.isRequired,
    studentId: PropTypes.number.isRequired,
    stageId: PropTypes.number.isRequired,
    scriptData: scriptDataPropType.isRequired,
    studentLevelProgress: studentLevelProgressPropType.isRequired,
  };

  studentLevelProgressInStage(studentId, stageId) {
    const { scriptData, studentLevelProgress } = this.props;

    // TODO(caleybrock): Modify function call to not require
    // currentLevelId since we set it to null and don't need it here.
    const levelState = {
      stage: scriptData.stages[stageId],
      levelProgress: studentLevelProgress[studentId],
      currentLevelId: null
    };
    return levelByLesson(levelState);
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
