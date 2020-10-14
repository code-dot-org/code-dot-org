/**
 * Application Dashboard summary view.
 * Route: /summary
 */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import SummaryTable from './summary_table';
import {Row, Col} from 'react-bootstrap';
import RegionalPartnerDropdown, {
  RegionalPartnerPropType
} from '../components/regional_partner_dropdown';
import ApplicantSearch from './applicant_search';
import AdminNavigationButtons from './admin_navigation_buttons';
import Spinner from '../components/spinner';
import $ from 'jquery';

export class Summary extends React.Component {
  static propTypes = {
    regionalPartnerFilter: RegionalPartnerPropType.isRequired,
    showRegionalPartnerDropdown: PropTypes.bool,
    isWorkshopAdmin: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      applications: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.regionalPartnerFilter !== nextProps.regionalPartnerFilter) {
      this.load(nextProps.regionalPartnerFilter);
    }
  }

  componentWillMount() {
    this.load(this.props.regionalPartnerFilter);
  }

  componentWillUnmount() {
    this.abortLoad();
  }

  abortLoad() {
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
  }

  load(regionalPartnerFilter) {
    this.abortLoad();
    this.setState({loading: true});

    let url = '/api/v1/pd/applications';
    if (this.props.showRegionalPartnerDropdown) {
      url += `?${$.param({
        regional_partner_value: regionalPartnerFilter.value
      })}`;
    }

    this.loadRequest = $.ajax({
      method: 'GET',
      url,
      dataType: 'json'
    }).done(data => {
      this.setState({
        loading: false,
        applications: data
      });
    });
  }

  render() {
    if (this.state.loading) {
      return <Spinner />;
    }
    return (
      <div>
        <ApplicantSearch />
        {this.props.isWorkshopAdmin && <AdminNavigationButtons />}
        {this.props.showRegionalPartnerDropdown && <RegionalPartnerDropdown />}
        <h1>{this.props.regionalPartnerFilter.label}</h1>
        <Row>
          <Col sm={6}>
            <SummaryTable
              id="summary-csd-teachers"
              caption="CS Discoveries Teachers"
              data={this.state.applications['csd_teachers']}
              path="csd_teachers"
              applicationType="teacher"
            />
          </Col>
          <Col sm={6}>
            <SummaryTable
              id="summary-csp-teachers"
              caption="CS Principles Teachers"
              data={this.state.applications['csp_teachers']}
              path="csp_teachers"
              applicationType="teacher"
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default connect(state => {
  const isWorkshopAdmin = state.applicationDashboard.permissions.workshopAdmin;

  return {
    regionalPartnerFilter: state.regionalPartners.regionalPartnerFilter,
    isWorkshopAdmin,
    showRegionalPartnerDropdown:
      isWorkshopAdmin || state.regionalPartners.regionalPartners.length > 1
  };
})(Summary);
