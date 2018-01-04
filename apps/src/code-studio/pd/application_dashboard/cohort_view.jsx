/**
 * Application Cohort View
 */
import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import Spinner from '../components/spinner';
import $ from 'jquery';
import CohortViewTable from './cohort_view_table';

class CohortView extends React.Component{
  static propTypes = {
    regionalPartnerName: PropTypes.string.isRequired,
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
          <h1>{this.props.regionalPartnerName}</h1>
          <h2>{this.props.route.applicationType}</h2>
          <CohortViewTable
            data={this.state.applications}
          />
        </div>
      );
    }
  }
}

export default connect(state => ({
  regionalPartnerName: state.regionalPartnerName,
}))(CohortView);
