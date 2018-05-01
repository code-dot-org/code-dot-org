import React, { PropTypes, Component } from 'react';
import ProgressBox from '../sectionProgress/ProgressBox';
import { summarizeProgressInStage } from '@cdo/apps/templates/progress/progressHelpers';
import Radium from 'radium';

class StudentProgressSummaryCell extends Component {
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    style: PropTypes.object,
    levelsWithStatus: PropTypes.arrayOf(PropTypes.object),
  };

  render() {
    const totalPixels = 20;
    const statusCounts = summarizeProgressInStage(this.props.levelsWithStatus);
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
