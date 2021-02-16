import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import {studentLessonProgressType} from '@cdo/apps/templates/progress/progressTypes';

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
    studentLessonProgress: studentLessonProgressType.isRequired,
    isAssessmentLesson: PropTypes.bool,
    onSelectDetailView: PropTypes.func
  };

  heightForPercent(percent) {
    return `${percent}%`;
  }

  render() {
    const {studentLessonProgress, isAssessmentLesson} = this.props;

    const boxStyle = {
      ...styles.container,
      borderColor: studentLessonProgress.isStarted
        ? isAssessmentLesson
          ? color.level_submitted
          : color.level_perfect
        : color.light_gray
    };

    const incompleteStyle = {
      backgroundColor: color.level_not_tried,
      height: this.heightForPercent(studentLessonProgress.incompletePercent)
    };

    const imperfectStyle = {
      backgroundColor: color.level_passed,
      height: this.heightForPercent(studentLessonProgress.imperfectPercent)
    };

    const completedStyle = {
      backgroundColor: isAssessmentLesson
        ? color.level_submitted
        : color.level_perfect,
      height: this.heightForPercent(studentLessonProgress.completedPercent)
    };

    return (
      <div
        style={boxStyle}
        onClick={this.props.onSelectDetailView}
        className="uitest-summary-cell"
      >
        <div style={incompleteStyle} />
        <div style={imperfectStyle} />
        <div style={completedStyle} />
      </div>
    );
  }
}
