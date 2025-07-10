import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

export default class CourseUnitsEditor extends Component {
  static propTypes = {
    inputStyle: PropTypes.object.isRequired,
    numberedUnits: PropTypes.string.isRequired,
    initialUnitPrefixes: PropTypes.arrayOf(PropTypes.string).isRequired,
    unitPrefixes: PropTypes.arrayOf(PropTypes.string).isRequired,
    updateUnitPrefixes: PropTypes.func.isRequired,
    initialUnitsInCourse: PropTypes.arrayOf(PropTypes.string).isRequired,
    unitsInCourse: PropTypes.arrayOf(PropTypes.string).isRequired,
    unitNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    updateUnitsInCourse: PropTypes.func.isRequired,
    allowMajorCurriculumChanges: PropTypes.bool.isRequired,
  };

  handleChange = () => {
    const root = ReactDOM.findDOMNode(this);

    let selected = Array.prototype.map.call(
      root.children,
      child => child.querySelector('.uitest-unit-selector').value
    );

    this.props.updateUnitsInCourse(selected);
  };

  handlePrefixChange = (index, value) => {
    const newPrefixes = [...this.props.unitPrefixes];
    newPrefixes[index] = value;
    console.log(newPrefixes[index]);
    this.props.updateUnitPrefixes(newPrefixes);
  };

  render() {
    const {unitNames} = this.props;
    console.log(this.props.unitPrefixes);
    return (
      <div>
        {this.props.unitsInCourse.concat('').map((selectedUnit, index) => (
          <div
            key={index}
            style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}
          >
            {this.props.numberedUnits !== null && (
              <>
                <span style={{marginRight: '8px', marginBottom: '10px'}}>
                  Unit
                </span>
                <input
                  className="uitest-unit-prefix-input"
                  type="text"
                  style={{
                    width: '5%',
                    marginRight: '8px',
                    padding: '4px',
                    textAlign: 'center',
                  }}
                  defaultValue={this.props.unitPrefixes[index]}
                  onChange={e => this.handlePrefixChange(index, e.target.value)}
                  disabled={this.props.numberedUnits === 'auto'}
                />
              </>
            )}
            <select
              className="uitest-unit-selector"
              style={{
                ...this.props.inputStyle,
                opacity: selectedUnit === '' ? 0.4 : 1,
              }}
              value={selectedUnit}
              onChange={this.handleChange}
              disabled={
                !this.props.allowMajorCurriculumChanges &&
                this.props.initialUnitsInCourse.includes(selectedUnit)
              }
            >
              <option key="-1" value="">
                Select a unit to add to course
              </option>
              {unitNames.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
              {this.props.initialUnitsInCourse.map((courseUnitName, index) => (
                <option key={unitNames.length + index} value={courseUnitName}>
                  {courseUnitName}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }
}
