import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

export default class CourseUnitsEditor extends Component {
  static propTypes = {
    inputStyle: PropTypes.object.isRequired,
    unitsInCourse: PropTypes.arrayOf(PropTypes.string).isRequired,
    unitNames: PropTypes.arrayOf(PropTypes.string).isRequired,
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
    const {unitNames} = this.props;
    return (
      <div>
        {this.props.unitsInCourse.concat('').map((selectedScript, index) => (
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
              Select a unit to add to course
            </option>
            {unitNames.map((name, index) => (
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
