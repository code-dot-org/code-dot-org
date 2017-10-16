/**
 * Application Dashboard summary view.
 * Route: /summary
 */
import React from 'react';
import SummaryTable from './summary_table';

export default class Summary extends React.Component {
  render() {
    return (
      <div>
        <h1>All Regional Partner Applications</h1>
        <SummaryTable caption="CSD Facilitators"/>
        <SummaryTable caption="CSP Facilitators"/>
        <SummaryTable caption="CSD Teachers"/>
        <SummaryTable caption="CSP Teachers"/>
      </div>
    );
  }
}
