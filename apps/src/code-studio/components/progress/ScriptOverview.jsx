import React from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import ScriptOverviewTopRow from './ScriptOverviewTopRow';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import ProgressTable from '@cdo/apps/templates/progress/ProgressTable';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';

/**
 * Stage progress component used in level header and script overview.
 */
const ScriptOverview = React.createClass({
  propTypes: {
    onOverviewPage: React.PropTypes.bool.isRequired,
    excludeCsfColumnInLegend: React.PropTypes.bool.isRequired,

    // redux provided
    perLevelProgress: React.PropTypes.object.isRequired,
    scriptName: React.PropTypes.string.isRequired,
    professionalLearningCourse: React.PropTypes.bool,
    viewAs: React.PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isRtl: React.PropTypes.bool.isRequired,
  },

  componentDidMount() {
    // get rid of existing legend
    $(".user-stats-block .key").hide();
  },

  render() {
    const {
      professionalLearningCourse,
      scriptName,
      viewAs,
      isRtl,
      onOverviewPage,
      excludeCsfColumnInLegend
    } = this.props;

    const hasLevelProgress = Object.keys(this.props.perLevelProgress).length > 0;

    return (
      <div>
        {onOverviewPage && (
          <ScriptOverviewTopRow
            professionalLearningCourse={professionalLearningCourse}
            hasLevelProgress={hasLevelProgress}
            scriptName={scriptName}
            viewAs={viewAs}
            isRtl={isRtl}
          />
        )}

        <ProgressTable/>
        {onOverviewPage &&
          <ProgressLegend excludeCsfColumn={excludeCsfColumnInLegend}/>
        }
      </div>
    );
  }
});

export default connect(state => ({
  perLevelProgress: state.progress.levelProgress,
  scriptName: state.progress.scriptName,
  professionalLearningCourse: state.progress.professionalLearningCourse,
  viewAs: state.stageLock.viewAs,
  isRtl: state.isRtl,
}))(Radium(ScriptOverview));
