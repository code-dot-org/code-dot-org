/**
 * List of facilitators for display in the workshop summary.
 */
import React from 'react';

var FacilitatorsList = React.createClass({
  propTypes: {
    facilitators: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        name: React.PropTypes.string,
        email: React.PropTypes.string
      })
    ).isRequired
  },

  render() {
    var listItems = this.props.facilitators.map((facilitator, i) => {
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
