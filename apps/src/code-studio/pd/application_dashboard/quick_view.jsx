/**
 * Application Dashboard quick view.
 * Route: /csd_teachers
 *        /csp_teachers
 *        /csf_facilitators
 *        /csd_facilitators
 *        /csp_facilitators
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Select from "react-select";
import "react-select/dist/react-select.css";
import { SelectStyleProps } from '../constants';
import RegionalPartnerDropdown from './regional_partner_dropdown';
import QuickViewTable from './quick_view_table';
import Spinner from '../components/spinner';
import $ from 'jquery';
import {
  ApplicationStatuses,
  RegionalPartnerDropdownOptions as dropdownOptions
} from './constants';
import {
  Button,
  FormGroup,
  ControlLabel,
  Row,
  Col
} from 'react-bootstrap';

const styles = {
  button: {
    margin: '20px auto'
  },
  select: {
    width: '200px'
  }
};

export class QuickView extends React.Component {
  static propTypes = {
    regionalPartnerName: PropTypes.string.isRequired,
    isWorkshopAdmin: PropTypes.bool,
    route: PropTypes.shape({
      path: PropTypes.string.isRequired,
      applicationType: PropTypes.string.isRequired,
      viewType: PropTypes.oneOf(['teacher', 'facilitator']).isRequired
    })
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  state = {
    loading: true,
    applications: null,
    filter: null,
    regionalPartnerName: this.props.regionalPartnerName,
    regionalPartnerFilter: null
  };

  componentWillMount() {
    $.ajax({
      method: 'GET',
      url: this.getJsonUrl(),
      dataType: 'json'
    })
    .done(data => {
      this.setState({
        loading: false,
        applications: data
      });
    });

    const statusList = ApplicationStatuses[this.props.route.viewType];
    this.statuses = statusList.map(v => ({value: v.toLowerCase(), label: v}));
    this.statuses.unshift({value: null, label: "\u00A0"});
  }

  getApiUrl = (format = '') => `/api/v1/pd/applications/quick_view${format}?role=${this.props.route.path}`;
  getJsonUrl = () => this.getApiUrl();
  getCsvUrl = () => this.getApiUrl('.csv');

  handleDownloadCsvClick = event => {
    window.open(this.getCsvUrl());
  };

  handleStateChange = (selected) => {
    const filter = selected ? selected.value : null;
    this.setState({ filter });
  };

  handleRegionalPartnerChange = (selected) => {
    const regionalPartnerFilter = selected ? selected.value : null;
    const regionalPartnerName = regionalPartnerFilter ? selected.label : this.props.regionalPartnerName;
    this.setState({ regionalPartnerName, regionalPartnerFilter });
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
        <Row>
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
          <Col md={6} sm={6}>
            <FormGroup className="pull-right">
              <ControlLabel>Filter by Status</ControlLabel>
              <Select
                value={this.state.filter}
                onChange={this.handleStateChange}
                placeholder={null}
                options={this.statuses}
                style={styles.select}
                {...SelectStyleProps}
              />
            </FormGroup>
          </Col>
        </Row>
        <QuickViewTable
          path={this.props.route.path}
          data={this.state.applications}
          statusFilter={this.state.filter}
          regionalPartnerFilter={this.state.regionalPartnerFilter}
          viewType={this.props.route.viewType}
        />
      </div>
    );
  }
}

export default connect(state => ({
  regionalPartnerName: state.regionalPartnerName,
  isWorkshopAdmin: state.permissions.workshopAdmin,
}))(QuickView);
