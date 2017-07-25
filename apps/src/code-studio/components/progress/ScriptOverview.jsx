import React, { PropTypes } from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import ScriptOverviewTopRow from './ScriptOverviewTopRow';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import { sectionsNameAndId } from '@cdo/apps/code-studio/sectionsRedux';
import ProgressTable from '@cdo/apps/templates/progress/ProgressTable';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';

/**
 * Stage progress component used in level header and script overview.
 */
const ScriptOverview = React.createClass({
  propTypes: {
    onOverviewPage: PropTypes.bool.isRequired,
    excludeCsfColumnInLegend: PropTypes.bool.isRequired,

    // redux provided
    perLevelProgress: PropTypes.object.isRequired,
    scriptName: PropTypes.string.isRequired,
    professionalLearningCourse: PropTypes.bool,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isRtl: PropTypes.bool.isRequired,
    sectionsInfo: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })).isRequired,
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
      excludeCsfColumnInLegend,
      sectionsInfo,
    } = this.props;

    const hasLevelProgress = Object.keys(this.props.perLevelProgress).length > 0;

    return (
      <div>
        {onOverviewPage && (
          <ScriptOverviewTopRow
            sectionsInfo={sectionsInfo}
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
  sectionsInfo: sectionsNameAndId(state.sections)
}))(Radium(ScriptOverview));
