import React, { PropTypes, Component } from 'react';
import ScriptSelector from './ScriptSelector';
import { getLevelResult } from '@cdo/apps/code-studio/progressRedux';
import SectionScriptProgress from './SectionScriptProgress';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import SectionProgressToggle from '@cdo/apps/templates/sectionProgress/SectionProgressToggle';
import _ from 'lodash';
import { connect } from 'react-redux';

/**
 * Given a particular section, this component owns figuring out which script to
 * show progress for (selected via a dropdown), and querying the server for
 * student progress. Child components then have the responsibility for displaying
 * that progress.
 */
class SectionProgress extends Component {
  static propTypes = {
    // The section we get directly from angular right now. This gives us a
    // different shape than some other places we use sections. For now, I'm just
    // going to document the parts of section that we use here

    //Provided by redux
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
  };

  state = {
    // TODO: default to what is assigned to section, or at least come up with
    // some heuristic so that we have a default
    scriptId: "112",
    scriptData: null,
    studentLevelProgress: null,
    isSummaryView: false,
  };

  componentDidMount() {
    this.loadScript(this.state.scriptId);
  }

  toggleView = () => {
    this.setState({
      isSummaryView: !this.state.isSummaryView
    });
  };

  onChangeScript = scriptId => {
    this.setState({
      scriptId,
      scriptData: null,
      studentLevelProgress: null,
    });
    this.loadScript(scriptId);
  };

  /**
   * Query the server for script data (info about the levels in the script) and
   * also for user progress on that script
   */
  loadScript(scriptId) {
    $.getJSON(`/dashboardapi/script_structure/${scriptId}`, scriptData => {
      this.setState({
        scriptData
      });
    });

    $.getJSON(`/dashboardapi/section_level_progress/${this.props.section.id}?script_id=${scriptId}`, dataByStudent => {
      // dataByStudent is an object where the keys are student.id and the values
      // are a map of levelId to status
      let studentLevelProgress = {};
      Object.keys(dataByStudent).forEach(studentId => {
        studentLevelProgress[studentId] = _.mapValues(dataByStudent[studentId], getLevelResult);
      });

      this.setState({
        studentLevelProgress: studentLevelProgress
      });
    });
  }

  render() {
    const { section, validScripts } = this.props;
    const { scriptId, scriptData, studentLevelProgress, isSummaryView } = this.state;

    let levelDataInitialized = scriptData && studentLevelProgress;

    return (
      <div>
        <ScriptSelector
          validScripts={validScripts}
          scriptId={scriptId}
          onChange={this.onChangeScript}
        />
        <SectionProgressToggle isSummaryView={isSummaryView} toggleView={this.toggleView}/>
        {!levelDataInitialized && <FontAwesome icon="spinner" className="fa-pulse fa-3x"/>}
        {(levelDataInitialized && isSummaryView) &&
          <div>{"This will be the summary view"}</div>
        }
        {(levelDataInitialized && !isSummaryView) &&
          <SectionScriptProgress
            section={section}
            scriptData={scriptData}
            studentLevelProgress={studentLevelProgress}
          />
        }
      </div>
    );
  }
}

export const UnconnectedSectionProgress = SectionProgress;

export default connect(state => ({
  section: state.sectionProgress.section
}))(SectionProgress);
