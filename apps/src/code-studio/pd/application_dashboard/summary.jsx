/**
 * Application Dashboard summary view.
 * Route: /summary
 */
import $ from 'jquery';
import {mapValues, omit} from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {Row, Col} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import {connect} from 'react-redux';

import Spinner from '../../../sharedComponents/Spinner';
import RegionalPartnerDropdown, {
  RegionalPartnerPropType,
} from '../components/regional_partner_dropdown';

import AdminNavigationButtons from './admin_navigation_buttons';
import ApplicantSearch from './applicant_search';
import SummaryTable from './summary_table';

export const removeIncompleteApplications = data =>
  mapValues(data, data_by_status => omit(data_by_status, ['incomplete']));

export class Summary extends React.Component {
  static propTypes = {
    regionalPartnerFilter: RegionalPartnerPropType.isRequired,
    isWorkshopAdmin: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      applications: null,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.regionalPartnerFilter !== nextProps.regionalPartnerFilter) {
      this.load(nextProps.regionalPartnerFilter);
    }
  }

  UNSAFE_componentWillMount() {
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

    let url = `/api/v1/pd/applications?${$.param({
      regional_partner_value: regionalPartnerFilter.value,
    })}`;

    this.loadRequest = $.ajax({
      method: 'GET',
      url,
      dataType: 'json',
    }).done(data => {
      this.setState({
        loading: false,
        applications: this.props.isWorkshopAdmin
          ? data
          : removeIncompleteApplications(data),
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
        <RegionalPartnerDropdown />
        <h1>{this.props.regionalPartnerFilter.label}</h1>
        <Row>
          <Col sm={6}>
            <SummaryTable
              id="summary-csd-teachers"
              caption="CS Discoveries Teachers"
              data={this.state.applications['csd_teachers']}
              path="csd_teachers"
              isWorkshopAdmin={this.props.isWorkshopAdmin}
            />
          </Col>
          <Col sm={6}>
            <SummaryTable
              id="summary-csp-teachers"
              caption="CS Principles Teachers"
              data={this.state.applications['csp_teachers']}
              path="csp_teachers"
              isWorkshopAdmin={this.props.isWorkshopAdmin}
            />
          </Col>
          <Col sm={6}>
            <SummaryTable
              id="summary-csa-teachers"
              caption="Computer Science A Teachers"
              data={this.state.applications['csa_teachers']}
              path="csa_teachers"
              isWorkshopAdmin={this.props.isWorkshopAdmin}
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
  };
})(Summary);
