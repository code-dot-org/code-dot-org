import PropTypes from 'prop-types';
import React, {Component} from 'react';

export const dropdownStyles = {
  dropdown: {
    display: 'block',
    boxSizing: 'border-box',
    fontSize: 'medium',
    height: 34,
    paddingLeft: 5,
    paddingRight: 5,
    width: 300,
  },
};

export default class UnitSelector extends Component {
  static propTypes = {
    coursesWithProgress: PropTypes.array.isRequired,
    scriptId: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
  };

  render() {
    const {scriptId, onChange, coursesWithProgress} = this.props;

    return (
      <div>
        <select
          value={scriptId || undefined}
          onChange={event => onChange(parseInt(event.target.value))}
          style={dropdownStyles.dropdown}
          id="uitest-course-dropdown"
        >
          {coursesWithProgress.map((version, index) => (
            <optgroup key={index} label={version.display_name}>
              {version.units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    );
  }
}
