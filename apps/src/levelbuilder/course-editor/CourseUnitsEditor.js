import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import {NumberedUnitsType} from '@cdo/apps/generated/curriculum/sharedCourseConstants';

export default class CourseUnitsEditor extends Component {
  static propTypes = {
    inputStyle: PropTypes.object.isRequired,
    numberedUnits: PropTypes.oneOf(Object.values(NumberedUnitsType)),
    initialUnitPrefixes: PropTypes.arrayOf(PropTypes.string),
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
    this.props.updateUnitPrefixes(newPrefixes);
  };

  getDisplayValue = index => {
    if (this.props.numberedUnits === NumberedUnitsType.custom) {
      return this.props.unitPrefixes[index] || '';
    }
    // For auto or any other case, show index + 1
    return (index + 1).toString();
  };

  render() {
    const {unitNames} = this.props;
    return (
      <div>
        {this.props.unitsInCourse.concat('').map((selectedUnit, index) => (
          <div
            key={index}
            style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}
          >
            {this.props.numberedUnits !== NumberedUnitsType.none && (
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
                  value={this.getDisplayValue(index)}
                  onChange={e => this.handlePrefixChange(index, e.target.value)}
                  disabled={
                    this.props.numberedUnits !== NumberedUnitsType.custom
                  }
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
