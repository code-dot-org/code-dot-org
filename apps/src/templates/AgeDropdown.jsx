import React, { PropTypes, Component } from 'react';

// Exporting ages to use in react components that need to store state internally.
export const ages = ['', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14',
  '15', '16', '17', '18', '19', '20', '21+'];

/**
 * A dropdown with the set of ages we use across our site (4-20, 21+)
 * NOTE: this is pretty similarly to a component in dashboard's
 * ReportAbuseForm.jsx. In an ideal world, we would have a better way of
 * sharing components between dashboard/apps and have any difference between
 * the two version controlled by props.
 */
export default class AgeDropdown extends Component {
  static propTypes = {
    style: PropTypes.object
  };

  /**
   * @returns {string}
   */
  getValue() {
    return this.root.value;
  }

  render() {
    return (
      <select
        ref={element => this.root = element}
        name="age"
        style={this.props.style}
      >
       {ages.map(age => <option key={age} value={age}>{age}</option>)}
      </select>
    );
  }
}
