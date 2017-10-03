import React, {PropTypes} from 'react';

import WorkshopTableLoader from './components/workshop_table_loader';
import SurveyResultsHeader from './components/survey_results_header';
import Permission from '../permission';

export default class SurveyResults extends React.Component {
  static propTypes = {
    params: PropTypes.shape({
      workshopId: PropTypes.string
    })
  };

  componentWillMount() {
    this.permission = new Permission();
  }

  render() {
    let queryUrl = '/api/v1/pd/workshops/?state=Ended&facilitator_view=1';

    if (this.permission.isWorkshopAdmin && this.props.params.workshopId) {
      queryUrl += `&workshop_id=${this.props.params.workshopId}`;
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
}
