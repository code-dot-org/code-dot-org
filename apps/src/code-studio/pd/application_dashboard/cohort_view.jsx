/**
 * Application Cohort View
 */
import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import Spinner from '../components/spinner';
import $ from 'jquery';
import CohortViewTable from './cohort_view_table';
import RegionalPartnerDropdown from './regional_partner_dropdown';
import {
  RegionalPartnerDropdownOptions as dropdownOptions,
  UnmatchedFilter
} from './constants';


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
    let url = `/api/v1/pd/applications/cohort_view.json_view?role=${this.props.route.path.replace('_cohort', '')}`;
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
