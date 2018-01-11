import React, { PropTypes, Component } from 'react';
import ScriptSelector from './ScriptSelector';
import { getLevelResult } from '@cdo/apps/code-studio/progressRedux';
import SectionScriptProgress from './SectionScriptProgress';
import _ from 'lodash';

/**
 * Given a particular section, this component owns figuring out which script to
 * show progress for (selected via a dropdown), and querying the server for
 * student progress. Child components then have the responsibility for displaying
 * that progress.
 */
export default class SectionProgress extends Component {
  static propTypes = {
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
  };

  state = {
    // TODO: default to what is assigned to section, or at least come up with
    // some heuristic so that we have a default
    scriptId: "112",
    scriptData: null,
    studentLevelProgress: null,
  }

  componentDidMount() {
    this.loadScript(this.state.scriptId);
  }

  onChangeScript = scriptId => {
    this.setState({
      scriptId,
      scriptData: null,
      studentLevelProgress: null,
    });
    this.loadScript(scriptId);
  }

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
    const { scriptId, scriptData, studentLevelProgress } = this.state;

    let levelDataInitialized = scriptData && studentLevelProgress;

    return (
      <div>
        <ScriptSelector
          validScripts={validScripts}
          scriptId={scriptId}
          onChange={this.onChangeScript}
        />
        {!levelDataInitialized && <div>Loading...</div>}
        {levelDataInitialized &&
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
