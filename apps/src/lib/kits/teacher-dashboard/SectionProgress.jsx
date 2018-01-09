import React, { PropTypes, Component } from 'react';
import ScriptSelector from './ScriptSelector';

export default class SectionProgress extends Component {
  static propTypes = {
    // TODO: better detail shape?
    section: PropTypes.object.isRequired,
    validScripts: PropTypes.array.isRequired,
  };

  state = {
    // TODO: default to what is assigned to section
    scriptId: undefined
  }

  onChangeScript = scriptId => {
    this.setState({scriptId});
  }

  render() {
    const { section, validScripts } = this.props;
    const { scriptId } = this.state;

    return (
      <div>
        <ScriptSelector
          validScripts={validScripts}
          scriptId={scriptId}
          onChange={this.onChangeScript}
        />
        {!this.state.scriptId && <div>Loading/Select a course...</div>}
        {this.state.scriptId && section.students.map(student => (
          <div key={student.id}>
            <a href={`/teacher-dashboard#/sections/${section.id}/student/${student.id}/script/${scriptId}`}>
              {student.name}
            </a>
          </div>
        ))}
        <pre>{JSON.stringify(section, null, 2)}</pre>
      </div>
    );
  }
}
