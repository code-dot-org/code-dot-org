import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';

const styles = {
  container: {
    height: 20,
    margin: 10,
    boxSizing: 'border-box',
    borderWidth: 1,
    borderStyle: 'solid'
  }
};

export default class ProgressTableSummaryCell extends React.Component {
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    statusPercents: PropTypes.object,
    assessmentStage: PropTypes.bool,
    onSelectDetailView: PropTypes.func
  };

  heightForPercent(percent) {
    return `${percent}%`;
  }

  render() {
    const {statusPercents, assessmentStage} = this.props;
    const started =
      statusPercents.attempted > 0 || statusPercents.incomplete < 100;

    const boxStyle = {
      ...styles.container,
      borderColor: started
        ? assessmentStage
          ? color.level_submitted
          : color.level_perfect
        : color.light_gray
    };

    const incompleteStyle = {
      backgroundColor: color.level_not_tried,
      height: this.heightForPercent(statusPercents.incomplete)
    };

    const imperfectStyle = {
      backgroundColor: color.level_passed,
      height: this.heightForPercent(statusPercents.imperfect)
    };

    const completedStyle = {
      backgroundColor: assessmentStage
        ? color.level_submitted
        : color.level_perfect,
      height: this.heightForPercent(statusPercents.completed)
    };

    return (
      <div style={boxStyle} onClick={this.props.onSelectDetailView}>
        <div style={incompleteStyle} />
        <div style={imperfectStyle} />
        <div style={completedStyle} />
      </div>
    );
  }
}
