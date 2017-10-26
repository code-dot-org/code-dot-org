/**
 * Application Dashboard summary view.
 * Route: /summary
 */
import React, {PropTypes} from 'react';
import SummaryTable from './summary_table';
import Spinner from '../components/spinner';
import $ from 'jquery';

export default class Summary extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  state = {
    loading: true,
    applications: null
  };

  componentWillMount() {
    this.load();
  }

  load = (props = this.props) => {
    this.loadRequest = $.ajax({
      method: 'GET',
      url: '/api/v1/pd/applications',
      dataType: 'json'
    })
    .done(data => {
      this.setState({
        loading: false,
        applications: data
      });
    });
  };

  render() {
    if (this.state.loading) {
      return (
        <div>
          <Spinner/>
        </div>
      );
    } else {
      return (
        <div className="row">
          <h1>All Regional Partner Applications</h1>
          <SummaryTable caption="CSF Facilitators" data={this.state.applications["csf_facilitators"]} path="csf_facilitators"/>
          <SummaryTable caption="CSD Facilitators" data={this.state.applications["csd_facilitators"]} path="csd_facilitators"/>
          <SummaryTable caption="CSP Facilitators" data={this.state.applications["csp_facilitators"]} path="csp_facilitators"/>
        </div>
      );
    }
  }
}

Summary.childContextTypes = {
  router: PropTypes.object
};
