import React from 'react';
import PropTypes from 'prop-types';
import color from '@cdo/apps/util/color';
import {studentLessonProgressType} from '@cdo/apps/templates/progress/progressTypes';

function BorderedBox({borderColor, onClick, children}) {
  const boxStyle = {
    ...styles.container,
    borderColor: borderColor
  };
  return (
    <div style={boxStyle} onClick={onClick} className="uitest-summary-cell">
      {children}
    </div>
  );
}
BorderedBox.propTypes = {
  borderColor: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  children: PropTypes.node
};
export default class ProgressTableSummaryCell extends React.Component {
  static propTypes = {
    studentId: PropTypes.number.isRequired,
    studentLessonProgress: studentLessonProgressType,
    isAssessmentLesson: PropTypes.bool,
    onSelectDetailView: PropTypes.func
  };

  heightForPercent(percent) {
    return `${percent}%`;
  }

  render() {
    const {
      studentLessonProgress,
      isAssessmentLesson,
      onSelectDetailView
    } = this.props;

    if (!studentLessonProgress) {
      return (
        <BorderedBox
          borderColor={color.light_gray}
          onClick={onSelectDetailView}
        />
      );
    }

    const borderColor = isAssessmentLesson
      ? color.level_submitted
      : color.level_perfect;

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
      <BorderedBox borderColor={borderColor} onClick={onSelectDetailView}>
        <div style={incompleteStyle} />
        <div style={imperfectStyle} />
        <div style={completedStyle} />
      </BorderedBox>
    );
  }
}

const styles = {
  container: {
    height: 20,
    margin: 10,
    boxSizing: 'border-box',
    borderWidth: 1,
    borderStyle: 'solid'
  }
};

export const unitTestExports = {
  BorderedBox
};
