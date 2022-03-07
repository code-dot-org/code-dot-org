import PropTypes from 'prop-types';
import React, {Component} from 'react';
import UnitSelector from './UnitSelector';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import SectionProgressToggle from '@cdo/apps/templates/sectionProgress/SectionProgressToggle';
import StandardsView from '@cdo/apps/templates/sectionProgress/standards/StandardsView';
import ProgressTableView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableView';
import LessonSelector from './LessonSelector';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {h3Style} from '../../lib/ui/Headings';
import {
  getCurrentUnitData,
  setLessonOfInterest,
  setCurrentView
} from './sectionProgressRedux';
import {loadScriptProgress} from './sectionProgressLoader';
import {ViewType, scriptDataPropType} from './sectionProgressConstants';
import {
  setScriptId,
  validScriptPropType
} from '@cdo/apps/redux/unitSelectionRedux';
import firehoseClient from '../../lib/util/firehose';
import ProgressViewHeader from './ProgressViewHeader';
import logToCloud from '@cdo/apps/logToCloud';

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
    validScripts: PropTypes.arrayOf(validScriptPropType).isRequired,
    currentView: PropTypes.oneOf(Object.values(ViewType)),
    setCurrentView: PropTypes.func.isRequired,
    scriptData: scriptDataPropType,
    setScriptId: PropTypes.func.isRequired,
    setLessonOfInterest: PropTypes.func.isRequired,
    isLoadingProgress: PropTypes.bool.isRequired,
    isRefreshingProgress: PropTypes.bool,
    showStandardsIntroDialog: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      reportedInitialRender: false
    };
  }

  componentDidMount() {
    loadScriptProgress(this.props.scriptId, this.props.sectionId);
  }

  componentDidUpdate() {
    if (this.levelDataInitialized() && !this.state.reportedInitialRender) {
      logToCloud.addPageAction(
        logToCloud.PageAction.LoadScriptProgressFinished,
        {
          sectionId: this.props.sectionId,
          scriptId: this.props.scriptId
        }
      );
      this.setState({reportedInitialRender: true});
    }
  }

  onChangeScript = scriptId => {
    this.props.setScriptId(scriptId);
    loadScriptProgress(scriptId, this.props.sectionId);

    this.recordEvent('change_script', {
      old_script_id: this.props.scriptId,
      new_script_id: scriptId
    });
  };

  onChangeLevel = lessonOfInterest => {
    this.props.setLessonOfInterest(lessonOfInterest);

    this.recordEvent('jump_to_lesson', {
      script_id: this.props.scriptId,
      stage_id: this.props.scriptData.lessons[lessonOfInterest].id
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
          ...dataJson
        })
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
      validScripts,
      currentView,
      scriptId,
      scriptData,
      showStandardsIntroDialog
    } = this.props;
    const levelDataInitialized = this.levelDataInitialized();
    const lessons = scriptData ? scriptData.lessons : [];
    const scriptWithStandardsSelected =
      levelDataInitialized && scriptData.hasStandards;
    const standardsStyle =
      currentView === ViewType.STANDARDS ? styles.show : styles.hide;
    return (
      <div>
        <div style={styles.topRowContainer}>
          <div>
            <div style={{...h3Style, ...styles.heading}}>
              {i18n.selectACourse()}
            </div>
            <UnitSelector
              validScripts={validScripts}
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

        {levelDataInitialized && <ProgressViewHeader />}

        <div style={{clear: 'both'}}>
          {!levelDataInitialized && (
            <FontAwesome
              id="uitest-spinner"
              icon="spinner"
              className="fa-pulse fa-3x"
            />
          )}
          {levelDataInitialized &&
            (currentView === ViewType.SUMMARY ||
              currentView === ViewType.DETAIL) && (
              <ProgressTableView currentView={currentView} />
            )}
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

const styles = {
  heading: {
    marginBottom: 0
  },
  topRowContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: 10
  },
  chevronLink: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end'
  },
  icon: {
    paddingRight: 5
  },
  toggle: {
    margin: '0px 30px'
  },
  show: {
    display: 'block'
  },
  hide: {
    display: 'none'
  },
  studentTooltip: {
    display: 'flex',
    textAlign: 'center'
  }
};

export const UnconnectedSectionProgress = SectionProgress;

export default connect(
  state => ({
    scriptId: state.unitSelection.scriptId,
    sectionId: state.teacherSections.selectedSectionId,
    validScripts: state.unitSelection.validScripts,
    currentView: state.sectionProgress.currentView,
    scriptData: getCurrentUnitData(state),
    isLoadingProgress: state.sectionProgress.isLoadingProgress,
    isRefreshingProgress: state.sectionProgress.isRefreshingProgress,
    showStandardsIntroDialog: !state.currentUser.hasSeenStandardsReportInfo
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
    }
  })
)(SectionProgress);
