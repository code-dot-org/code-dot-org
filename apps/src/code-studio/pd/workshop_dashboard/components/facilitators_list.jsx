/**
 * List of facilitators for display in the workshop summary.
 */
import React, {PropTypes} from 'react';

export default class FacilitatorsList extends React.Component {
  static propTypes = {
    facilitators: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string
      })
    ).isRequired
  };

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
}
