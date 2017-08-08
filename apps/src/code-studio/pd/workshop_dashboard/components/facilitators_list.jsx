/**
 * List of facilitators for display in the workshop summary.
 */
import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';

const FacilitatorsList = createReactClass({
  propTypes: {
    facilitators: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string
      })
    ).isRequired
  },

  render() {
    const listItems = this.props.facilitators.map((facilitator, i) => {
      return (
        <li key={i}>
          {facilitator.name} ({facilitator.email})
        </li>
      );
    });

    return (
      <ul>
        {listItems}
      </ul>
    );
  }
});
export default FacilitatorsList;
