import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ProgressBubbleSet from '@cdo/apps/templates/progress/ProgressBubbleSet';

const styles = {
  bubbles: {
    whiteSpace: 'nowrap'
  },
  cell: {
    padding: '1px 4px'
  }
};

export default class StudentProgressDetailCell extends Component {
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    stageId: PropTypes.number.isRequired,
    sectionId: PropTypes.number.isRequired,
    levelsWithStatus: PropTypes.arrayOf(PropTypes.object),
    stageExtrasEnabled: PropTypes.bool
  };

  render() {
    return (
      <div style={styles.cell} className="uitest-detail-cell">
        <div style={styles.bubbles}>
          <ProgressBubbleSet
            levels={this.props.levelsWithStatus}
            disabled={false}
            hideToolTips={true}
            selectedSectionId={this.props.sectionId}
            selectedStudentId={this.props.studentId}
            pairingIconEnabled={true}
            stageExtrasEnabled={this.props.stageExtrasEnabled}
            hideAssessmentIcon={true}
            showSublevels={true}
          />
        </div>
      </div>
    );
  }
}
