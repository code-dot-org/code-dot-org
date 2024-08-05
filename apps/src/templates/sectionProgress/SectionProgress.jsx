import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import logToCloud from '@cdo/apps/logToCloud';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import {setScriptId} from '@cdo/apps/redux/unitSelectionRedux';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ProgressTableView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableView';
import SectionProgressToggle from '@cdo/apps/templates/sectionProgress/SectionProgressToggle';
import StandardsView from '@cdo/apps/templates/sectionProgress/standards/StandardsView';
import SortByNameDropdown from '@cdo/apps/templates/SortByNameDropdown';
import i18n from '@cdo/locale';

import {h3Style} from '../../lib/ui/Headings';
import firehoseClient from '../../metrics/utils/firehose';

import LessonSelector from './LessonSelector';
import ProgressViewHeader from './ProgressViewHeader';
import {ViewType, unitDataPropType} from './sectionProgressConstants';
import {loadUnitProgress} from './sectionProgressLoader';
import {
  getCurrentUnitData,
  setLessonOfInterest,
  setCurrentView,
} from './sectionProgressRedux';
import UnitSelector from './UnitSelector';

import styleConstants from './progressTables/progress-table-constants.module.scss';
import dashboardStyles from '@cdo/apps/templates/teacherDashboard/teacher-dashboard.module.scss';

const SECTION_PROGRESS = 'SectionProgress';

/**
 * Given a particular section, this component owns figuring out which script to
 * show progress for (selected via a dropdown), and querying the server for
 * student progress. Child components then have the responsibility for displaying
 * that progress.
 */
