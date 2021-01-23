import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {progressStyles} from './multiGridConstants';
import FontAwesome from '../FontAwesome';

/**
 * Note: this component is being deprecated in favor of
 * ProgressTableLessonNumber and will be removed soon.
 */

class SectionProgressLessonNumberCell extends Component {
  static propTypes = {
    // Sequence number counting all stage types in order
    position: PropTypes.number.isRequired,
    // Sequence number which counts lockable lessons without lesson plans and all other lessons separately,
    relativePosition: PropTypes.number.isRequired,
    lockable: PropTypes.bool.isRequired,
    hasLessonPlan: PropTypes.bool.isRequired,
    lessonOfInterest: PropTypes.number.isRequired,
    tooltipId: PropTypes.string.isRequired,
    onSelectDetailView: PropTypes.func.isRequired
  };

  render() {
    const {
      position,
      relativePosition,
      lockable,
      hasLessonPlan,
      lessonOfInterest,
      tooltipId
    } = this.props;

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
        {lockable && !hasLessonPlan ? (
          <FontAwesome icon="lock" />
        ) : (
          relativePosition
        )}
      </div>
    );
  }
}

export const UnconnectedSectionProgressLessonNumberCell = SectionProgressLessonNumberCell;

export default connect(state => ({
  lessonOfInterest: state.sectionProgress.lessonOfInterest
}))(Radium(SectionProgressLessonNumberCell));
