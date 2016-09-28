import React from 'react';

import WorkshopTableLoader from './components/workshop_table_loader';

const SurveyResults = React.createClass({
  render() {
    return (
      <div>
        <WorkshopTableLoader
          queryUrl="/api/v1/pd/workshops/?state=Ended"
          componentToLoad="surveyResults"
        />
      </div>
    );
  }
});

export default SurveyResults;
