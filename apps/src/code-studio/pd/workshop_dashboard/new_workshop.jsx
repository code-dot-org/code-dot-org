/**
 * Creates a new workshop.
 * Route: /workshops/new
 */
import React, {PropTypes} from 'react';
import WorkshopForm from './components/workshop_form';

export default class NewWorkshop extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  handleSaved = (workshop) => {
    this.context.router.push(`/workshops/${workshop.id}`);
  };

  render() {
    return (
      <div>
        <h2>New Workshop</h2>
        <WorkshopForm onSaved={this.handleSaved} />
      </div>
    );
  }
}
