import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import BulkLessonVisibilityToggle from '@cdo/apps/code-studio/components/progress/BulkLessonVisibilityToggle';
import ResourcesDropdown from '@cdo/apps/code-studio/components/progress/ResourcesDropdown';
import UnitCalendarButton from '@cdo/apps/code-studio/components/progress/UnitCalendarButton';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {PublishedState} from '@cdo/apps/generated/curriculum/sharedCourseConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {resourceShape} from '@cdo/apps/levelbuilder/shapes';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import firehoseClient from '@cdo/apps/metrics/firehose';
import Assigned from '@cdo/apps/templates/Assigned';
import DropdownButton from '@cdo/apps/templates/DropdownButton';
import ProgressDetailToggle from '@cdo/apps/templates/progress/ProgressDetailToggle';
import SectionAssigner from '@cdo/apps/templates/teacherDashboard/SectionAssigner';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {sectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import i18n from '@cdo/locale';

import FontAwesome from '../../../legacySharedComponents/FontAwesome';
import {unitCalendarLesson} from '../../../templates/progress/unitCalendarLessonShapes';

export const NOT_STARTED = 'NOT_STARTED';
export const IN_PROGRESS = 'IN_PROGRESS';
export const COMPLETED = 'COMPLETED';

const NEXT_BUTTON_TEXT = {
  [NOT_STARTED]: i18n.tryNow(),
  [IN_PROGRESS]: i18n.continue(),
  [COMPLETED]: i18n.printCertificate(),
};

class UnitOverviewTopRow extends React.Component {
  static propTypes = {
    assignedSectionId: PropTypes.number,
    teacherResources: PropTypes.arrayOf(resourceShape),
    studentResources: PropTypes.arrayOf(resourceShape).isRequired,
    showAssignButton: PropTypes.bool,
    unitCalendarLessons: PropTypes.arrayOf(unitCalendarLesson),
    weeklyInstructionalMinutes: PropTypes.number,
    showCalendar: PropTypes.bool,
    isMigrated: PropTypes.bool,
    scriptOverviewPdfUrl: PropTypes.string,
    scriptResourcesPdfUrl: PropTypes.string,
    courseOfferingId: PropTypes.number,
    courseVersionId: PropTypes.number,
    publishedState: PropTypes.oneOf(Object.values(PublishedState)),
    courseLink: PropTypes.string,
    participantAudience: PropTypes.string,
    isUnitWithLevels: PropTypes.bool,

    // redux provided
    sectionsForDropdown: PropTypes.arrayOf(sectionForDropdownShape).isRequired,
    selectedSectionId: PropTypes.number,
    deeperLearningCourse: PropTypes.bool,
    hasPerLevelResults: PropTypes.bool.isRequired,
    unitCompleted: PropTypes.bool.isRequired,
    scriptId: PropTypes.number.isRequired,
    scriptName: PropTypes.string.isRequired,
    unitTitle: PropTypes.string.isRequired,
    currentCourseId: PropTypes.number,
    unitAllowsHiddenLessons: PropTypes.bool,
    viewAs: PropTypes.oneOf(Object.values(ViewType)).isRequired,
    isRtl: PropTypes.bool.isRequired,
  };

  logTryNowButtonClick = unitProgress => {
    if (unitProgress === NOT_STARTED) {
      analyticsReporter.sendEvent(EVENTS.TRY_NOW_BUTTON_CLICK_EVENT, {
        'unit name': this.props.unitTitle,
      });
    }
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
          pdfType: firehoseKey,
        }),
      },
      {
        includeUserId: true,
        callback: () => {
          window.location.href = url;
        },
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
        url: scriptOverviewPdfUrl,
      });
    }
    if (scriptResourcesPdfUrl) {
      options.push({
        key: 'scriptResources',
        name: i18n.printHandouts(),
        url: scriptResourcesPdfUrl,
      });
    }
    return options;
  };

  render() {
    const {
      sectionsForDropdown,
      selectedSectionId,
      currentCourseId,
      unitAllowsHiddenLessons,
      deeperLearningCourse,
      scriptId,
      scriptName,
      unitTitle,
      viewAs,
      isRtl,
      teacherResources,
      studentResources,
      showAssignButton,
      assignedSectionId,
      showCalendar,
      unitCalendarLessons,
      weeklyInstructionalMinutes,
      isMigrated,
      unitCompleted,
      hasPerLevelResults,
      courseOfferingId,
      courseVersionId,
      publishedState,
      participantAudience,
      isUnitWithLevels,
    } = this.props;

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

    const displayPrintingOptionsDropwdown =
      pdfDropdownOptions.length > 0 &&
      publishedState !== PublishedState.pilot &&
      publishedState !== PublishedState.in_development;

    return (
      <div style={styles.buttonRow} className="unit-overview-top-row">
        {!deeperLearningCourse && viewAs === ViewType.Participant && (
          <div style={styles.buttonsInRow}>
            {isUnitWithLevels && (
              <Button
                __useDeprecatedTag
                href={`/s/${scriptName}/next`}
                text={NEXT_BUTTON_TEXT[unitProgress]}
                size={Button.ButtonSize.large}
                style={{marginRight: 10}}
                onClick={() => this.logTryNowButtonClick(unitProgress)}
              />
            )}

            {studentResources.length > 0 && (
              <ResourcesDropdown
                resources={studentResources}
                unitId={scriptId}
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
          {!deeperLearningCourse &&
            viewAs === ViewType.Instructor &&
            isMigrated &&
            teacherResources.length > 0 && (
              <ResourcesDropdown
                resources={teacherResources}
                unitId={scriptId}
              />
            )}
          {displayPrintingOptionsDropwdown &&
            viewAs === ViewType.Instructor && (
              <div style={{marginRight: 5}}>
                <DropdownButton
                  customText={
                    <div>
                      <FontAwesome icon="print" style={styles.icon} />
                      <span style={styles.customText}>
                        {i18n.printingOptions()}
                      </span>
                    </div>
                  }
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
        {!deeperLearningCourse && viewAs === ViewType.Instructor && (
          <div style={styles.sectionContainer}>
            <SectionAssigner
              sections={sectionsForDropdown}
              selectedSectionId={selectedSectionId}
              assignmentName={unitTitle}
              showAssignButton={showAssignButton}
              courseId={currentCourseId}
              courseOfferingId={courseOfferingId}
              courseVersionId={courseVersionId}
              scriptId={scriptId}
              forceReload={true}
              isAssigningCourse={false}
              isStandAloneUnit={this.props.courseLink === null}
              participantAudience={participantAudience}
            />
            {unitAllowsHiddenLessons && (
              <BulkLessonVisibilityToggle lessons={unitCalendarLessons} />
            )}
          </div>
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
    flexDirection: 'column',
  },
  buttonsInRow: {
    display: 'flex',
    alignItems: 'center',
  },
  customText: {
    margin: '0px 2px',
  },
  icon: {
    margin: '0px 2px',
    fontSize: 16,
    // we want our icon text to be a different size than our button text, which
    // requires we manually offset to get it centered properly
    position: 'relative',
    top: 1,
  },
  right: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  left: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  dropdown: {
    display: 'inline-block',
  },
  resourcesRow: {
    display: 'flex',
  },
  buttonMarginLTR: {
    marginLeft: 5,
  },
  buttonMarginRTL: {
    marginRight: 5,
  },
  sectionContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
};

export const UnconnectedUnitOverviewTopRow = UnitOverviewTopRow;

export default connect((state, ownProps) => ({
  selectedSectionId: state.teacherSections.selectedSectionId,
  sectionsForDropdown: sectionsForDropdown(
    state.teacherSections,
    ownProps.courseOfferingId,
    ownProps.courseVersionId,
    state.progress.scriptId
  ),
  deeperLearningCourse: state.progress.deeperLearningCourse,
  hasPerLevelResults: Object.keys(state.progress.levelResults).length > 0,
  unitCompleted: !!state.progress.unitCompleted,
  scriptId: state.progress.scriptId,
  scriptName: state.progress.scriptName,
  unitTitle: state.progress.unitTitle,
  currentCourseId: state.progress.courseId,
  unitAllowsHiddenLessons: state.hiddenLesson.hideableLessonsAllowed || false,
  viewAs: state.viewAs,
  isRtl: state.isRtl,
}))(UnitOverviewTopRow);
