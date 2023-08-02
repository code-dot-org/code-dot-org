import PropTypes from 'prop-types';
import React, {Component} from 'react';

// Exporting ages to use in react components that need to store state internally.
export const ages = [
  '',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21+',
];

/**
 * A dropdown with the set of ages we use across our site (4-20, 21+)
 **/

export default class AgeDropdown extends Component {
  static propTypes = {
    style: PropTypes.object,
    age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };

  /**
   * @returns {string}
   */
  getValue() {
    return this.root.value;
  }

  render() {
    const age = this.props.age && this.props.age.toString();

    return (
      <select
        ref={element => (this.root = element)}
        name="age"
        style={this.props.style}
        id="uitest-age-selector"
        defaultValue={age}
      >
        {ages.map(age => (
          <option key={age} value={age}>
            {age}
          </option>
        ))}
      </select>
    );
  }
}
