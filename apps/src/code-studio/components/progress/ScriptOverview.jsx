import React, { PropTypes } from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import ScriptOverviewTopRow from './ScriptOverviewTopRow';
import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import { sectionsNameAndId } from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import ProgressTable from '@cdo/apps/templates/progress/ProgressTable';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';
import { resourceShape } from '@cdo/apps/templates/courseOverview/resourceType';
import { hasLockableStages } from '@cdo/apps/code-studio/progressRedux';

/**
 * Stage progress component used in level header and script overview.
 */
const ScriptOverview = React.createClass({
  propTypes: {
    onOverviewPage: PropTypes.bool.isRequired,
    excludeCsfColumnInLegend: PropTypes.bool.isRequired,
    teacherResources: PropTypes.arrayOf(resourceShape).isRequired,

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
    scriptHasLockableStages: PropTypes.bool.isRequired,
    scriptAllowsHiddenStages: PropTypes.bool.isRequired,
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
      teacherResources,
      scriptHasLockableStages,
      scriptAllowsHiddenStages,
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
            resources={teacherResources}
            scriptHasLockableStages={scriptHasLockableStages}
            scriptAllowsHiddenStages={scriptAllowsHiddenStages}
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
  sectionsInfo: sectionsNameAndId(state.teacherSections),
  currentCourseId: state.progress.courseId,
  scriptHasLockableStages: state.stageLock.lockableAuthorized && hasLockableStages(state.progress),
  scriptAllowsHiddenStages: state.hiddenStage.get('hideableAllowed'),
}))(Radium(ScriptOverview));
