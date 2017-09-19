import React, { PropTypes } from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import ScriptOverviewTopRow, {
  NOT_STARTED,
  IN_PROGRESS,
  COMPLETED,
} from './ScriptOverviewTopRow';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import { sectionsNameAndId } from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import ProgressTable from '@cdo/apps/templates/progress/ProgressTable';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';
import { resourceShape } from '@cdo/apps/templates/courseOverview/resourceType';
import { hasLockableStages, SignInState } from '@cdo/apps/code-studio/progressRedux';
import VerifiedResourcesNotification from '@cdo/apps/templates/courseOverview/VerifiedResourcesNotification';

const styles = {
  notification: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  }
};

/**
 * Stage progress component used in level header and script overview.
 */
const ScriptOverview = React.createClass({
  propTypes: {
    onOverviewPage: PropTypes.bool.isRequired,
    excludeCsfColumnInLegend: PropTypes.bool.isRequired,
    teacherResources: PropTypes.arrayOf(resourceShape).isRequired,

    // redux provided
    isSignedIn: PropTypes.bool.isRequired,
    isVerifiedTeacher: PropTypes.bool.isRequired,
    hasVerifiedResources: PropTypes.bool.isRequired,
    perLevelProgress: PropTypes.object.isRequired,
    scriptCompleted: PropTypes.bool.isRequired,
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
      onOverviewPage,
      excludeCsfColumnInLegend,
      teacherResources,
      isSignedIn,
      isVerifiedTeacher,
      hasVerifiedResources,
      perLevelProgress,
      scriptCompleted,
      scriptId,
      scriptName,
      scriptTitle,
      professionalLearningCourse,
      viewAs,
      isRtl,
      sectionsInfo,
      currentCourseId,
      scriptHasLockableStages,
      scriptAllowsHiddenStages,
    } = this.props;

    let scriptProgress = NOT_STARTED;
    if (scriptCompleted) {
      scriptProgress = COMPLETED;
    } else if (Object.keys(perLevelProgress).length > 0) {
      scriptProgress = IN_PROGRESS;
    }

    const showNotification = viewAs === ViewType.Teacher && isSignedIn &&
      !isVerifiedTeacher && hasVerifiedResources;

    return (
      <div>
        {onOverviewPage && (
          <div>
            {showNotification &&
              <div style={styles.notification}>
                <VerifiedResourcesNotification width={1100}/>
              </div>
            }
            <ScriptOverviewTopRow
              sectionsInfo={sectionsInfo}
              professionalLearningCourse={professionalLearningCourse}
              scriptProgress={scriptProgress}
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
          </div>
        )}

        <ProgressTable/>
        {onOverviewPage &&
          <ProgressLegend excludeCsfColumn={excludeCsfColumnInLegend}/>
        }
      </div>
    );
  }
});

export const UnconnectedScriptOverview = ScriptOverview;

export default connect(state => ({
  isSignedIn: state.progress.signInState === SignInState.SignedIn,
  isVerifiedTeacher: state.verifiedTeacher.isVerified,
  hasVerifiedResources: state.verifiedTeacher.hasVerifiedResources,
  perLevelProgress: state.progress.levelProgress,
  scriptCompleted: !!state.progress.scriptCompleted,
  scriptId: state.progress.scriptId,
  scriptName: state.progress.scriptName,
  scriptTitle: state.progress.scriptTitle,
  professionalLearningCourse: state.progress.professionalLearningCourse,
  viewAs: state.viewAs,
  isRtl: state.isRtl,
  sectionsInfo: sectionsNameAndId(state.teacherSections),
  currentCourseId: state.progress.courseId,
  scriptHasLockableStages: state.stageLock.lockableAuthorized && hasLockableStages(state.progress),
  scriptAllowsHiddenStages: state.hiddenStage.hideableStagesAllowed,
}))(Radium(ScriptOverview));
