import React, { PropTypes, Component } from 'react';
import ProgressBox from '../sectionProgress/ProgressBox';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import Radium from 'radium';

class StudentProgressSummaryCell extends Component {
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    style: PropTypes.object,
    levelsByLesson: PropTypes.arrayOf(PropTypes.object),
  };

  studentLevelProgressInStage() {
    const { levelsByLesson } = this.props;

    // Get counts of statuses
    let statusCounts = {
      total: levelsByLesson.length,
      completed: 0,
      imperfect: 0,
      incomplete: 0,
      attempted: 0,
    };
    for (let i = 0; i <levelsByLesson.length; i++) {
      const status = levelsByLesson[i].status;
      switch (status) {
        case LevelStatus.perfect:
        case LevelStatus.submitted:
          statusCounts.completed = statusCounts.completed + 1;
          break;
        case LevelStatus.not_tried:
          statusCounts.incomplete = statusCounts.incomplete + 1;
          break;
        case LevelStatus.attempted:
          statusCounts.incomplete = statusCounts.incomplete + 1;
          statusCounts.attempted = statusCounts.attempted + 1;
          break;
        case LevelStatus.passed:
          statusCounts.imperfect = statusCounts.imperfect + 1;
          break;
        // All others are assumed to be not tried
        default:
          statusCounts.incomplete = statusCounts.incomplete + 1;
      }

    }
    return statusCounts;
  }

  render() {
    const totalPixels = 20;
    const statusCounts = this.studentLevelProgressInStage();
    const perfectPixels = Math.floor((statusCounts.completed / statusCounts.total) * totalPixels);
    const imperfectPixels = Math.floor((statusCounts.imperfect / statusCounts.total) * totalPixels);
    const incompletePixels = totalPixels - perfectPixels - imperfectPixels;
    const started = (statusCounts.attempted > 0) || (statusCounts.incomplete !== statusCounts.total);

    return (
      <div style={this.props.style}>
        <ProgressBox
          started={started}
          incomplete={incompletePixels}
          imperfect={imperfectPixels}
          perfect={perfectPixels}
        />
      </div>
    );
  }
}

export default Radium(StudentProgressSummaryCell);
