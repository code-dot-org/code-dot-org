import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
import {progressStyles} from "./multiGridConstants";
import FontAwesome from '../FontAwesome';

class SectionProgressLessonNumberCell extends Component {
  static propTypes = {
    // Sequence number counting all stage types in order
    position: PropTypes.number.isRequired,
    // Sequence number which counts lockable and non-lockable stages separately,
    // explained further in Stage#summarize
    relativePosition: PropTypes.number.isRequired,
    lockable: PropTypes.bool.isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    tooltipId: PropTypes.string.isRequired,
    onSelectDetailView: PropTypes.func.isRequired,
  };

  render() {
    const {position, relativePosition, lockable, lessonOfInterest, tooltipId} = this.props;

    let cellStyle = progressStyles.lessonNumberHeading;
    if (position === lessonOfInterest) {
      cellStyle = {
        ...cellStyle,
        ...progressStyles.lessonOfInterest
      };
    }

    return (
      <div
        style={cellStyle}
        onClick={this.props.onSelectDetailView}
        data-tip
        data-for={tooltipId}
      >
        {lockable ? <FontAwesome icon="lock"/> : relativePosition}
      </div>
    );
  }
}

export const UnconnectedSectionProgressLessonNumberCell = SectionProgressLessonNumberCell;

export default connect(state => ({
  lessonOfInterest: state.sectionProgress.lessonOfInterest,
}))(Radium(SectionProgressLessonNumberCell));
