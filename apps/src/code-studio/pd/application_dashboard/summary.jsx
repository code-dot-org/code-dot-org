/**
 * Application Dashboard summary view.
 * Route: /summary
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import SummaryTable from './summary_table';
import RegionalPartnerDropdown from './regional_partner_dropdown';
import Spinner from '../components/spinner';
import {
  AllPartnersFilter,
  RegionalPartnerDropdownOptions as dropdownOptions
} from './constants';
import $ from 'jquery';

export class Summary extends React.Component {
  static propTypes = {
    regionalPartnerName: PropTypes.string.isRequired,
    isWorkshopAdmin: PropTypes.bool
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  state = {
    loading: true,
    applications: null,
    regionalPartnerName: this.props.regionalPartnerName,
    regionalPartnerFilter: null
  };

  componentWillMount() {
    $.ajax({
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
  }

  handleRegionalPartnerChange = (selected) => {
    const regionalPartnerFilter = selected ? selected.value : null;
    const regionalPartnerName = selected ? selected.label : this.props.regionalPartnerName;
    this.setState({ regionalPartnerName, regionalPartnerFilter });
    $.ajax({
      method: 'GET',
      url: `/api/v1/pd/applications?regional_partner_filter=${regionalPartnerFilter ? regionalPartnerFilter : AllPartnersFilter}`,
      dataType: 'json'
    }).done((data) => {
      this.setState({
        loading: false,
        applications: data
      });
    });
  };

  render() {
    if (this.state.loading) {
      return <Spinner />;
    }
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
        <div className="row">
          <SummaryTable
            caption="CS Fundamentals Facilitators"
            data={this.state.applications["csf_facilitators"]}
            path="csf_facilitators"
          />
          <SummaryTable
            caption="CS Discoveries Facilitators"
            data={this.state.applications["csd_facilitators"]}
            path="csd_facilitators"
          />
          <SummaryTable
            caption="CS Principles Facilitators"
            data={this.state.applications["csp_facilitators"]}
            path="csp_facilitators"
          />
          <SummaryTable
            caption="CS Discoveries Teachers"
            data={this.state.applications["csd_teachers"]}
            path="csd_teachers"
          />
          <SummaryTable
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
  regionalPartnerName: state.regionalPartnerName,
  regionalPartners: state.regionalPartners,
  isWorkshopAdmin: state.permissions.workshopAdmin,
}))(Summary);
