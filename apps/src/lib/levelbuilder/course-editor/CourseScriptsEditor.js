import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

export default class CourseScriptsEditor extends Component {
  static propTypes = {
    inputStyle: PropTypes.object.isRequired,
    scriptsInCourse: PropTypes.arrayOf(PropTypes.string).isRequired,
    scriptNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    updateScriptsInCourse: PropTypes.func.isRequired
  };

  handleChange = () => {
    const root = ReactDOM.findDOMNode(this);

    let selected = Array.prototype.map.call(
      root.children,
      child => child.value
    );

    this.props.updateScriptsInCourse(selected);
  };

  render() {
    const {scriptNames} = this.props;
    return (
      <div>
        {this.props.scriptsInCourse.concat('').map((selectedScript, index) => (
          <select
            style={{
              ...this.props.inputStyle,
              opacity: selectedScript === '' ? 0.4 : 1
            }}
            key={index}
            value={selectedScript}
            onChange={this.handleChange}
          >
            <option key="-1" value="">
              Select a script to add to course
            </option>
            {scriptNames.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        ))}
      </div>
    );
  }
}
