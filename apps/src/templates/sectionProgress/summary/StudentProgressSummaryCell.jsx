import React, {Component} from 'react';
import ProgressBox from '@cdo/apps/templates/sectionProgress/ProgressBox';
import PropTypes from 'prop-types';
import Radium from 'radium';

class StudentProgressSummaryCell extends Component {
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    style: PropTypes.object,
    statusCounts: PropTypes.object,
    assessmentStage: PropTypes.bool,
    onSelectDetailView: PropTypes.func
  };

  render() {
    const totalPixels = 20;
    const {statusCounts, assessmentStage} = this.props;
    const perfectPixels =
      statusCounts.total > 0
        ? Math.floor(
            (statusCounts.completed / statusCounts.total) * totalPixels
          )
        : 0;
    const imperfectPixels =
      statusCounts.total > 0
        ? Math.floor(
            (statusCounts.imperfect / statusCounts.total) * totalPixels
          )
        : 0;
    const incompletePixels = totalPixels - perfectPixels - imperfectPixels;
    const started =
      statusCounts.attempted > 0 ||
      statusCounts.incomplete !== statusCounts.total;

    return (
      <div
        style={this.props.style}
        onClick={this.props.onSelectDetailView}
        className="uitest-summary-cell"
      >
        <ProgressBox
          started={started}
          incomplete={incompletePixels}
          imperfect={imperfectPixels}
          perfect={perfectPixels}
          stageIsAllAssessment={assessmentStage}
        />
      </div>
    );
  }
}

export default Radium(StudentProgressSummaryCell);
