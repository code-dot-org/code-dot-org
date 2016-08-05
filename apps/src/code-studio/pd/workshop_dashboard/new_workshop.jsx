/**
 * Creates a new workshop.
 * Route: /workshops/new
 */
import React from 'react';
import WorkshopForm from './components/workshop_form';

const NewWorkshop = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  handleSaved(workshop) {
    this.context.router.push(`/workshops/${workshop.id}`);
  },

  render() {
    return (
      <div>
        <h2>New Workshop</h2>
        <WorkshopForm onSaved={this.handleSaved} />
      </div>
    );
  }
});
export default NewWorkshop;
