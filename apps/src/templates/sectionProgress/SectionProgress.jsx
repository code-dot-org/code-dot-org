import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';
import ScriptSelector from './ScriptSelector';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import SectionProgressToggle from '@cdo/apps/templates/sectionProgress/SectionProgressToggle';
import StandardsView from '@cdo/apps/templates/sectionProgress/standards/StandardsView';
import SummaryView from '@cdo/apps/templates/sectionProgress/summary/SummaryView';
import DetailView from '@cdo/apps/templates/sectionProgress/detail/DetailView';
import LessonSelector from './LessonSelector';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {h3Style} from '../../lib/ui/Headings';
import {
  ViewType,
  loadScript,
  getCurrentProgress,
  getCurrentScriptData,
  setLessonOfInterest,
  scriptDataPropType
} from './sectionProgressRedux';
import {tooltipIdForLessonNumber} from './multiGridConstants';
import {sectionDataPropType} from '@cdo/apps/redux/sectionDataRedux';
import {
  setScriptId,
  validScriptPropType
} from '@cdo/apps/redux/scriptSelectionRedux';
import {stageIsAllAssessment} from '@cdo/apps/templates/progress/progressHelpers';
import firehoseClient from '../../lib/util/firehose';
import experiments from '@cdo/apps/util/experiments';
import ProgressViewHeader from './ProgressViewHeader';

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
  }
};

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
    section: sectionDataPropType.isRequired,
    validScripts: PropTypes.arrayOf(validScriptPropType).isRequired,
    currentView: PropTypes.oneOf(Object.values(ViewType)),
    scriptData: scriptDataPropType,
    loadScript: PropTypes.func.isRequired,
    setScriptId: PropTypes.func.isRequired,
    setLessonOfInterest: PropTypes.func.isRequired,
    isLoadingProgress: PropTypes.bool.isRequired,
    showStandardsIntroDialog: PropTypes.bool
  };

  componentDidMount() {
    this.props.loadScript(this.props.scriptId);
  }

  onChangeScript = scriptId => {
    this.props.setScriptId(scriptId);
    this.props.loadScript(scriptId);

    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'change_script',
        data_json: JSON.stringify({
          section_id: this.props.section.id,
          old_script_id: this.props.scriptId,
          new_script_id: scriptId
        })
      },
      {includeUserId: true}
    );
  };

  onChangeLevel = lessonOfInterest => {
    this.props.setLessonOfInterest(lessonOfInterest);
  };

  renderTooltips() {
    return this.props.scriptData.stages.map(stage => (
      <ReactTooltip
        id={tooltipIdForLessonNumber(stage.position)}
        key={tooltipIdForLessonNumber(stage.position)}
        role="tooltip"
        wrapper="span"
        effect="solid"
      >
        {stageIsAllAssessment(stage.levels) && (
          <FontAwesome icon="check-circle" style={styles.icon} />
        )}
        {stage.name}
      </ReactTooltip>
    ));
  }

  navigateToScript = () => {
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'go_to_script',
        data_json: JSON.stringify({
          section_id: this.props.section.id,
          script_id: this.props.scriptId
        })
      },
      {includeUserId: true}
    );
  };

  render() {
    const {
      validScripts,
      currentView,
      scriptId,
      scriptData,
      isLoadingProgress,
      showStandardsIntroDialog
    } = this.props;

    const levelDataInitialized = scriptData && !isLoadingProgress;
    const lessons = scriptData ? scriptData.stages : [];
    const csfCourseSelected =
      levelDataInitialized && !scriptData.excludeCsfColumnInLegend;
    const summaryStyle =
      currentView === ViewType.SUMMARY ? styles.show : styles.hide;
    const detailStyle =
      currentView === ViewType.DETAIL ? styles.show : styles.hide;
    const standardsStyle =
      currentView === ViewType.STANDARDS ? styles.show : styles.hide;
    return (
      <div>
        <div style={styles.topRowContainer}>
          <div>
            <div style={{...h3Style, ...styles.heading}}>
              {i18n.selectACourse()}
            </div>
            <ScriptSelector
              validScripts={validScripts}
              scriptId={scriptId}
              onChange={this.onChangeScript}
            />
          </div>
          {levelDataInitialized && (
            <div style={styles.toggle}>
              <div style={{...h3Style, ...styles.heading}}>{i18n.viewBy()}</div>
              <SectionProgressToggle showStandardsToggle={csfCourseSelected} />
            </div>
          )}
          {currentView === ViewType.DETAIL && lessons.length !== 0 && (
            <LessonSelector lessons={lessons} onChange={this.onChangeLevel} />
          )}
        </div>

        <ProgressViewHeader />
        <div style={{clear: 'both'}}>
          {!levelDataInitialized && (
            <FontAwesome
              id="uitest-spinner"
              icon="spinner"
              className="fa-pulse fa-3x"
            />
          )}
          {levelDataInitialized && (
            <div id="uitest-summary-view" style={summaryStyle}>
              <SummaryView />
            </div>
          )}
          {levelDataInitialized && (
            <div id="uitest-detail-view" style={detailStyle}>
              <DetailView />
            </div>
          )}
          {levelDataInitialized && this.renderTooltips()}
          {experiments.isEnabled(experiments.STANDARDS_REPORT) && (
            <div id="uitest-standards-view" style={standardsStyle}>
              <StandardsView
                showStandardsIntroDialog={
                  currentView === ViewType.STANDARDS && showStandardsIntroDialog
                }
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export const UnconnectedSectionProgress = SectionProgress;

export default connect(
  state => ({
    scriptId: state.scriptSelection.scriptId,
    section: state.sectionData.section,
    validScripts: state.scriptSelection.validScripts,
    currentView: state.sectionProgress.currentView,
    scriptData: getCurrentScriptData(state),
    studentLevelProgress: getCurrentProgress(state),
    isLoadingProgress: state.sectionProgress.isLoadingProgress,
    showStandardsIntroDialog: !state.currentUser.hasSeenStandardsReportInfo
  }),
  dispatch => ({
    loadScript(scriptId) {
      dispatch(loadScript(scriptId));
    },
    setScriptId(scriptId) {
      dispatch(setScriptId(scriptId));
    },
    setLessonOfInterest(lessonOfInterest) {
      dispatch(setLessonOfInterest(lessonOfInterest));
    }
  })
)(SectionProgress);
