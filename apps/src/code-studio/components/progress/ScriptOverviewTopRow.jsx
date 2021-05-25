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
    migratedTeacherResources: PropTypes.arrayOf(migratedResourceShape),
    studentResources: PropTypes.arrayOf(migratedResourceShape).isRequired,
    showAssignButton: PropTypes.bool,
    unitCalendarLessons: PropTypes.arrayOf(unitCalendarLesson),
    weeklyInstructionalMinutes: PropTypes.number,
    showCalendar: PropTypes.bool,
    isMigrated: PropTypes.bool,
    scriptOverviewPdfUrl: PropTypes.string,
    scriptResourcesPdfUrl: PropTypes.string
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
      scriptProgress,
      scriptId,
      scriptName,
      scriptTitle,
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
      isMigrated
    } = this.props;

    const pdfDropdownOptions = this.compilePdfDropdownOptions();

    // Adjust styles if locale is RTL
    const hasButtonMargin = studentResources.length > 0;
    const buttonMarginStyle = isRtl
      ? styles.buttonMarginRTL
      : styles.buttonMarginLTR;

    return (
      <div style={styles.buttonRow} className="script-overview-top-row">
        {!professionalLearningCourse && viewAs === ViewType.Student && (
          <div style={styles.buttonsInRow}>
            <Button
              __useDeprecatedTag
              href={`/s/${scriptName}/next`}
              text={NEXT_BUTTON_TEXT[scriptProgress]}
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
            viewAs === ViewType.Teacher &&
            ((!isMigrated && teacherResources.length > 0) ||
              (isMigrated && migratedTeacherResources.length > 0)) && (
              <ResourcesDropdown
                resources={teacherResources}
                migratedResources={migratedTeacherResources}
                unitId={scriptId}
                useMigratedResources={isMigrated}
              />
            )}
          {pdfDropdownOptions.length > 0 && viewAs === ViewType.Teacher && (
            <div style={{marginRight: 5}}>
              <DropdownButton
                text={i18n.printingOptions()}
                color={Button.ButtonColor.blue}
              >
                {pdfDropdownOptions.map(option => (
                  <a
                    key={option.key}
                    href={option.url}
                    onClick={() =>
                      this.recordAndNavigateToPdf(option.key, option.url)
                    }
                  >
                    {option.name}
                  </a>
                ))}
              </DropdownButton>
            </div>
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

export const UnconnectedScriptOverviewTopRow = ScriptOverviewTopRow;

export default connect((state, ownProps) => ({
  sectionsForDropdown: sectionsForDropdown(
    state.teacherSections,
    ownProps.scriptId,
    ownProps.currentCourseId,
    false
  )
}))(ScriptOverviewTopRow);
