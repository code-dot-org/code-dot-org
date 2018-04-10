import React, { PropTypes, Component } from 'react';
import ScriptSelector from './ScriptSelector';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import SectionProgressToggle from '@cdo/apps/templates/sectionProgress/SectionProgressToggle';
import VirtualizedDetailView from './VirtualizedDetailView';
import VirtualizedSummaryView from './VirtualizedSummaryView';
import SummaryViewLegend from './SummaryViewLegend';
import { connect } from 'react-redux';
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

/**
 * Given a particular section, this component owns figuring out which script to
 * show progress for (selected via a dropdown), and querying the server for
 * student progress. Child components then have the responsibility for displaying
 * that progress.
 */
class SectionProgress extends Component {
  static propTypes = {
    //Provided by redux
    scriptId: PropTypes.string.isRequired,
    section: sectionDataPropType.isRequired,
    validScripts: PropTypes.arrayOf(validScriptPropType).isRequired,
    currentView: PropTypes.oneOf(Object.values(ViewType)),
    scriptData: scriptDataPropType,
    studentLevelProgress: studentLevelProgressPropType,

    loadScript: PropTypes.func.isRequired,
    setScriptId: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.loadScript(this.props.scriptId);
  }

  onChangeScript = scriptId => {
    this.props.setScriptId(scriptId);
    this.props.loadScript(scriptId);
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

    return (
      <div>
        <ScriptSelector
          validScripts={validScripts}
          scriptId={scriptId}
          onChange={this.onChangeScript}
        />
        <SectionProgressToggle />
        {!levelDataInitialized && <FontAwesome icon="spinner" className="fa-pulse fa-3x"/>}
        {(levelDataInitialized && currentView === ViewType.SUMMARY) &&
          <div>
            <VirtualizedSummaryView
              section={section}
              scriptData={scriptData}
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
            />
          </div>
        }
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
