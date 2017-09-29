import React, {PropTypes} from 'react';

import WorkshopTableLoader from './components/workshop_table_loader';
import SurveyResultsHeader from './components/survey_results_header';

const OrganizerSurveyResults = React.createClass({
  propTypes: {
    params: PropTypes.shape({
      workshopId: PropTypes.string
    })
  },

  render() {
    return (
      <div>
        <WorkshopTableLoader queryUrl="/api/v1/pd/workshops/?state=Ended&organizer_view=1">
          <SurveyResultsHeader
            organizerView={true}
            preselectedWorkshopId={this.props.params && this.props.params['workshopId']}
          />
        </WorkshopTableLoader>
      </div>
    );
  }
});

export default OrganizerSurveyResults;
