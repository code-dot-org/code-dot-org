import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import UnitOverviewTopRow, {
  NOT_STARTED,
  IN_PROGRESS,
  COMPLETED
} from './UnitOverviewTopRow';
import RedirectDialog from '@cdo/apps/code-studio/components/RedirectDialog';
import UnversionedScriptRedirectDialog from '@cdo/apps/code-studio/components/UnversionedScriptRedirectDialog';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {sectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import ProgressTable from '@cdo/apps/templates/progress/ProgressTable';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';
import {resourceShape} from '@cdo/apps/templates/courseOverview/resourceType';
import {resourceShape as migratedResourceShape} from '@cdo/apps/lib/levelbuilder/shapes';
import UnitOverviewHeader from './UnitOverviewHeader';
import {isScriptHiddenForSection} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {
  onDismissRedirectDialog,
  dismissedRedirectDialog
} from '@cdo/apps/util/dismissVersionRedirect';
import {
  assignmentVersionShape,
  sectionForDropdownShape
} from '@cdo/apps/templates/teacherDashboard/shapes';
import {unitCalendarLesson} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';
import GoogleClassroomAttributionLabel from '@cdo/apps/templates/progress/GoogleClassroomAttributionLabel';
import UnitCalendar from './UnitCalendar';
import color from '@cdo/apps/util/color';
import {shouldShowReviewStates} from '@cdo/apps/templates/progress/progressHelpers';

/**
 * Lesson progress component used in level header and script overview.
 */
class UnitOverview extends React.Component {
  static propTypes = {
    id: PropTypes.number,
    courseId: PropTypes.number,
    courseTitle: PropTypes.string,
    courseLink: PropTypes.string,
    onOverviewPage: PropTypes.bool.isRequired,
    excludeCsfColumnInLegend: PropTypes.bool.isRequired,
    teacherResources: PropTypes.arrayOf(resourceShape),
    migratedTeacherResources: PropTypes.arrayOf(migratedResourceShape),
    studentResources: PropTypes.arrayOf(migratedResourceShape),
    showCourseUnitVersionWarning: PropTypes.bool,
    showScriptVersionWarning: PropTypes.bool,
    redirectScriptUrl: PropTypes.string,
    showRedirectWarning: PropTypes.bool,
    versions: PropTypes.arrayOf(assignmentVersionShape).isRequired,
    courseName: PropTypes.string,
    showAssignButton: PropTypes.bool,
    assignedSectionId: PropTypes.number,
    minimal: PropTypes.bool,
    unitCalendarLessons: PropTypes.arrayOf(unitCalendarLesson),
    weeklyInstructionalMinutes: PropTypes.number,
    showCalendar: PropTypes.bool,
    isMigrated: PropTypes.bool,
    scriptOverviewPdfUrl: PropTypes.string,
    scriptResourcesPdfUrl: PropTypes.string,
    showUnversionedRedirectWarning: PropTypes.bool,

    // redux provided
    perLevelResults: PropTypes.object.isRequired,
    unitCompleted: PropTypes.bool.isRequired,
    unitData: PropTypes.object.isRequired,
    scriptId: PropTypes.number.isRequired,
    scriptName: PropTypes.string.isRequired,
    unitTitle: PropTypes.string.isRequired,
    professionalLearningCourse: PropTypes.bool,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isRtl: PropTypes.bool.isRequired,
    sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    currentCourseId: PropTypes.number,
    hiddenLessonState: PropTypes.object,
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
      migratedTeacherResources,
      studentResources,
      perLevelResults,
      unitCompleted,
      unitData,
      scriptId,
      scriptName,
      unitTitle,
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
      hiddenLessonState,
      selectedSectionId,
      courseName,
      showAssignButton,
      userId,
      assignedSectionId,
      minimal,
      showCalendar,
      weeklyInstructionalMinutes,
      unitCalendarLessons,
      isMigrated,
      scriptOverviewPdfUrl,
      scriptResourcesPdfUrl,
      showUnversionedRedirectWarning
    } = this.props;

    const displayRedirectDialog =
      redirectScriptUrl && !dismissedRedirectDialog(courseName || scriptName);

    let unitProgress = NOT_STARTED;
    if (unitCompleted) {
      unitProgress = COMPLETED;
    } else if (Object.keys(perLevelResults).length > 0) {
      unitProgress = IN_PROGRESS;
    }

    const isHiddenUnit =
      !!selectedSectionId &&
      !!scriptId &&
      isScriptHiddenForSection(hiddenLessonState, selectedSectionId, scriptId);

    const showUnversionedRedirectWarningDialog =
      showUnversionedRedirectWarning && !this.state.showRedirectDialog;
    return (
      <div>
        {onOverviewPage && (
          <div>
            {showUnversionedRedirectWarningDialog && (
              <UnversionedScriptRedirectDialog />
            )}
            {this.props.courseLink && (
              <div className="unit-breadcrumb" style={styles.navArea}>
                <a href={this.props.courseLink} style={styles.navLink}>{`< ${
                  this.props.courseTitle
                }`}</a>
              </div>
            )}
            {displayRedirectDialog && (
              <RedirectDialog
                isOpen={this.state.showRedirectDialog}
                details={i18n.assignedToNewerVersion()}
                handleClose={this.onCloseRedirectDialog}
                redirectUrl={redirectScriptUrl}
                redirectButtonText={i18n.goToAssignedVersion()}
              />
            )}

            <UnitOverviewHeader
              showCourseUnitVersionWarning={showCourseUnitVersionWarning}
              showScriptVersionWarning={showScriptVersionWarning}
              showRedirectWarning={showRedirectWarning}
              showHiddenUnitWarning={isHiddenUnit}
              versions={versions}
              courseName={courseName}
              userId={userId}
            />
            {showCalendar && viewAs === ViewType.Teacher && (
              <div className="unit-calendar-for-printing print-only">
                <UnitCalendar
                  lessons={unitCalendarLessons}
                  weeklyInstructionalMinutes={weeklyInstructionalMinutes || 225}
                  weekWidth={550}
                />
              </div>
            )}
            <UnitOverviewTopRow
              sectionsForDropdown={sectionsForDropdown}
              selectedSectionId={parseInt(selectedSectionId)}
              professionalLearningCourse={professionalLearningCourse}
              unitProgress={unitProgress}
              scriptId={scriptId}
              scriptName={scriptName}
              unitTitle={unitTitle}
              currentCourseId={currentCourseId}
              viewAs={viewAs}
              isRtl={isRtl}
              teacherResources={teacherResources}
              migratedTeacherResources={migratedTeacherResources}
              studentResources={studentResources}
              showAssignButton={showAssignButton}
              assignedSectionId={assignedSectionId}
              showCalendar={showCalendar}
              weeklyInstructionalMinutes={weeklyInstructionalMinutes}
              unitCalendarLessons={unitCalendarLessons}
              isMigrated={isMigrated}
              scriptOverviewPdfUrl={scriptOverviewPdfUrl}
              scriptResourcesPdfUrl={scriptResourcesPdfUrl}
            />
          </div>
        )}
        <ProgressTable minimal={minimal} />
        {onOverviewPage && (
          <ProgressLegend
            includeCsfColumn={!excludeCsfColumnInLegend}
            includeReviewStates={shouldShowReviewStates(unitData)}
          />
        )}
        <GoogleClassroomAttributionLabel />
      </div>
    );
  }
}

const styles = {
  navLink: {
    fontSize: 14,
    lineHeight: '22px',
    color: color.purple
  },
  navArea: {
    padding: '10px 0px'
  }
};

export const UnconnectedUnitOverview = Radium(UnitOverview);
export default connect((state, ownProps) => ({
  perLevelResults: state.progress.levelResults,
  unitCompleted: !!state.progress.unitCompleted,
  unitData: state.progress.unitData,
  scriptId: state.progress.scriptId,
  scriptName: state.progress.scriptName,
  unitTitle: state.progress.unitTitle,
  professionalLearningCourse: state.progress.professionalLearningCourse,
  viewAs: state.viewAs,
  isRtl: state.isRtl,
  currentCourseId: state.progress.courseId,
  hiddenLessonState: state.hiddenLesson,
  selectedSectionId: parseInt(state.teacherSections.selectedSectionId),
  sectionsForDropdown: sectionsForDropdown(
    state.teacherSections,
    ownProps.id,
    ownProps.courseId,
    false
  )
}))(UnconnectedUnitOverview);
