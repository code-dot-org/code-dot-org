import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import experiments from '@cdo/apps/util/experiments';
import { stageProgressShape } from './types';
import StatusProgressDot from './StatusProgressDot.jsx';
import color from "../../../util/color";
import StageExtrasProgressDot from './StageExtrasProgressDot';
import { levelsForLessonId } from '@cdo/apps/code-studio/progressRedux';
import ProgressBubble from '@cdo/apps/templates/progress/ProgressBubble';
import { levelType } from '@cdo/apps/templates/progress/progressTypes';

const styles = {
  headerContainer: {
    // With our new bubble we don't want any padding above/below
    paddingTop: 5,
    paddingBottom: 5,
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
    stageExtrasEnabled: PropTypes.bool,

    // redux provided
    levels: (...args) => {
      const fn = experiments.isEnabled('progressBubbles') ?
        PropTypes.arrayOf(levelType).isRequired : stageProgressShape.isRequired;
      return fn(...args);
    },
    stageId: PropTypes.number.isRequired,
  },

  shouldShowStageExtras() {
    return this.props.stageExtrasEnabled &&
      experiments.isEnabled('stageExtrasFlag');
  },

  render() {
    const { levels, stageId } = this.props;
    const experimentEnabled = experiments.isEnabled('progressBubbles');

    const headerStyle = {
      ...styles.headerContainer,
      ...(experimentEnabled && {
        paddingTop: 0,
        paddingBottom: 0
      })
    };

    return (
      <div className="react_stage" style={headerStyle}>
        {!experimentEnabled && levels.map((level, index) =>
          <StatusProgressDot
            key={index}
            stageId={stageId}
            level={level}
          />
        )}
        {experimentEnabled && levels.map((level, index) =>
          <ProgressBubble
            key={index}
            level={level}
            disabled={false}
            smallBubble={!level.isCurrentLevel}
          />
        )}
        {this.shouldShowStageExtras() &&
          <StageExtrasProgressDot stageId={stageId} />
        }
      </div>
    );
  }
});

export const UnconnectedStageProgress = StageProgress;

export default connect(state => {
  const stageId = state.progress.currentStageId;

  // Extract levels by finding the current stageId
  const currentStage = _.find(state.progress.stages, stage => stage.id === stageId);

  const experimentEnabled = experiments.isEnabled('progressBubbles');

  return {
    // Without the experiment, we use StatusProgressDots, which expect levels in
    // the format provided by the server (and in our store as state.progress.stages.levels)
    // With the experiment, we use ProgressBubbles we expect our data in a
    // different form, the biggest difference being this level includes a status
    levels: experimentEnabled ? levelsForLessonId(state.progress, stageId) :
      currentStage.levels,
    stageId
  };
})(StageProgress);
