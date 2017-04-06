import React from 'react';

import WorkshopTableLoader from './components/workshop_table_loader';
import SurveyResultsHeader from './components/survey_results_header';

const SurveyResults = React.createClass({
  propTypes: {
    params: React.PropTypes.shape({
      workshopId: React.PropTypes.string
    })
  },

  render() {
    let queryUrl;

    // Admins need to hit a different endpoint, because they are not facilitators or
    // organizers of a particular workshop. So just hit the api and get the workshop
    // that is asked for in the params
    if (window.dashboard.workshop.permission === 'admin' && this.props.params.workshopId) {
      queryUrl = `/api/v1/pd/workshops/${this.props.params.workshopId}`;
    } else {
      queryUrl = `/api/v1/pd/workshops/?state=Ended&facilitator_view=1`;
    }

    return (
      <div>
        <WorkshopTableLoader queryUrl={queryUrl}>
          <SurveyResultsHeader
            preselectedWorkshopId={this.props.params && this.props.params['workshopId']}
          />
        </WorkshopTableLoader>
      </div>
    );
  }
});

export default SurveyResults;
