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
  },
  cell: {
    padding: '1px 4px'
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

  studentLevelProgressInStage() {
    const { scriptData, studentLevelProgress, studentId, stageId } = this.props;

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

    return (
      <div style={styles.cell}>
        <div style={styles.bubbles}>
          <ProgressBubbleSet
            levels={this.studentLevelProgressInStage()}
            disabled={false}
          />
        </div>
      </div>
    );
  }
}
