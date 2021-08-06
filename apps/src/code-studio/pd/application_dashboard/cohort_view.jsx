/**
 * Application Cohort View
 */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import Spinner from '../components/spinner';
import $ from 'jquery';
import CohortViewTable from './cohort_view_table';
import CohortCalculator, {countAcceptedApplications} from './cohort_calculator';
import RegionalPartnerDropdown, {
  RegionalPartnerPropType
} from '../components/regional_partner_dropdown';
import {Button, Col, Row} from 'react-bootstrap';

class CohortView extends React.Component {
  static propTypes = {
    regionalPartnerFilter: RegionalPartnerPropType,
    showRegionalPartnerDropdown: PropTypes.bool,
    route: PropTypes.shape({
      path: PropTypes.string.isRequired,
      applicationType: PropTypes.string.isRequired,
      viewType: PropTypes.oneOf(['teacher', 'facilitator']).isRequired,
      role: PropTypes.string.isRequired
    })
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  state = {
    loading: true,
    applications: null
  };

  UNSAFE_componentWillMount() {
    this.load(this.props.regionalPartnerFilter);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.regionalPartnerFilter !== nextProps.regionalPartnerFilter) {
      this.load(nextProps.regionalPartnerFilter);
    }
  }

  load(regionalPartnerFilter) {
    let url = this.getJsonUrl();
    if (this.props.showRegionalPartnerDropdown) {
      url += `&regional_partner_value=${regionalPartnerFilter.value}`;
    }

    $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    }).done(data => {
      this.setState({
        loading: false,
        applications: data
      });
    });
  }

  getApiUrl = (format = '') =>
    `/api/v1/pd/applications/cohort_view${format}?role=${
      this.props.route.role
    }`;
  getJsonUrl = () => this.getApiUrl();
  getCsvUrl = () => {
    let url = this.getApiUrl('.csv');
    if (
      this.props.showRegionalPartnerDropdown &&
      this.props.regionalPartnerFilter
    ) {
      url += `&regional_partner_value=${
        this.props.regionalPartnerFilter.value
      }`;
    }

    return url;
  };

  handleDownloadCsvClick = () => {
    window.open(this.getCsvUrl());
  };

  handleViewAllClick = () => {
    this.context.router.push(`/${this.props.route.role}`);
  };

  render() {
    if (this.state.loading) {
      return <Spinner />;
    } else {
      return (
        <div>
          {this.state.applications && (
            <CohortCalculator
              role={this.props.route.role}
              regionalPartnerFilterValue={
                this.props.regionalPartnerFilter.value
              }
              accepted={countAcceptedApplications(this.state.applications)}
            />
          )}

          {this.props.showRegionalPartnerDropdown && (
            <RegionalPartnerDropdown />
          )}

          <h1>{this.props.regionalPartnerFilter.label}</h1>
          <h2>{this.props.route.applicationType}</h2>

          <Row>
            <Col md={6} sm={6}>
              <Button
                style={styles.button}
                onClick={this.handleDownloadCsvClick}
              >
                Download CSV
              </Button>
              <Button style={styles.button} onClick={this.handleViewAllClick}>
                View all applications
              </Button>
            </Col>
          </Row>

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

const styles = {
  button: {
    margin: '20px 20px 20px auto'
  }
};

export default connect(state => ({
  regionalPartnerFilter: state.regionalPartners.regionalPartnerFilter,
  showRegionalPartnerDropdown:
    state.regionalPartners.regionalPartners.length > 1
}))(CohortView);
