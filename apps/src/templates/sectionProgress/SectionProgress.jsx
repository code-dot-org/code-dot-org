import React, { PropTypes, Component } from 'react';
import ScriptSelector from './ScriptSelector';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import SectionProgressToggle from '@cdo/apps/templates/sectionProgress/SectionProgressToggle';
import VirtualizedDetailView from './VirtualizedDetailView';
import VirtualizedSummaryView from './VirtualizedSummaryView';
import SummaryViewLegend from './SummaryViewLegend';
import SmallChevronLink from '../SmallChevronLink';
import LessonSelector from './LessonSelector';
import { connect } from 'react-redux';
import i18n from '@cdo/locale';
import {h3Style} from "../../lib/ui/Headings";
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';
import {
  ViewType,
  loadScript,
  getCurrentProgress,
  getCurrentScriptData,
  setScriptId,
  setLessonOfInterest,
  sectionDataPropType,
  validScriptPropType,
  scriptDataPropType,
  studentLevelProgressPropType,
} from './sectionProgressRedux';

const styles = {
  heading: {
    marginBottom: 0,
  },
  selectorContainer: {
    width: '100%',
    display: 'inline-block'
  },
  scriptSelectorContainer: {
    float: 'left',
    marginRight: 10,
  },
  viewToggleContainer: {
    float: 'left',
    marginTop: 34,
  },
  lessonSelectorContainer: {
    float: 'right',
  },
  viewCourseLink: {
    float: 'right',
    marginTop: 10,
  },
  viewCourseLinkBox: {
    width: '100%',
    height: 10,
    lineHeight: '10px',
    clear: 'both'
  },
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
    scriptId: PropTypes.number.isRequired,
    section: sectionDataPropType.isRequired,
    validScripts: PropTypes.arrayOf(validScriptPropType).isRequired,
    currentView: PropTypes.oneOf(Object.values(ViewType)),
    scriptData: scriptDataPropType,
    studentLevelProgress: studentLevelProgressPropType,
    loadScript: PropTypes.func.isRequired,
    setScriptId: PropTypes.func.isRequired,
    setLessonOfInterest: PropTypes.func.isRequired,
    isLoadingProgress: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    this.props.loadScript(this.props.scriptId);
  }

  onChangeScript = scriptId => {
    this.props.setScriptId(scriptId);
    this.props.loadScript(scriptId);
  };

  onChangeLevel = lessonOfInterest => {
    this.props.setLessonOfInterest(lessonOfInterest);
  };

  render() {
    const {
      section,
      validScripts,
      currentView,
      scriptId,
      scriptData,
      studentLevelProgress,
      isLoadingProgress
    } = this.props;

    const levelDataInitialized = scriptData && !isLoadingProgress;
    const linkToOverview = scriptData ? scriptData.path : null;
    const lessons = scriptData ? scriptData.stages : [];

    return (
      <div>
        <div style={styles.viewCourseLinkBox}>
          <div style={styles.viewCourseLink}>
            {linkToOverview &&
              <SmallChevronLink
                link={linkToOverview}
                linkText={i18n.viewCourse()}
                isRtl={false}
              />
            }
          </div>
        </div>
        <div style={styles.selectorContainer}>
          <div style={styles.scriptSelectorContainer}>
            <div style={{...h3Style, ...styles.heading}}>
              {i18n.selectACourse()}
            </div>
            <ScriptSelector
              validScripts={validScripts}
              scriptId={scriptId}
              onChange={this.onChangeScript}
            />
          </div>
          <div style={styles.viewToggleContainer}>
            <SectionProgressToggle />
          </div>
          <div style={styles.lessonSelectorContainer}>
            {lessons.length !== 0 &&
              <LessonSelector
                lessons={lessons}
                onChange={this.onChangeLevel}
              />
            }
          </div>
        </div>
        <div style={{clear: 'both'}}>
          {!levelDataInitialized && <FontAwesome icon="spinner" className="fa-pulse fa-3x"/>}
          {(levelDataInitialized && currentView === ViewType.SUMMARY) &&
            <div>
              <VirtualizedSummaryView
                section={section}
                scriptData={scriptData}
                studentLevelProgress={studentLevelProgress}
              />
              <SummaryViewLegend
                showCSFProgressBox={!scriptData.excludeCsfColumnInLegend}
              />
            </div>
          }
          {(levelDataInitialized && currentView === ViewType.DETAIL) &&
            <div>
              <VirtualizedDetailView
                section={section}
                scriptData={scriptData}
                studentLevelProgress={studentLevelProgress}
              />
              <ProgressLegend
                excludeCsfColumn={true}
              />
            </div>
          }
        </div>
      </div>
    );
  }
}

export const UnconnectedSectionProgress = SectionProgress;

export default connect(state => ({
  scriptId: state.sectionProgress.scriptId,
  section: state.sectionProgress.section,
  validScripts: state.sectionProgress.validScripts,
  currentView: state.sectionProgress.currentView,
  scriptData: getCurrentScriptData(state),
  studentLevelProgress: getCurrentProgress(state),
  isLoadingProgress: state.sectionProgress.isLoadingProgress,
}), dispatch => ({
  loadScript(scriptId) {
    dispatch(loadScript(scriptId));
  },
  setScriptId(scriptId) {
    dispatch(setScriptId(scriptId));
  },
  setLessonOfInterest(lessonOfInterest) {
    dispatch(setLessonOfInterest(lessonOfInterest));
  }
}))(SectionProgress);
