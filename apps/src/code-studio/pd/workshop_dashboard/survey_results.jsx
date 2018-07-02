import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {
  PermissionPropType,
  WorkshopAdmin
} from "./permission";

import WorkshopTableLoader from './components/workshop_table_loader';
import SurveyResultsHeader from './components/survey_results_header';

export class SurveyResults extends React.Component {
  static propTypes = {
    permission: PermissionPropType.isRequired,
    params: PropTypes.shape({
      workshopId: PropTypes.string
    })
  };

  render() {
    let queryUrl = '/api/v1/pd/workshops/?state=Ended&facilitator_view=1';

    if (this.props.permission.has(WorkshopAdmin) && this.props.params.workshopId) {
      queryUrl += `&workshop_id=${this.props.params.workshopId}&exclude_summer=1`;
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

export default connect(state => ({
  permission: state.permission
}))(SurveyResults);
