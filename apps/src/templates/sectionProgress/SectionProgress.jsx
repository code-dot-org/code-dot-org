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
import {
  ViewType,
  loadScript,
  getCurrentProgress,
  getCurrentScriptData,
  setScriptId,
  sectionDataPropType,
  validScriptPropType,
  scriptDataPropType,
  studentLevelProgressPropType,
} from './sectionProgressRedux';

const styles = {
  heading: {
    marginBottom: 0,
  },
  scriptSelectorContainer: {
    float: 'left',
    marginRight: 20,
  },
  viewToggleContainer: {
    float: 'left',
    marginTop: 24,
  },
  viewCourseLink: {
    float: 'right',
    marginTop: 10
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
    scriptId: PropTypes.number.isRequired,
    section: sectionDataPropType.isRequired,
    validScripts: PropTypes.arrayOf(validScriptPropType).isRequired,
    currentView: PropTypes.oneOf(Object.values(ViewType)),
    scriptData: scriptDataPropType,
    studentLevelProgress: studentLevelProgressPropType,
    loadScript: PropTypes.func.isRequired,
    setScriptId: PropTypes.func.isRequired,
  };

  state = {
    lessonOfInterest: 1
  };

  componentDidMount() {
    this.props.loadScript(this.props.scriptId);
  }

  onChangeScript = scriptId => {
    this.props.setScriptId(scriptId);
    // TODO(caleybrock): Only load data if the script has not already been loaded.
    this.props.loadScript(scriptId);
  };

  onChangeLevel = lessonNumber => {
    this.setState({lessonOfInterest: lessonNumber});
  };

  render() {
    const {
      section,
      validScripts,
      currentView,
      scriptId,
      scriptData,
      studentLevelProgress
    } = this.props;

    const levelDataInitialized = scriptData && studentLevelProgress;
    const linkToOverview = scriptData ? scriptData.path : null;
    const lessons = scriptData ? scriptData.stages : [];

    return (
      <div>
        <div>
          <div style={styles.scriptSelectorContainer}>
            <div style={{...h3Style, ...styles.heading}}>
              {i18n.selectACourse()}
            </div>
            <ScriptSelector
              validScripts={validScripts}
              scriptId={scriptId}
              onChange={this.onChangeScript}
            />
            {lessons.length !== 0 &&
              <LessonSelector
                lessons={lessons}
                onChange={this.onChangeLevel}
              />
            }
          </div>
          <div style={styles.viewToggleContainer}>
            <SectionProgressToggle />
          </div>
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
        <div style={{clear: 'both'}}>
          {!levelDataInitialized && <FontAwesome icon="spinner" className="fa-pulse fa-3x"/>}
          {(levelDataInitialized && currentView === ViewType.SUMMARY) &&
            <div>
              <VirtualizedSummaryView
                section={section}
                scriptData={scriptData}
                studentLevelProgress={studentLevelProgress}
                lessonOfInterest={this.state.lessonOfInterest}
              />
              <SummaryViewLegend
                showCSFProgressBox={true}
              />
            </div>
          }
          {(levelDataInitialized && currentView === ViewType.DETAIL) &&
            <div>
              <VirtualizedDetailView
                section={section}
                scriptData={scriptData}
                studentLevelProgress={studentLevelProgress}
                lessonOfInterest={this.state.lessonOfInterest}
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
}), dispatch => ({
  loadScript(scriptId) {
    dispatch(loadScript(scriptId));
  },
  setScriptId(scriptId) {
    dispatch(setScriptId(scriptId));
  },
}))(SectionProgress);
