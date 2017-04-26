import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import _ from 'lodash';
import experiments from '@cdo/apps/util/experiments';
import { stageShape } from './types';
import CourseProgressRow from './CourseProgressRow';
import CourseOverviewTopRow from './CourseOverviewTopRow';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import color from "@cdo/apps/util/color";
import ProgressTable from '@cdo/apps/templates/progress/ProgressTable';

const styles = {
  flexHeader: {
    padding: '8px 11px',
    margin: '20px 0 0 0',
    borderRadius: 5,
    background: color.cyan,
    color: color.white
  }
};

/**
 * Stage progress component used in level header and course overview.
 */
const CourseProgress = React.createClass({
  propTypes: {
    onOverviewPage: React.PropTypes.bool.isRequired,

    // redux provided
    perLevelProgress: React.PropTypes.object.isRequired,
    scriptName: React.PropTypes.string.isRequired,
    professionalLearningCourse: React.PropTypes.bool,
    focusAreaPositions: React.PropTypes.arrayOf(React.PropTypes.number),
    stages: React.PropTypes.arrayOf(stageShape),
    peerReviewStage: stageShape,
    viewAs: React.PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isRtl: React.PropTypes.bool.isRequired,
  },

  render() {
    const {
      stages,
      peerReviewStage,
      professionalLearningCourse,
      focusAreaPositions,
      scriptName,
      viewAs,
      isRtl,
      onOverviewPage
    } = this.props;
    const groups = _.groupBy(stages, stage => (stage.flex_category || 'Content'));
    const showGroupHeaders = _.size(groups) > 1;
    // Add an additional group for any peer reviews
    if (peerReviewStage) {
      // peerReviewStage.flex_category will always be "Peer Review" here
      groups[peerReviewStage.flex_category] = [peerReviewStage];
    }

    let count = 1;

    const hasLevelProgress = Object.keys(this.props.perLevelProgress).length > 0;

    const progressRedesign = experiments.isEnabled('progressRedesign');

    return (
      <div>
        {onOverviewPage && (
          <CourseOverviewTopRow
            professionalLearningCourse={professionalLearningCourse}
            hasLevelProgress={hasLevelProgress}
            scriptName={scriptName}
            viewAs={viewAs}
            isRtl={isRtl}
          />
        )}

        {progressRedesign && <ProgressTable/>}

        {!progressRedesign && (
          <div className="user-stats-block">
            {_.map(groups, (stages, group) =>
              <div key={group}>
                {showGroupHeaders &&
                  <h4
                    id={group.toLowerCase().replace(' ', '-')}
                    style={[
                      styles.flexHeader,
                      !professionalLearningCourse && {background: color.purple},
                      count === 1 && {margin: '2px 0 0 0'}
                    ]}
                  >
                    {group}
                  </h4>
                }
                {stages.map(stage =>
                  <CourseProgressRow
                    stage={stage}
                    key={stage.name}
                    isFocusArea={focusAreaPositions.indexOf(count++) > -1}
                    professionalLearningCourse={professionalLearningCourse}
                  />
                )}
              </div>
            )
          }
        </div>
        )}
      </div>
    );
  }
});

export default connect(state => ({
  perLevelProgress: state.progress.levelProgress,
  scriptName: state.progress.scriptName,
  professionalLearningCourse: state.progress.professionalLearningCourse,
  focusAreaPositions: state.progress.focusAreaPositions,
  stages: state.progress.stages,
  peerReviewStage: state.progress.peerReviewStage,
  viewAs: state.stageLock.viewAs,
  isRtl: state.isRtl,
}))(Radium(CourseProgress));
