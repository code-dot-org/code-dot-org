import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import ProgressDetailToggle from '@cdo/apps/templates/progress/ProgressDetailToggle';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {resourceShape} from '@cdo/apps/templates/courseOverview/resourceType';
import SectionAssigner from '@cdo/apps/templates/teacherDashboard/SectionAssigner';
import Assigned from '@cdo/apps/templates/Assigned';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {sectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import TeacherResourcesDropdown from '@cdo/apps/code-studio/components/progress/TeacherResourcesDropdown';
import UnitCalendarButton from '@cdo/apps/code-studio/components/progress/UnitCalendarButton';
import {unitCalendarLesson} from '../../../templates/progress/unitCalendarLessonShapes';

export const NOT_STARTED = 'NOT_STARTED';
export const IN_PROGRESS = 'IN_PROGRESS';
export const COMPLETED = 'COMPLETED';

const NEXT_BUTTON_TEXT = {
  [NOT_STARTED]: i18n.tryNow(),
  [IN_PROGRESS]: i18n.continue(),
  [COMPLETED]: i18n.printCertificate()
};

const styles = {
  buttonRow: {
    // ensure we have height when we only have our toggle (which is floated)
    minHeight: 50,
    position: 'relative'
  },
  right: {
    position: 'absolute',
    right: 0,
    top: 0
  },
  left: {
    position: 'absolute',
    left: 0,
    top: 0
  },
  dropdown: {
    display: 'inline-block'
  },
  resourcesRow: {
    display: 'flex'
  }
};

class ScriptOverviewTopRow extends React.Component {
  static propTypes = {
    sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    selectedSectionId: PropTypes.number,
    assignedSectionId: PropTypes.number,
    currentCourseId: PropTypes.number,
    professionalLearningCourse: PropTypes.bool,
    scriptProgress: PropTypes.oneOf([NOT_STARTED, IN_PROGRESS, COMPLETED]),
    scriptId: PropTypes.number.isRequired,
    scriptName: PropTypes.string.isRequired,
    scriptTitle: PropTypes.string.isRequired,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isRtl: PropTypes.bool.isRequired,
    teacherResources: PropTypes.arrayOf(resourceShape),
    migratedTeacherResources: PropTypes.arrayOf(PropTypes.object),
    showAssignButton: PropTypes.bool,
    unitCalendarLessons: PropTypes.arrayOf(unitCalendarLesson),
    weeklyInstructionalMinutes: PropTypes.number,
    showCalendar: PropTypes.bool,
    isMigrated: PropTypes.bool
  };

  render() {
    const {
      sectionsForDropdown,
      selectedSectionId,
      currentCourseId,
      professionalLearningCourse,
      scriptProgress,
      scriptId,
      scriptName,
      scriptTitle,
      viewAs,
      isRtl,
      teacherResources,
      migratedTeacherResources,
      showAssignButton,
      assignedSectionId,
      showCalendar,
      unitCalendarLessons,
      weeklyInstructionalMinutes,
      isMigrated
    } = this.props;

    return (
      <div style={styles.buttonRow} className="script-overview-top-row">
        {!professionalLearningCourse && viewAs === ViewType.Student && (
          <div>
            <Button
              __useDeprecatedTag
              href={`/s/${scriptName}/next`}
              text={NEXT_BUTTON_TEXT[scriptProgress]}
              size={Button.ButtonSize.large}
            />
            <Button
              __useDeprecatedTag
              href="//support.code.org"
              text={i18n.getHelp()}
              color={Button.ButtonColor.white}
              size={Button.ButtonSize.large}
              style={{marginLeft: 10}}
            />
            {assignedSectionId && <Assigned />}
          </div>
        )}

        <div style={styles.resourcesRow}>
          {!professionalLearningCourse &&
            viewAs === ViewType.Teacher &&
            ((!isMigrated && teacherResources.length > 0) ||
              (isMigrated && migratedTeacherResources.length > 0)) && (
              <TeacherResourcesDropdown
                teacherResources={teacherResources}
                migratedTeacherResources={migratedTeacherResources}
                unitId={scriptId}
                useMigratedResources={isMigrated}
              />
            )}
          {showCalendar && viewAs === ViewType.Teacher && (
            <UnitCalendarButton
              lessons={unitCalendarLessons}
              weeklyInstructionalMinutes={weeklyInstructionalMinutes}
              scriptId={scriptId}
            />
          )}
        </div>
        {!professionalLearningCourse && viewAs === ViewType.Teacher && (
          <SectionAssigner
            sections={sectionsForDropdown}
            selectedSectionId={selectedSectionId}
            assignmentName={scriptTitle}
            showAssignButton={showAssignButton}
            courseId={currentCourseId}
            scriptId={scriptId}
            forceReload={true}
          />
        )}
        <div style={isRtl ? styles.left : styles.right}>
          <span>
            <ProgressDetailToggle />
          </span>
        </div>
      </div>
    );
  }
}

export const UnconnectedScriptOverviewTopRow = ScriptOverviewTopRow;

export default connect((state, ownProps) => ({
  sectionsForDropdown: sectionsForDropdown(
    state.teacherSections,
    ownProps.scriptId,
    ownProps.currentCourseId,
    false
  )
}))(ScriptOverviewTopRow);
