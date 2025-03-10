/**
 * Creates a new workshop.
 * Route: /workshops/new
 */
import React from 'react';

import {RouterContext} from '@cdo/apps/code-studio/legacyDashboardRoutingCompatibility';

import WorkshopForm from './components/workshop_form';

export default class NewWorkshop extends React.Component {
  static contextType = RouterContext;

  handleSaved = workshop => {
    this.context.router.push(`/workshops/${workshop.id}`);
  };

  render() {
    return (
      <div>
        <h2>New Workshop</h2>
        <WorkshopForm onSaved={this.handleSaved} today={new Date()} />
      </div>
    );
  }
}
