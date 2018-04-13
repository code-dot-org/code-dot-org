/**
 * Application Dashboard summary view.
 * Route: /summary
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import SummaryTable from './summary_table';
import RegionalPartnerDropdown from './regional_partner_dropdown';
import ApplicantSearch from './applicant_search';
import AdminNavigationButtons from './admin_navigation_buttons';
import Spinner from '../components/spinner';
import {
  RegionalPartnerDropdownOptions as dropdownOptions,
  RegionalPartnerPropType
} from './constants';
import $ from 'jquery';

export class Summary extends React.Component {
  static propTypes = {
    regionalPartnerFilter: RegionalPartnerPropType.isRequired,
    isWorkshopAdmin: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      applications: null,
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

  load(regionalPartnerFilter = this.props.regionalPartnerFilter) {
    this.abortLoad();
    this.setState({loading: true});

    let url = '/api/v1/pd/applications';
    if (this.props.isWorkshopAdmin) {
      url += `?${$.param({regional_partner_value: regionalPartnerFilter.value})}`;
    }

    this.loadRequest = $.ajax({
      method: 'GET',
      url,
      dataType: 'json'
    }).done((data) => {
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
        <ApplicantSearch/>
        {this.props.isWorkshopAdmin &&
          <AdminNavigationButtons/>
        }
        {this.props.isWorkshopAdmin &&
          <RegionalPartnerDropdown
            regionalPartnerFilter={this.props.regionalPartnerFilter}
            additionalOptions={dropdownOptions}
          />
        }
        <h1>{this.props.regionalPartnerFilter.label}</h1>
        <div className="row">
          <SummaryTable
            id="summary-csf-facilitators"
            caption="CS Fundamentals Facilitators"
            data={this.state.applications["csf_facilitators"]}
            path="csf_facilitators"
          />
          <SummaryTable
            id="summary-csd-facilitators"
            caption="CS Discoveries Facilitators"
            data={this.state.applications["csd_facilitators"]}
            path="csd_facilitators"
          />
          <SummaryTable
            id="summary-csp-facilitators"
            caption="CS Principles Facilitators"
            data={this.state.applications["csp_facilitators"]}
            path="csp_facilitators"
          />
          <SummaryTable
            id="summary-csd-teachers"
            caption="CS Discoveries Teachers"
            data={this.state.applications["csd_teachers"]}
            path="csd_teachers"
          />
          <SummaryTable
            id="summary-csp-teachers"
            caption="CS Principles Teachers"
            data={this.state.applications["csp_teachers"]}
            path="csp_teachers"
          />
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  regionalPartnerFilter: state.regionalPartnerFilter,
  isWorkshopAdmin: state.permissions.workshopAdmin,
}))(Summary);
