import React from 'react';

import WorkshopTableLoader from './components/workshop_table_loader';
import SurveyResultsHeader from './components/survey_results_header';

const OrganizerSurveyResults = React.createClass({
  render() {
    return (
      <div>
        <WorkshopTableLoader queryUrl="/api/v1/pd/workshops/?state=Ended">
          <SurveyResultsHeader
            organizerView={true}
          />
        </WorkshopTableLoader>
      </div>
    );
  }
});

export default OrganizerSurveyResults;
