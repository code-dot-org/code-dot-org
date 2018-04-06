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
import { RegionalPartnerDropdownOptions as dropdownOptions } from './constants';

const styles = {
  button: {
    margin: '20px auto'
  }
};

class CohortView extends React.Component {
  static propTypes = {
    regionalPartnerName: PropTypes.string.isRequired,
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
          applications: data,
        });
      });
  }

  handleRegionalPartnerChange = (selected) => {
    this.load(selected);
  };

  getApiUrl = (format = '') => `/api/v1/pd/applications/cohort_view${format}?role=${this.props.route.role}`;
  getJsonUrl = () => this.getApiUrl();
  getCsvUrl = () => {
    let url = this.getApiUrl('.csv');
    if (this.props.isWorkshopAdmin && this.state.regionalPartnerFilter) {
      url += `&regional_partner_filter=${this.state.regionalPartnerFilter}`;
    }

    return url;
  };

  handleDownloadCsvClick = () => {
    window.open(this.getCsvUrl());
  };

  render() {
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
            regionalPartnerFilter={this.state.regionalPartnerFilter}
            accepted={accepted}
            registered={registered}
          />
        }
        {this.props.isWorkshopAdmin &&
          <RegionalPartnerDropdown
            onChange={this.handleRegionalPartnerChange}
            regionalPartnerFilter={this.state.regionalPartnerFilter}
            additionalOptions={dropdownOptions}
          />
        }
        {this.state.loading &&
          <Spinner />
        }
        {!this.state.loading &&
          <div>
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
        }
      </div>
    );
  }
}

export default connect(state => ({
  regionalPartnerName: state.regionalPartnerName,
  isWorkshopAdmin: state.permissions.workshopAdmin
}))(CohortView);
