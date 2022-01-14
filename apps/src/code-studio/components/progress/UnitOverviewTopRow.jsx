import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import ProgressDetailToggle from '@cdo/apps/templates/progress/ProgressDetailToggle';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {resourceShape} from '@cdo/apps/templates/courseOverview/resourceType';
import {resourceShape as migratedResourceShape} from '@cdo/apps/lib/levelbuilder/shapes';
import SectionAssigner from '@cdo/apps/templates/teacherDashboard/SectionAssigner';
import Assigned from '@cdo/apps/templates/Assigned';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {sectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import ResourcesDropdown from '@cdo/apps/code-studio/components/progress/ResourcesDropdown';
import UnitCalendarButton from '@cdo/apps/code-studio/components/progress/UnitCalendarButton';
import {unitCalendarLesson} from '../../../templates/progress/unitCalendarLessonShapes';
import firehoseClient from '@cdo/apps/lib/util/firehose';

export const NOT_STARTED = 'NOT_STARTED';
export const IN_PROGRESS = 'IN_PROGRESS';
export const COMPLETED = 'COMPLETED';

const NEXT_BUTTON_TEXT = {
  [NOT_STARTED]: i18n.tryNow(),
  [IN_PROGRESS]: i18n.continue(),
  [COMPLETED]: i18n.printCertificate()
};

class UnitOverviewTopRow extends React.Component {
  static propTypes = {
    assignedSectionId: PropTypes.number,
    teacherResources: PropTypes.arrayOf(resourceShape),
    migratedTeacherResources: PropTypes.arrayOf(migratedResourceShape),
    studentResources: PropTypes.arrayOf(migratedResourceShape).isRequired,
    showAssignButton: PropTypes.bool,
    unitCalendarLessons: PropTypes.arrayOf(unitCalendarLesson),
    weeklyInstructionalMinutes: PropTypes.number,
    showCalendar: PropTypes.bool,
    isMigrated: PropTypes.bool,
    scriptOverviewPdfUrl: PropTypes.string,
    scriptResourcesPdfUrl: PropTypes.string,

    // redux provided
    sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    selectedSectionId: PropTypes.number,
    professionalLearningCourse: PropTypes.bool,
    hasPerLevelResults: PropTypes.bool.isRequired,
    unitCompleted: PropTypes.bool.isRequired,
    scriptId: PropTypes.number.isRequired,
    scriptName: PropTypes.string.isRequired,
    unitTitle: PropTypes.string.isRequired,
    currentCourseId: PropTypes.number,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isRtl: PropTypes.bool.isRequired
  };

  recordAndNavigateToPdf = (e, firehoseKey, url) => {
    e.preventDefault();
    firehoseClient.putRecord(
      {
        study: 'pdf-click',
        study_group: 'script',
        event: 'open-pdf',
        data_json: JSON.stringify({
          name: this.props.scriptName,
          pdfType: firehoseKey
        })
      },
      {
        includeUserId: true,
        callback: () => {
          window.location.href = url;
        }
      }
    );
  };

  compilePdfDropdownOptions = () => {
    const {scriptOverviewPdfUrl, scriptResourcesPdfUrl} = this.props;

    const options = [];
    if (scriptOverviewPdfUrl) {
      options.push({
        key: 'lessonPlans',
        name: i18n.printLessonPlans(),
        url: scriptOverviewPdfUrl
      });
    }
    if (scriptResourcesPdfUrl) {
      options.push({
        key: 'scriptResources',
        name: i18n.printHandouts(),
        url: scriptResourcesPdfUrl
      });
    }
    return options;
  };

  render() {
    const {
      sectionsForDropdown,
      selectedSectionId,
      currentCourseId,
      professionalLearningCourse,
      scriptId,
      scriptName,
      unitTitle,
      viewAs,
      isRtl,
      teacherResources,
      migratedTeacherResources,
      studentResources,
      showAssignButton,
      assignedSectionId,
      showCalendar,
      unitCalendarLessons,
      weeklyInstructionalMinutes,
      isMigrated,
      unitCompleted,
      hasPerLevelResults
    } = this.props;

    const useMigratedTeacherResources = isMigrated && !teacherResources.length;

    const pdfDropdownOptions = this.compilePdfDropdownOptions();

    // Adjust styles if locale is RTL
    const hasButtonMargin = studentResources.length > 0;
    const buttonMarginStyle = isRtl
      ? styles.buttonMarginRTL
      : styles.buttonMarginLTR;

    let unitProgress = NOT_STARTED;
    if (unitCompleted) {
      unitProgress = COMPLETED;
    } else if (hasPerLevelResults) {
      unitProgress = IN_PROGRESS;
    }

    return (
      <div style={styles.buttonRow} className="unit-overview-top-row">
        {!professionalLearningCourse && viewAs === ViewType.Participant && (
          <div style={styles.buttonsInRow}>
            <Button
              __useDeprecatedTag
              href={`/s/${scriptName}/next`}
              text={NEXT_BUTTON_TEXT[unitProgress]}
              size={Button.ButtonSize.large}
              style={{marginRight: 10}}
            />
            {studentResources.length > 0 && (
              <ResourcesDropdown
                migratedResources={studentResources}
                unitId={scriptId}
                useMigratedResources={true}
                studentFacing
              />
            )}
            <Button
              __useDeprecatedTag
              href="//support.code.org"
              text={i18n.getHelp()}
              color={Button.ButtonColor.white}
              size={Button.ButtonSize.large}
              style={hasButtonMargin ? buttonMarginStyle : {}}
            />
            {assignedSectionId && <Assigned />}
          </div>
        )}

        <div style={styles.resourcesRow}>
          {!professionalLearningCourse &&
            viewAs === ViewType.Instructor &&
            ((!useMigratedTeacherResources && teacherResources.length > 0) ||
              (useMigratedTeacherResources &&
                migratedTeacherResources.length > 0)) && (
              <ResourcesDropdown
                resources={teacherResources}
                migratedResources={migratedTeacherResources}
                unitId={scriptId}
                useMigratedResources={useMigratedTeacherResources}
              />
            )}
          {pdfDropdownOptions.length > 0 && viewAs === ViewType.Instructor && (
            <div style={{marginRight: 5}}>
              <DropdownButton
                text={i18n.printingOptions()}
                color={Button.ButtonColor.blue}
              >
                {pdfDropdownOptions.map(option => (
                  <a
                    key={option.key}
                    href={option.url}
                    onClick={e =>
                      this.recordAndNavigateToPdf(e, option.key, option.url)
                    }
                  >
                    {option.name}
                  </a>
                ))}
              </DropdownButton>
            </div>
          )}
          {showCalendar && viewAs === ViewType.Instructor && (
            <UnitCalendarButton
              lessons={unitCalendarLessons}
              weeklyInstructionalMinutes={weeklyInstructionalMinutes}
              scriptId={scriptId}
            />
          )}
        </div>
        {!professionalLearningCourse && viewAs === ViewType.Instructor && (
          <SectionAssigner
            sections={sectionsForDropdown}
            selectedSectionId={selectedSectionId}
            assignmentName={unitTitle}
            showAssignButton={showAssignButton}
            courseId={currentCourseId}
            scriptId={scriptId}
            forceReload={true}
            buttonLocationAnalytics={'unit-overview-top'}
          />
        )}
        <div style={isRtl ? styles.left : styles.right}>
          <span>
            <ProgressDetailToggle toggleStudyGroup="unit-overview" />
          </span>
        </div>
      </div>
    );
  }
}

const styles = {
  buttonRow: {
    // ensure we have height when we only have our toggle (which is floated)
    minHeight: 50,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  buttonsInRow: {
    display: 'flex',
    alignItems: 'center'
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
  },
  buttonMarginLTR: {
    marginLeft: 5
  },
  buttonMarginRTL: {
    marginRight: 5
  }
};

export const UnconnectedUnitOverviewTopRow = UnitOverviewTopRow;

export default connect(state => ({
  selectedSectionId: parseInt(state.teacherSections.selectedSectionId),
  sectionsForDropdown: sectionsForDropdown(
    state.teacherSections,
    state.progress.scriptId,
    state.progress.courseId,
    false
  ),
  professionalLearningCourse: state.progress.professionalLearningCourse,
  hasPerLevelResults: Object.keys(state.progress.levelResults).length > 0,
  unitCompleted: !!state.progress.unitCompleted,
  scriptId: state.progress.scriptId,
  scriptName: state.progress.scriptName,
  unitTitle: state.progress.unitTitle,
  currentCourseId: state.progress.courseId,
  viewAs: state.viewAs,
  isRtl: state.isRtl
}))(UnitOverviewTopRow);
