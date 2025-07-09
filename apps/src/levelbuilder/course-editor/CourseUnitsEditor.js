import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

export default class CourseUnitsEditor extends Component {
  static propTypes = {
    inputStyle: PropTypes.object.isRequired,
    numberedUnits: PropTypes.string.isRequired,
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
      child => child.value
    );

    this.props.updateUnitsInCourse(selected);
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
            {this.props.numberedUnits !== 'none' && (
              <>
                <span style={{marginRight: '8px', marginBottom: '10px'}}>
                  Unit
                </span>
                <input
                  type="text"
                  style={{
                    width: '5%',
                    marginRight: '8px',
                    padding: '4px',
                    textAlign: 'center',
                  }}
                  defaultValue={index + 1}
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
