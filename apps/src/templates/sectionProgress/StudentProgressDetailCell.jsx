import React, { PropTypes, Component } from 'react';
import ProgressBubbleSet from '@cdo/apps/templates/progress/ProgressBubbleSet';

const styles = {
  bubbles: {
    whiteSpace: 'nowrap',
  },
  cell: {
    padding: '1px 4px'
  }
};

export default class StudentProgressDetailCell extends Component {
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    stageId: PropTypes.number.isRequired,
    levelsByLesson: PropTypes.arrayOf(PropTypes.object),
  };

  render() {

    return (
      <div style={styles.cell}>
        <div style={styles.bubbles}>
          <ProgressBubbleSet
            levels={this.props.levelsByLesson}
            disabled={false}
            hideToolTips={true}
          />
        </div>
      </div>
    );
  }
}
