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
import { RegionalPartnerDropdownOptions as dropdownOptions } from './constants';
import $ from 'jquery';

export class Summary extends React.Component {
  static propTypes = {
    regionalPartnerName: PropTypes.string,
    isWorkshopAdmin: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      applications: null,
    };
  }

  componentWillUnmount() {
    this.abortLoad();
  }

  abortLoad() {
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
  }

  load(regionalPartnerFilter = this.state.regionalPartnerFilter) {
    this.abortLoad();
    this.setState({loading: true});

    let url = '/api/v1/pd/applications';
    if (this.props.isWorkshopAdmin) {
      url += `?${$.param({regional_partner_filter: regionalPartnerFilter})}`;
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

  handleRegionalPartnerChange = (selected) => {
    const regionalPartnerName = selected.label;
    const regionalPartnerFilter = selected.value;
    this.setState({regionalPartnerName, regionalPartnerFilter});
    this.load(selected.value);
  };

  render() {
    return (
      <div>
        <ApplicantSearch/>
        {this.props.isWorkshopAdmin &&
          <AdminNavigationButtons/>
        }
        {this.props.isWorkshopAdmin &&
          <RegionalPartnerDropdown
            onChange={this.handleRegionalPartnerChange}
            regionalPartnerFilter={this.state.regionalPartnerFilter}
            additionalOptions={dropdownOptions}
          />
        }
        <h1>{this.state.regionalPartnerName}</h1>
        {this.state.loading
          ? <Spinner />
          : this.renderSummaryTables()
        }
      </div>
    );
  }

  renderSummaryTables() {
    return (
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
    );
  }
}

export default connect(state => ({
  regionalPartnerName: state.regionalPartnerName,
  isWorkshopAdmin: state.permissions.workshopAdmin,
}))(Summary);
