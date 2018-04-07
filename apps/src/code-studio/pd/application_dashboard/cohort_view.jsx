/**
 * Application Cohort View
 */
import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import Spinner from '../components/spinner';
import $ from 'jquery';
import CohortViewTable from './cohort_view_table';
import CohortCalculator from './cohort_calculator';
import RegionalPartnerDropdown from './regional_partner_dropdown';
import { Button, Col } from 'react-bootstrap';
import {
  RegionalPartnerDropdownOptions as dropdownOptions,
  RegionalPartnerFilterPropType
} from './constants';

const styles = {
  button: {
    margin: '20px auto'
  }
};

class CohortView extends React.Component {
  static propTypes = {
    regionalPartnerName: PropTypes.string.isRequired,
    regionalPartnerFilter: RegionalPartnerFilterPropType.isRequired,
    isWorkshopAdmin: PropTypes.bool,
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
    applications: null,
    regionalPartnerName: this.props.regionalPartnerName
  };

  componentWillMount() {
    this.load(this.props.regionalPartnerFilter);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.regionalPartnerFilter !== nextProps.regionalPartnerFilter) {
      this.load(nextProps.regionalPartnerFilter);
    }
  }

  load(regionalPartnerFilter = this.props.regionalPartnerFilter) {
    let url = this.getJsonUrl();
    if (this.props.isWorkshopAdmin) {
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
          applications: data,
        });
      });
  }

  getApiUrl = (format = '') => `/api/v1/pd/applications/cohort_view${format}?role=${this.props.route.role}`;
  getJsonUrl = () => this.getApiUrl();
  getCsvUrl = () => {
    let url = this.getApiUrl('.csv');
    if (this.props.isWorkshopAdmin && this.props.regionalPartnerFilter) {
      url += `&regional_partner_filter=${this.props.regionalPartnerFilter}`;
    }

    return url;
  };

  handleDownloadCsvClick = () => {
    window.open(this.getCsvUrl());
  };

  render() {
    if (this.state.loading) {
      return (
        <Spinner />
      );
    } else {
      let accepted = 0;
      let registered = 0;
      if (this.state.applications !== null) {
        accepted = this.state.applications
        .filter(app => app.status === 'accepted')
        .length;
        registered = this.state.applications
          .filter(app => app.registered_workshop === 'Yes')
          .length;
      }
      return (
        <div>
          {this.state.applications &&
            <CohortCalculator
              role={this.props.route.role}
              regionalPartnerFilter={this.props.regionalPartnerFilter}
              accepted={accepted}
              registered={registered}
            />
          }
          {this.props.isWorkshopAdmin &&
            <RegionalPartnerDropdown
              regionalPartnerFilter={this.props.regionalPartnerFilter}
              additionalOptions={dropdownOptions}
            />
          }
          <h1>{this.props.regionalPartnerName}</h1>
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
  regionalPartnerFilter: state.regionalPartnerFilter,
  isWorkshopAdmin: state.permissions.workshopAdmin
}))(CohortView);
