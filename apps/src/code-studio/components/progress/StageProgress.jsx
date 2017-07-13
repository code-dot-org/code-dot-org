import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import experiments from '@cdo/apps/util/experiments';
import { stageProgressShape } from './types';
import StatusProgressDot from './StatusProgressDot.jsx';
import color from "../../../util/color";
import StageExtrasProgressDot from './StageExtrasProgressDot';

const styles = {
  courseOverviewContainer: {
    display: 'table-cell',
    verticalAlign: 'middle',
    paddingRight: 10
  },
  headerContainer: {
    // With our new bubble we don't want any padding above/below
    paddingTop: experiments.isEnabled('progressBubbles') ? 0 : 5,
    paddingBottom: experiments.isEnabled('progressBubbles') ? 0 : 5,
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: color.lightest_gray,
    border: `1px solid ${color.lighter_gray}`,
    borderRadius: 5
  }
};

/**
 * Stage progress component used in level header and course overview.
 */
const StageProgress = React.createClass({
  propTypes: {
    stageId: React.PropTypes.number,
    levels: stageProgressShape,
    courseOverviewPage: React.PropTypes.bool,
    stageExtrasEnabled: React.PropTypes.bool,
  },

  shouldShowStageExtras() {
    return !this.props.courseOverviewPage &&
      this.props.stageExtrasEnabled &&
      experiments.isEnabled('stageExtrasFlag');
  },

  render() {
    const progressDots = this.props.levels.map((level, index) =>
      <StatusProgressDot
        key={index}
        stageId={this.props.stageId}
        level={level}
      />
    );

    return (
      <div className="react_stage" style={this.props.courseOverviewPage ? styles.courseOverviewContainer : styles.headerContainer}>
        {progressDots}
        {this.shouldShowStageExtras() && <StageExtrasProgressDot stageId={this.props.stageId} />}
      </div>
    );
  }
});

export const UnconnectedStageProgress = StageProgress;

export default connect((state, ownProps) => {
  let levels = ownProps.levels;
  const stageId = ownProps.stageId || state.progress.currentStageId;
  if (!levels) {
    // When rendering in the context of a course page, we expect to have levels
    // passed in to us directly. Otherwise, extract them by finding the current
    // stageId
    const currentStage = _.find(state.progress.stages, stage => stage.id === stageId);
    levels = currentStage.levels;
  }

  return {
    levels,
    stageId
  };
})(StageProgress);
