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
    return (
      <div>
        <WorkshopTableLoader queryUrl="/api/v1/pd/workshops/?state=Ended&facilitator_view=1">
          <SurveyResultsHeader
            preselectedWorkshopId={this.props.params && this.props.params['workshopId']}
          />
        </WorkshopTableLoader>
      </div>
    );
  }
});

export default SurveyResults;
