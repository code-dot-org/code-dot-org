import React, { PropTypes, Component } from 'react';
import ScriptSelector from './ScriptSelector';
import ProgressBubbleSet from '@cdo/apps/templates/progress/ProgressBubbleSet';
import { levelsByLesson } from '@cdo/apps/code-studio/progressRedux';

const styles = {
  bubbles: {
    overflowX: 'scroll',
    whiteSpace: 'nowrap',
  }
};

export default class SectionProgress extends Component {
  static propTypes = {
    // TODO: better detail shape?
    section: PropTypes.object.isRequired,
    validScripts: PropTypes.array.isRequired,
  };

  state = {
    // TODO: default to what is assigned to section, or at least come up with
    // some heuristic so that we have a default
    scriptId: "224",
    scriptStructure: null,
  }

  componentDidMount() {
    this.loadScript(this.state.scriptId);
  }

  onChangeScript = scriptId => {
    this.setState({
      scriptId,
      levelsByLesson: []
    });
    this.loadScript(scriptId);
  }

  loadScript(scriptId) {
    $.getJSON(`/dashboardapi/script_structure/${scriptId}`, scriptData => {
      let state = {
        ...scriptData,
        levelProgress: {}
      };
      const levels = levelsByLesson(state);
      this.setState({
        levelsByLesson: levels
      });
    });
  }

  render() {
    const { section, validScripts } = this.props;
    const { scriptId, levelsByLesson } = this.state;

    // api_controller#script_structure to get level data

    return (
      <div>
        <ScriptSelector
          validScripts={validScripts}
          scriptId={scriptId}
          onChange={this.onChangeScript}
        />
        {section.students.map(student => (
          <div key={student.id}>
            <a href={`/teacher-dashboard#/sections/${section.id}/student/${student.id}/script/${scriptId}`}>
              {student.name}
            </a>
            {levelsByLesson &&
              <div style={styles.bubbles}>
                {levelsByLesson.map(levels =>
                  <ProgressBubbleSet
                    levels={levels}
                    disabled={false}
                  />
                )}
              </div>
            }
          </div>
        ))}
        <pre>{JSON.stringify(section, null, 2)}</pre>
      </div>
    );
  }
}
