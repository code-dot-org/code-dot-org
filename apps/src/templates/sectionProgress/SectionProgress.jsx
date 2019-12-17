import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactTooltip from 'react-tooltip';
import ScriptSelector from './ScriptSelector';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import SectionProgressToggle from '@cdo/apps/templates/sectionProgress/SectionProgressToggle';
import VirtualizedDetailView from './VirtualizedDetailView';
import VirtualizedSummaryView from './VirtualizedSummaryView';
import SummaryViewLegend from './SummaryViewLegend';
import LessonSelector from './LessonSelector';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {h3Style} from '../../lib/ui/Headings';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';
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
  validScriptPropType,
  getSelectedScriptFriendlyName
} from '@cdo/apps/redux/scriptSelectionRedux';
import {stageIsAllAssessment} from '@cdo/apps/templates/progress/progressHelpers';
import color from '../../util/color';
import firehoseClient from '../../lib/util/firehose';
import experiments from '@cdo/apps/util/experiments';

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
  tableHeader: {
    marginBottom: 10
  },
  scriptLink: {
    color: color.teal
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
    scriptFriendlyName: PropTypes.string.isRequired
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

  // Re-attaches mouse handlers on tooltip targets to tooltips.  Called
  // after the virtualized MultiGrid component scrolls, which may cause
  // target cells to be created or destroyed.
  afterScroll = _.debounce(ReactTooltip.rebuild, 10);

  getLinkToOverview() {
    const {scriptData, section} = this.props;
    return scriptData ? `${scriptData.path}?section_id=${section.id}` : null;
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
      section,
      validScripts,
      currentView,
      scriptId,
      scriptData,
      isLoadingProgress,
      scriptFriendlyName
    } = this.props;

    const levelDataInitialized = scriptData && !isLoadingProgress;
    const linkToOverview = this.getLinkToOverview();
    const lessons = scriptData ? scriptData.stages : [];
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
          <div style={styles.toggle}>
            <div style={{...h3Style, ...styles.heading}}>{i18n.viewBy()}</div>
            <SectionProgressToggle />
          </div>

          {currentView === ViewType.DETAIL && lessons.length !== 0 && (
            <LessonSelector lessons={lessons} onChange={this.onChangeLevel} />
          )}
        </div>
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
              <div
                style={{...h3Style, ...styles.heading, ...styles.tableHeader}}
              >
                <span>{i18n.lessonsAttempted() + ' '}</span>
                <a
                  href={linkToOverview}
                  style={styles.scriptLink}
                  onClick={this.navigateToScript}
                >
                  {scriptFriendlyName}
                </a>
              </div>
              <VirtualizedSummaryView
                section={section}
                scriptData={scriptData}
                onScroll={this.afterScroll}
              />
              <SummaryViewLegend
                showCSFProgressBox={!scriptData.excludeCsfColumnInLegend}
              />
            </div>
          )}
          {levelDataInitialized && (
            <div id="uitest-detail-view" style={detailStyle}>
              <div
                style={{...h3Style, ...styles.heading, ...styles.tableHeader}}
              >
                <span>{i18n.levelsAttempted() + ' '}</span>
                <a
                  href={linkToOverview}
                  style={styles.scriptLink}
                  onClick={this.navigateToScript}
                >
                  {scriptFriendlyName}
                </a>
              </div>
              <VirtualizedDetailView
                section={section}
                stageExtrasEnabled={section.stageExtras}
                scriptData={scriptData}
                onScroll={this.afterScroll}
              />
              <ProgressLegend
                excludeCsfColumn={scriptData.excludeCsfColumnInLegend}
              />
            </div>
          )}
        </div>
        {levelDataInitialized && this.renderTooltips()}
        {experiments.isEnabled(experiments.STANDARDS_REPORT) && (
          <div style={standardsStyle}>Coming soon...</div>
        )}
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
    scriptFriendlyName: getSelectedScriptFriendlyName(state)
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
