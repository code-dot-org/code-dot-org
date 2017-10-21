/**
 * Application Dashboard summary view.
 * Route: /summary
 */
import React from 'react';
import SummaryTable from './summary_table';
import Spinner from '../components/spinner';

export default class Summary extends React.Component {
  state = {
    loading: true,
    applications: null
  };

  componentDidMount() {
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
        <div>
          <h1>All Regional Partner Applications</h1>
          <SummaryTable caption="CSF Facilitators" data={this.state.applications["csf_facilitator"]}/>
          <SummaryTable caption="CSD Facilitators" data={this.state.applications["csd_facilitator"]}/>
          <SummaryTable caption="CSP Facilitators" data={this.state.applications["csp_facilitator"]}/>
          <SummaryTable caption="CSD Teachers" data={this.state.applications["csd_teacher"]}/>
          <SummaryTable caption="CSP Teachers" data={this.state.applications["csp_teacher"]}/>
        </div>
      );
    }
  }
}
