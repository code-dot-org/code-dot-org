import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
import {progressStyles} from "./multiGridConstants";
import {jumpToLessonDetails} from './sectionProgressRedux';

class SectionProgressLessonNumberCell extends Component {
  static propTypes = {
    lessonNumber: PropTypes.number.isRequired,
    jumpToLessonDetails: PropTypes.func.isRequired,
  };

  render() {
    const {lessonNumber, jumpToLessonDetails} = this.props;
    return (
      <div
        style={progressStyles.lessonNumberHeading}
        onClick={() => jumpToLessonDetails(lessonNumber)}
      >
        {lessonNumber}
      </div>
    );
  }
}

export const UnconnectedSectionProgressLessonNumberCell = SectionProgressLessonNumberCell;

export default connect(state => ({}), dispatch => ({
  jumpToLessonDetails(lessonOfInterest) {
    dispatch(jumpToLessonDetails(lessonOfInterest));
  }
}))(Radium(SectionProgressLessonNumberCell));
