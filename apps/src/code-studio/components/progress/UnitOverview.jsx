import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import UnitOverviewTopRow from './UnitOverviewTopRow';
import RedirectDialog from '@cdo/apps/code-studio/components/RedirectDialog';
import UnversionedScriptRedirectDialog from '@cdo/apps/code-studio/components/UnversionedScriptRedirectDialog';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
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
import {assignmentVersionShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {unitCalendarLesson} from '@cdo/apps/templates/progress/unitCalendarLessonShapes';
import GoogleClassroomAttributionLabel from '@cdo/apps/templates/progress/GoogleClassroomAttributionLabel';
import UnitCalendar from './UnitCalendar';
import color from '@cdo/apps/util/color';
import EndOfLessonDialog from '@cdo/apps/templates/EndOfLessonDialog';

/**
 * Lesson progress component used in level header and script overview.
 */
class UnitOverview extends React.Component {
  static propTypes = {
    id: PropTypes.number,
    courseId: PropTypes.number,
    courseTitle: PropTypes.string,
    courseLink: PropTypes.string,
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
    unitCalendarLessons: PropTypes.arrayOf(unitCalendarLesson),
    weeklyInstructionalMinutes: PropTypes.number,
    showCalendar: PropTypes.bool,
    isMigrated: PropTypes.bool,
    scriptOverviewPdfUrl: PropTypes.string,
    scriptResourcesPdfUrl: PropTypes.string,
    showUnversionedRedirectWarning: PropTypes.bool,
    isCsdOrCsp: PropTypes.bool,
    completedLessonNumber: PropTypes.string,

    // redux provided
    scriptId: PropTypes.number.isRequired,
    scriptName: PropTypes.string.isRequired,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
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
      excludeCsfColumnInLegend,
      teacherResources,
      migratedTeacherResources,
      studentResources,
      scriptId,
      scriptName,
      viewAs,
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
      showCalendar,
      weeklyInstructionalMinutes,
      unitCalendarLessons,
      isMigrated,
      scriptOverviewPdfUrl,
      scriptResourcesPdfUrl,
      showUnversionedRedirectWarning,
      isCsdOrCsp,
      completedLessonNumber
    } = this.props;

    const displayRedirectDialog =
      redirectScriptUrl && !dismissedRedirectDialog(courseName || scriptName);

    const isHiddenUnit =
      !!selectedSectionId &&
      !!scriptId &&
      isScriptHiddenForSection(hiddenLessonState, selectedSectionId, scriptId);

    const showUnversionedRedirectWarningDialog =
      showUnversionedRedirectWarning && !this.state.showRedirectDialog;

    return (
      <div>
        {completedLessonNumber && (
          <EndOfLessonDialog lessonNumber={completedLessonNumber} />
        )}
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
          {showCalendar && viewAs === ViewType.Instructor && (
            <div className="unit-calendar-for-printing print-only">
              <UnitCalendar
                lessons={unitCalendarLessons}
                weeklyInstructionalMinutes={weeklyInstructionalMinutes || 225}
                weekWidth={550}
              />
            </div>
          )}
          <UnitOverviewTopRow
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
        <ProgressTable minimal={false} />
        <ProgressLegend
          includeCsfColumn={!excludeCsfColumnInLegend}
          includeReviewStates={isCsdOrCsp}
        />
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
  scriptId: state.progress.scriptId,
  scriptName: state.progress.scriptName,
  viewAs: state.viewAs,
  hiddenLessonState: state.hiddenLesson,
  selectedSectionId: state.teacherSections.selectedSectionId
}))(UnconnectedUnitOverview);
