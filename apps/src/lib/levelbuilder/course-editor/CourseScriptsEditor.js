import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

export default class CourseScriptsEditor extends Component {
  static propTypes = {
    inputStyle: PropTypes.object.isRequired,
    scriptsInCourse: PropTypes.arrayOf(PropTypes.string).isRequired,
    scriptNames: PropTypes.arrayOf(PropTypes.string).isRequired
  };

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);

    this.state = {
      // want provided script names, plus one empty one
      scriptsInCourse: props.scriptsInCourse.concat('')
    };
  }

  handleChange(event) {
    const root = ReactDOM.findDOMNode(this);

    let selected = Array.prototype.map.call(
      root.children,
      child => child.value
    );
    // If the last script has a value, add a new script without one
    if (selected[selected.length - 1] !== '') {
      selected.push('');
    }
    this.setState({
      scriptsInCourse: selected
    });
  }

  render() {
    const {scriptNames} = this.props;
    return (
      <div>
        {this.state.scriptsInCourse.map((selectedScript, index) => (
          <select
            name="scripts[]"
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
