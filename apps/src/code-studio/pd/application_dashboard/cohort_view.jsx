/**
 * Application Cohort View
 */
import React, {PropTypes} from 'react';
import Spinner from '../components/spinner';
import $ from 'jquery';
import CohortViewTable from './cohort_view_table';

export default class CohortView extends React.Component{
  static propTypes = {
    route: PropTypes.shape({
      path: PropTypes.string.isRequired,
      applicationType: PropTypes.string.isRequired
    })
  }

  state = {
    loading: true,
    applications: null
  }

  componentWillMount() {
    $.ajax({
      method: 'GET',
      url: `/api/v1/pd/applications/cohort_view.json_view?role=${this.props.route.path.replace('_cohort', '')}`,
      dataType: 'json'
    })
    .done(data => {
      this.setState({
        loading: false,
        applications: data
      });
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <Spinner/>
      );
    } else {
      return (
        <div>
          {this.props.route.applicationType}
          <CohortViewTable
            data={this.state.applications}
          />
        </div>
      );
    }
  }
}