class SectionProgress extends Component {
  static propTypes = {
    //Provided by redux
    scriptId: PropTypes.number,
    sectionId: PropTypes.number,
    coursesWithProgress: PropTypes.array.isRequired,
    currentView: PropTypes.oneOf(Object.values(ViewType)),
    setCurrentView: PropTypes.func.isRequired,
    scriptData: unitDataPropType,
    setScriptId: PropTypes.func.isRequired,
    setLessonOfInterest: PropTypes.func.isRequired,
    isLoadingProgress: PropTypes.bool.isRequired,
    isRefreshingProgress: PropTypes.bool,
    showStandardsIntroDialog: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      reportedInitialRender: false,
    };
  }

  componentDidMount() {
    loadUnitProgress(this.props.scriptId, this.props.sectionId);
  }

  componentDidUpdate(prevProps) {
    if (this.levelDataInitialized() && !this.state.reportedInitialRender) {
      logToCloud.addPageAction(
        logToCloud.PageAction.SectionProgressRenderedWithData,
        {
          sectionId: this.props.sectionId,
          scriptId: this.props.scriptId,
        }
      );
      this.setState({reportedInitialRender: true});
    }

    if (
      (prevProps.scriptId !== this.props.scriptId ||
        prevProps.sectionId !== this.props.sectionId ||
        prevProps.isLoadingProgress !== this.props.isLoadingProgress ||
        prevProps.isRefreshingProgress !== this.props.isRefreshingProgress) &&
      !this.props.isLoadingProgress &&
      !this.props.isRefreshingProgress
    ) {
      analyticsReporter.sendEvent(
        EVENTS.PROGRESS_VIEWED_FIXED,
        {
          sectionId: this.props.sectionId,
          unitId: this.props.scriptId,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
        },
        PLATFORMS.BOTH
      );
    }
  }

  onChangeScript = scriptId => {
    this.props.setScriptId(scriptId);
    loadUnitProgress(scriptId, this.props.sectionId);

    this.recordEvent('change_script', {
      old_script_id: this.props.scriptId,
      new_script_id: scriptId,
    });

    analyticsReporter.sendEvent(
      EVENTS.PROGRESS_CHANGE_UNIT,
      {
        sectionId: this.props.sectionId,
        oldUnitId: this.props.scriptId,
        unitId: scriptId,
      },
      PLATFORMS.BOTH
    );
  };

  onChangeLevel = lessonOfInterest => {
    this.props.setLessonOfInterest(lessonOfInterest);

    this.recordEvent('jump_to_lesson', {
      script_id: this.props.scriptId,
      stage_id: this.props.scriptData.lessons[lessonOfInterest].id,
    });

    analyticsReporter.sendEvent(EVENTS.PROGRESS_JUMP_TO_LESSON, {
      sectionId: this.props.sectionId,
      unitId: this.props.scriptId,
      lesson: this.props.scriptData.lessons[lessonOfInterest].id,
    });
  };

  navigateToScript = () => {
    this.recordEvent('go_to_script', {script_id: this.props.scriptId});
  };

  recordEvent = (eventName, dataJson = {}) => {
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: eventName,
        data_json: JSON.stringify({
          section_id: this.props.sectionId,
          ...dataJson,
        }),
      },
      {includeUserId: true}
    );
  };

  levelDataInitialized = () => {
    const {scriptData, isLoadingProgress, isRefreshingProgress} = this.props;
    return scriptData && !isLoadingProgress && !isRefreshingProgress;
  };

  render() {
    const {
      coursesWithProgress,
      currentView,
      scriptId,
      scriptData,
      sectionId,
      showStandardsIntroDialog,
    } = this.props;
    const levelDataInitialized = this.levelDataInitialized();
    const lessons = scriptData ? scriptData.lessons : [];
    const scriptWithStandardsSelected =
      levelDataInitialized && scriptData.hasStandards;
    const showProgressTable =
      levelDataInitialized &&
      (currentView === ViewType.SUMMARY || currentView === ViewType.DETAIL);
    const standardsStyle =
      currentView === ViewType.STANDARDS ? styles.show : styles.hide;

    return (
      <div
        className={dashboardStyles.dashboardPage}
        data-testid="section-progress-v1"
      >
        <div style={styles.topRowContainer}>
          <div>
            <div style={{...h3Style, ...styles.heading}}>
              {i18n.selectACourse()}
            </div>
            <UnitSelector
              coursesWithProgress={coursesWithProgress}
              scriptId={scriptId}
              onChange={this.onChangeScript}
            />
          </div>
          {levelDataInitialized && (
            <div style={styles.toggle}>
              <div style={{...h3Style, ...styles.heading}}>{i18n.viewBy()}</div>
              <SectionProgressToggle
                showStandardsToggle={scriptWithStandardsSelected}
              />
            </div>
          )}
          {currentView === ViewType.DETAIL && lessons.length !== 0 && (
            <LessonSelector lessons={lessons} onChange={this.onChangeLevel} />
          )}
        </div>
        <div style={styles.topRowContainer}>
          {showProgressTable && (
            <div style={styles.sortOrderSelect}>
              <SortByNameDropdown
                sectionId={sectionId}
                unitName={scriptData?.title}
                source={SECTION_PROGRESS}
              />
            </div>
          )}
          {levelDataInitialized && <ProgressViewHeader />}
        </div>

        <div style={{clear: 'both'}}>
          {!levelDataInitialized && (
            <FontAwesome
              id="uitest-spinner"
              icon="spinner"
              className="fa-pulse fa-3x"
            />
          )}
          {showProgressTable && <ProgressTableView currentView={currentView} />}
          {levelDataInitialized && currentView === ViewType.STANDARDS && (
            <div id="uitest-standards-view" style={standardsStyle}>
              <StandardsView
                showStandardsIntroDialog={showStandardsIntroDialog}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

const sortOrderMargin = 15;

const styles = {
  heading: {
    marginBottom: 0,
  },
  topRowContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: 10,
    width: '100%',
  },
  chevronLink: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
  },
  icon: {
    paddingRight: 5,
  },
  toggle: {
    margin: '0px 30px',
  },
  show: {
    display: 'block',
  },
  hide: {
    display: 'none',
  },
  studentTooltip: {
    display: 'flex',
    textAlign: 'center',
  },
  sortOrderSelect: {
    marginRight: sortOrderMargin,
    marginBottom: 8,
    width: parseInt(styleConstants.STUDENT_LIST_WIDTH) - sortOrderMargin,
  },
};

export const UnconnectedSectionProgress = SectionProgress;

export default connect(
  state => ({
    scriptId: state.unitSelection.scriptId,
    sectionId: state.teacherSections.selectedSectionId,
    coursesWithProgress: state.unitSelection.coursesWithProgress,
    currentView: state.sectionProgress.currentView,
    scriptData: getCurrentUnitData(state),
    isLoadingProgress: state.sectionProgress.isLoadingProgress,
    isRefreshingProgress: state.sectionProgress.isRefreshingProgress,
    showStandardsIntroDialog: !state.currentUser.hasSeenStandardsReportInfo,
  }),
  dispatch => ({
    setScriptId(scriptId) {
      dispatch(setScriptId(scriptId));
    },
    setLessonOfInterest(lessonOfInterest) {
      dispatch(setLessonOfInterest(lessonOfInterest));
    },
    setCurrentView(viewType) {
      dispatch(setCurrentView(viewType));
    },
  })
)(SectionProgress);
