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
    scriptId: PropTypes.number.isRequired,
    scriptName: PropTypes.string.isRequired,
    scriptTitle: PropTypes.string.isRequired,
    professionalLearningCourse: PropTypes.bool,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isRtl: PropTypes.bool.isRequired,
    sectionsInfo: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })).isRequired,
    currentCourseId: PropTypes.number,
  },

  componentDidMount() {
    // get rid of existing legend
    $(".user-stats-block .key").hide();
  },

  render() {
    const {
      professionalLearningCourse,
      scriptId,
      scriptName,
      scriptTitle,
      viewAs,
      isRtl,
      onOverviewPage,
      excludeCsfColumnInLegend,
      sectionsInfo,
      currentCourseId,
    } = this.props;

    const hasLevelProgress = Object.keys(this.props.perLevelProgress).length > 0;

    return (
      <div>
        {onOverviewPage && (
          <ScriptOverviewTopRow
            sectionsInfo={sectionsInfo}
            professionalLearningCourse={professionalLearningCourse}
            hasLevelProgress={hasLevelProgress}
            scriptId={scriptId}
            scriptName={scriptName}
            scriptTitle={scriptTitle}
            currentCourseId={currentCourseId}
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
  scriptId: state.progress.scriptId,
  scriptName: state.progress.scriptName,
  scriptTitle: state.progress.scriptTitle,
  professionalLearningCourse: state.progress.professionalLearningCourse,
  viewAs: state.stageLock.viewAs,
  isRtl: state.isRtl,
  sectionsInfo: sectionsNameAndId(state.sections),
  currentCourseId: state.progress.courseId,
}))(Radium(ScriptOverview));
