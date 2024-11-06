import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import BulkLessonVisibilityToggle from '@cdo/apps/code-studio/components/progress/BulkLessonVisibilityToggle';
import ResourcesDropdown from '@cdo/apps/code-studio/components/progress/ResourcesDropdown';
import UnitCalendarButton from '@cdo/apps/code-studio/components/progress/UnitCalendarButton';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Button from '@cdo/apps/legacySharedComponents/Button';
import {resourceShape} from '@cdo/apps/levelbuilder/shapes';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import Assigned from '@cdo/apps/templates/Assigned';
import ProgressDetailToggle from '@cdo/apps/templates/progress/ProgressDetailToggle';
import SectionAssigner from '@cdo/apps/templates/teacherDashboard/SectionAssigner';
import {sectionForDropdownShape} from '@cdo/apps/templates/teacherDashboard/shapes';
import {sectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {showV2TeacherDashboard} from '@cdo/apps/templates/teacherNavigation/TeacherNavFlagUtils';
import i18n from '@cdo/locale';

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
    studentResources: PropTypes.arrayOf(resourceShape).isRequired,
    unitCalendarLessons: PropTypes.arrayOf(unitCalendarLesson),
    weeklyInstructionalMinutes: PropTypes.number,
    showCalendar: PropTypes.bool,
    scriptOverviewPdfUrl: PropTypes.string,
    scriptResourcesPdfUrl: PropTypes.string,
    courseOfferingId: PropTypes.number,
    courseVersionId: PropTypes.number,
    courseLink: PropTypes.string,
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

  render() {
    const {
      sectionsForDropdown,
      unitAllowsHiddenLessons,
      deeperLearningCourse,
      scriptId,
      scriptName,
      viewAs,
      isRtl,
      studentResources,
      assignedSectionId,
      showCalendar,
      unitCalendarLessons,
      weeklyInstructionalMinutes,
      unitCompleted,
      hasPerLevelResults,
      courseOfferingId,
      courseVersionId,
      isUnitWithLevels,
    } = this.props;

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
      <div style={styles.topRow}>
        <div style={styles.leftButtons} className="unit-overview-top-row">
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
            {showCalendar && viewAs === ViewType.Instructor && (
              <UnitCalendarButton
                lessons={unitCalendarLessons}
                weeklyInstructionalMinutes={weeklyInstructionalMinutes}
                scriptId={scriptId}
              />
            )}
          </div>
          <div style={styles.secondRow}>
            {!deeperLearningCourse && viewAs === ViewType.Instructor && (
              <div style={styles.sectionContainer}>
                {!showV2TeacherDashboard() && (
                  <SectionAssigner
                    sections={sectionsForDropdown}
                    courseOfferingId={courseOfferingId}
                    courseVersionId={courseVersionId}
                    scriptId={scriptId}
                    forceReload={true}
                  />
                )}
              </div>
            )}
          </div>
        </div>
        <div style={styles.rightButtons}>
          {unitAllowsHiddenLessons && (
            <BulkLessonVisibilityToggle lessons={unitCalendarLessons} />
          )}
          <span style={styles.detailToggle}>
            <ProgressDetailToggle toggleStudyGroup="unit-overview" />
          </span>
        </div>
      </div>
    );
  }
}

const styles = {
  topRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    minHeight: 50,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  leftButtons: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  rightButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: 'fit-content',
    alignSelf: 'end',
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
  detailToggle: {
    minWidth: 84,
    alignSelf: 'end',
    marginLeft: 10,
  },
  secondRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
