import React, { PropTypes, Component } from 'react';
import ScriptSelector from './ScriptSelector';
import SectionScriptProgress from './SectionScriptProgress';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import SectionProgressToggle from '@cdo/apps/templates/sectionProgress/SectionProgressToggle';
import VirtualizedDetailView from './VirtualizedDetailView';
import { connect } from 'react-redux';
import {ViewType, loadScript, getCurrentProgress, getCurrentScriptData, setScriptId} from './sectionProgressRedux';

/**
 * Given a particular section, this component owns figuring out which script to
 * show progress for (selected via a dropdown), and querying the server for
 * student progress. Child components then have the responsibility for displaying
 * that progress.
 */
class SectionProgress extends Component {
  static propTypes = {
    //Provided by redux
    // The section we get directly from angular right now. This gives us a
    // different shape than some other places we use sections. For now, I'm just
    // going to document the parts of section that we use here
    section: PropTypes.shape({
      id: PropTypes.number.isRequired,
      students: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      })).isRequired
    }).isRequired,
    validScripts: PropTypes.arrayOf(PropTypes.shape({
      category: PropTypes.string.isRequired,
      category_priority: PropTypes.number.isRequired,
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      position: PropTypes.number,
    })).isRequired,
    currentView: PropTypes.oneOf(Object.values(ViewType)),
    loadScript: PropTypes.func.isRequired,
    scriptId: PropTypes.string.isRequired,
    scriptData: PropTypes.object,
    studentLevelProgress: PropTypes.object,
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
            <h1>This will be the summary view</h1>
          </div>
        }
        {(levelDataInitialized && currentView === ViewType.DETAIL) &&
          <div>
            <VirtualizedDetailView
              section={section}
              scriptData={scriptData}
            />
            <SectionScriptProgress
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
