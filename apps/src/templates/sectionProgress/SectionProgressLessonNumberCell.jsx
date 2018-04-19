import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
import {progressStyles} from "./multiGridConstants";
import {jumpToLessonDetails} from './sectionProgressRedux';

class SectionProgressLessonNumberCell extends Component {
  static propTypes = {
    lessonNumber: PropTypes.number.isRequired,
    jumpToLessonDetails: PropTypes.func.isRequired,
    lessonOfInterest: PropTypes.number.isRequired
  };

  render() {
    const {lessonNumber, jumpToLessonDetails, lessonOfInterest} = this.props;

    let cellStyle = {
      ...progressStyles.lessonNumberHeading
    };

    if (lessonNumber === lessonOfInterest) {
      cellStyle = {
        ...cellStyle,
        ...progressStyles.lessonOfInterest
      };
    }

    return (
      <div
        style={cellStyle}
        onClick={() => jumpToLessonDetails(lessonNumber)}
      >
        {lessonNumber}
      </div>
    );
  }
}

export const UnconnectedSectionProgressLessonNumberCell = SectionProgressLessonNumberCell;

export default connect(state => ({
  lessonOfInterest: state.sectionProgress.lessonOfInterest,
}), dispatch => ({
  jumpToLessonDetails(lessonOfInterest) {
    dispatch(jumpToLessonDetails(lessonOfInterest));
  }
}))(Radium(SectionProgressLessonNumberCell));
