/**
 * Application Dashboard quick view.
 * Route: /csd_teachers
 *        /csp_teachers
 *        /csf_facilitators
 *        /csd_facilitators
 *        /csp_facilitators
 */
import React, {PropTypes} from 'react';
import QuickViewTable from './quick_view_table';
import Spinner from '../components/spinner';
import {Button} from 'react-bootstrap';
import $ from 'jquery';

const styles = {
  button: {
    margin: '20px auto'
  }
};

export default class QuickView extends React.Component {
  static propTypes = {
    route: PropTypes.shape({
      regionalPartnerName: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      applicationType: PropTypes.string.isRequired
    })
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  state = {
    loading: true,
    applications: null
  };

  getApiUrl = (format = '') => `/api/v1/pd/applications/quick_view${format}?role=${this.props.route.path}`;
  getJsonUrl = () => this.getApiUrl();
  getCsvUrl = () => this.getApiUrl('.csv');

  componentWillMount() {
    $.ajax({
      method: 'GET',
      url: this.getJsonUrl(),
      dataType: 'json'
    })
    .done(data => {
      this.setState({
        loading: false,
        applications: data
      });
    });
  }

  handleDownloadCsvClick = event => {
    window.open(this.getCsvUrl());
  };

  render() {
    if (this.state.loading) {
      return <Spinner/>;
    }

    return (
      <div>
        <h1>{this.props.route.regionalPartnerName}</h1>
        <h2>{this.props.route.applicationType}</h2>
        <Button
          style={styles.button}
          onClick={this.handleDownloadCsvClick}
        >
          Download CSV
        </Button>
        <QuickViewTable
          path={this.props.route.path}
          data={this.state.applications}
        />
      </div>
    );
  }
}
