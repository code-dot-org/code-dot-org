/**
 * Application Cohort View
 */
import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import Spinner from '../components/spinner';
import $ from 'jquery';
import CohortViewTable from './cohort_view_table';
import RegionalPartnerDropdown from './regional_partner_dropdown';
import { Button, Col } from 'react-bootstrap';
import {
  RegionalPartnerDropdownOptions as dropdownOptions,
  UnmatchedFilter
} from './constants';

const styles = {
  button: {
    margin: '20px auto'
  }
};

class CohortView extends React.Component{
  static propTypes = {
    regionalPartnerName: PropTypes.string.isRequired,
    isWorkshopAdmin: PropTypes.bool,
    route: PropTypes.shape({
      path: PropTypes.string.isRequired,
      applicationType: PropTypes.string.isRequired,
      viewType: PropTypes.oneOf(['teacher', 'facilitator']).isRequired
    })
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  state = {
    loading: true,
    applications: null,
    regionalPartnerName: this.props.regionalPartnerName,
    regionalPartnerFilter: UnmatchedFilter
  }

  componentWillMount() {
    this.load();
  }

  load(selected = null) {
    let url = this.getJsonUrl();
    if (this.props.isWorkshopAdmin) {
      const regionalPartnerFilter = selected ? selected.value : this.state.regionalPartnerFilter;
      const regionalPartnerName = selected ? selected.label : this.state.regionalPartnerName;
      this.setState({ regionalPartnerName, regionalPartnerFilter });

      url += `&regional_partner_filter=${regionalPartnerFilter}`;
    }

    $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    })
      .done(data => {
        this.setState({
          loading: false,
          applications: data
        });
      });
  }

  handleRegionalPartnerChange = (selected) => {
    this.load(selected);
  };

  getApiUrl = (format = '') => `/api/v1/pd/applications/cohort_view${format}?role=${this.props.route.path.replace('_cohort', '')}`;
  getJsonUrl = () => this.getApiUrl();
  getCsvUrl = () => {
    let url = this.getApiUrl('.csv');
    if (this.props.isWorkshopAdmin && this.state.regionalPartnerFilter) {
      url += `&regional_partner_filter=${this.state.regionalPartnerFilter}`;
    }

    return url;
  }

  handleDownloadCsvClick = () => {
    window.open(this.getCsvUrl());
  }

  render() {
    if (this.state.loading) {
      return (
        <Spinner/>
      );
    } else {
      return (
        <div>
          {this.props.isWorkshopAdmin &&
            <RegionalPartnerDropdown
              onChange={this.handleRegionalPartnerChange}
              regionalPartnerFilter={this.state.regionalPartnerFilter}
              additionalOptions={dropdownOptions}
            />
          }
          <h1>{this.state.regionalPartnerName}</h1>
          <h2>{this.props.route.applicationType}</h2>
          <Col md={6} sm={6}>
            <Button
              style={styles.button}
              onClick={this.handleDownloadCsvClick}
            >
              Download CSV
            </Button>
          </Col>
          <CohortViewTable
            data={this.state.applications}
            viewType={this.props.route.viewType}
            path={this.props.route.path}
          />
        </div>
      );
    }
  }
}

export default connect(state => ({
  regionalPartnerName: state.regionalPartnerName,
  isWorkshopAdmin: state.permissions.workshopAdmin
}))(CohortView);
