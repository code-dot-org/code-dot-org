import React from 'react';

import WorkshopTableLoader from './components/workshop_table_loader';
import SurveyResultsHeader from './components/survey_results_header';

const SurveyResults = React.createClass({
  render() {
    return (
      <div>
        <WorkshopTableLoader queryUrl="/api/v1/pd/workshops/?state=Ended&workshops_ive_facilitated=1">
          <SurveyResultsHeader />
        </WorkshopTableLoader>
      </div>
    );
  }
});

export default SurveyResults;
