import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import ScriptOverviewTopRow, {
  NOT_STARTED,
  IN_PROGRESS,
  COMPLETED
} from './ScriptOverviewTopRow';
import RedirectDialog from '@cdo/apps/code-studio/components/RedirectDialog';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {sectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import ProgressTable from '@cdo/apps/templates/progress/ProgressTable';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';
import {resourceShape} from '@cdo/apps/templates/courseOverview/resourceType';
import ScriptOverviewHeader from './ScriptOverviewHeader';
import {isScriptHiddenForSection} from '@cdo/apps/code-studio/hiddenStageRedux';
import {
  onDismissRedirectDialog,
  dismissedRedirectDialog
} from '@cdo/apps/util/dismissVersionRedirect';
import {
  assignmentVersionShape,
  sectionForDropdownShape
} from '@cdo/apps/templates/teacherDashboard/shapes';

/**
 * Stage progress component used in level header and script overview.
 */
class ScriptOverview extends React.Component {
  static propTypes = {
    id: PropTypes.number,
    courseId: PropTypes.number,
    onOverviewPage: PropTypes.bool.isRequired,
    excludeCsfColumnInLegend: PropTypes.bool.isRequired,
    teacherResources: PropTypes.arrayOf(resourceShape).isRequired,
    showCourseUnitVersionWarning: PropTypes.bool,
    showScriptVersionWarning: PropTypes.bool,
    redirectScriptUrl: PropTypes.string,
    showRedirectWarning: PropTypes.bool,
    versions: PropTypes.arrayOf(assignmentVersionShape).isRequired,
    courseName: PropTypes.string,
    showAssignButton: PropTypes.bool,
    assignedSectionId: PropTypes.number,
    minimal: PropTypes.bool,

    // redux provided
    perLevelProgress: PropTypes.object.isRequired,
    scriptCompleted: PropTypes.bool.isRequired,
    scriptId: PropTypes.number.isRequired,
    scriptName: PropTypes.string.isRequired,
    scriptTitle: PropTypes.string.isRequired,
    professionalLearningCourse: PropTypes.bool,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isRtl: PropTypes.bool.isRequired,
    sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    currentCourseId: PropTypes.number,
    hiddenStageState: PropTypes.object,
    selectedSectionId: PropTypes.number,
    userId: PropTypes.number
  };

  constructor(props) {
    super(props);
    const showRedirectDialog =
      props.redirectScriptUrl && props.redirectScriptUrl.length > 0;
    this.state = {showRedirectDialog};
  }

  onCloseRedirectDialog = () => {
    const {courseName, scriptName} = this.props;
    // Use course name if available, and script name if not.
    onDismissRedirectDialog(courseName || scriptName);
    this.setState({
      showRedirectDialog: false
    });
  };

  render() {
    const {
      onOverviewPage,
      excludeCsfColumnInLegend,
      teacherResources,
      perLevelProgress,
      scriptCompleted,
      scriptId,
      scriptName,
      scriptTitle,
      professionalLearningCourse,
      viewAs,
      isRtl,
      sectionsForDropdown,
      currentCourseId,
      showCourseUnitVersionWarning,
      showScriptVersionWarning,
      showRedirectWarning,
      redirectScriptUrl,
      versions,
      hiddenStageState,
      selectedSectionId,
      courseName,
      showAssignButton,
      userId,
      assignedSectionId,
      minimal
    } = this.props;

    const displayRedirectDialog =
      redirectScriptUrl && !dismissedRedirectDialog(courseName || scriptName);

    let scriptProgress = NOT_STARTED;
    if (scriptCompleted) {
      scriptProgress = COMPLETED;
    } else if (Object.keys(perLevelProgress).length > 0) {
      scriptProgress = IN_PROGRESS;
    }

    const isHiddenUnit =
      !!selectedSectionId &&
      !!scriptId &&
      isScriptHiddenForSection(hiddenStageState, selectedSectionId, scriptId);

    return (
      <div>
        {onOverviewPage && (
          <div>
            {displayRedirectDialog && (
              <RedirectDialog
                isOpen={this.state.showRedirectDialog}
                details={i18n.assignedToNewerVersion()}
                handleClose={this.onCloseRedirectDialog}
                redirectUrl={redirectScriptUrl}
                redirectButtonText={i18n.goToAssignedVersion()}
              />
            )}
            <ScriptOverviewHeader
              showCourseUnitVersionWarning={showCourseUnitVersionWarning}
              showScriptVersionWarning={showScriptVersionWarning}
              showRedirectWarning={showRedirectWarning}
              showHiddenUnitWarning={isHiddenUnit}
              versions={versions}
              courseName={courseName}
              userId={userId}
            />
            <ScriptOverviewTopRow
              sectionsForDropdown={sectionsForDropdown}
              selectedSectionId={parseInt(selectedSectionId)}
              professionalLearningCourse={professionalLearningCourse}
              scriptProgress={scriptProgress}
              scriptId={scriptId}
              scriptName={scriptName}
              scriptTitle={scriptTitle}
              currentCourseId={currentCourseId}
              viewAs={viewAs}
              isRtl={isRtl}
              resources={teacherResources}
              showAssignButton={showAssignButton}
              assignedSectionId={assignedSectionId}
            />
          </div>
        )}
        <ProgressTable minimal={minimal} />
        {onOverviewPage && (
          <ProgressLegend excludeCsfColumn={excludeCsfColumnInLegend} />
        )}
      </div>
    );
  }
}

export const UnconnectedScriptOverview = Radium(ScriptOverview);
export default connect((state, ownProps) => ({
  perLevelProgress: state.progress.levelProgress,
  scriptCompleted: !!state.progress.scriptCompleted,
  scriptId: state.progress.scriptId,
  scriptName: state.progress.scriptName,
  scriptTitle: state.progress.scriptTitle,
  professionalLearningCourse: state.progress.professionalLearningCourse,
  viewAs: state.viewAs,
  isRtl: state.isRtl,
  currentCourseId: state.progress.courseId,
  hiddenStageState: state.hiddenStage,
  selectedSectionId: parseInt(state.teacherSections.selectedSectionId),
  sectionsForDropdown: sectionsForDropdown(
    state.teacherSections,
    ownProps.id,
    ownProps.courseId,
    false
  )
}))(UnconnectedScriptOverview);
