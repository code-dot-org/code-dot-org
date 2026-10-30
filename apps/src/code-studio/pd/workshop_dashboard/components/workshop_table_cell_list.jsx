/**
 * List of facilitators for display in the workshop summary.
 */
import PropTypes from 'prop-types';
import React from 'react';

export default class WorkshopTableCellList extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  };

  render() {
    return (
      <ul>
        {this.props.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
}
