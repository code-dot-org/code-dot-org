/**
 * Application Dashboard quick view.
 * Route: /csd_teachers
 *        /csp_teachers
 *        /csf_facilitators
 *        /csd_facilitators
 *        /csp_facilitators
 */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import {SelectStyleProps} from '../constants';
import CohortCalculator, {countAcceptedApplications} from './cohort_calculator';
import RegionalPartnerDropdown, {
  RegionalPartnerPropType
} from '../components/regional_partner_dropdown';
import QuickViewTable from './quick_view_table';
import Spinner from '../components/spinner';
import $ from 'jquery';
import {getApplicationStatuses} from './constants';
import {Button, FormGroup, ControlLabel, Row, Col} from 'react-bootstrap';

const styles = {
  button: {
    margin: '20px 20px 20px auto'
  },
  select: {
    width: 250
  }
};

export class QuickView extends React.Component {
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

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      applications: null,
      filter: ''
    };
    this.loadRequest = null;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.regionalPartnerFilter !== nextProps.regionalPartnerFilter) {
      this.load(nextProps.regionalPartnerFilter.value);
    }
  }

  UNSAFE_componentWillMount() {
    const statusList = getApplicationStatuses(this.props.route.viewType);
    this.statuses = Object.keys(statusList).map(v => ({
      value: v,
      label: statusList[v]
    }));
    this.statuses.unshift({value: '', label: 'All statuses'});

    this.load(this.props.regionalPartnerFilter.value);
  }

  componentWillUnmount() {
    this.abortLoad();
  }

  abortLoad() {
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
  }

  load(regionalPartnerFilterValue) {
    this.abortLoad();
    this.setState({loading: true});

    this.loadRequest = $.ajax({
      method: 'GET',
      url: this.getJsonUrl(regionalPartnerFilterValue),
      dataType: 'json'
    }).done(data => {
      this.setState({
        loading: false,
        applications: data
      });
      this.loadRequest = null;
    });
  }

  getApiUrl = (format, regionalPartnerFilterValue) =>
    `/api/v1/pd/applications/quick_view${format}?${$.param(
      this.getApiParams(regionalPartnerFilterValue)
    )}`;
  getApiParams = regionalPartnerFilterValue => ({
    role: this.props.route.role,
    regional_partner_value: regionalPartnerFilterValue
  });
  getJsonUrl = regionalPartnerFilterValue =>
    this.getApiUrl('', regionalPartnerFilterValue);
  getCsvUrl = regionalPartnerFilterValue =>
    this.getApiUrl('.csv', regionalPartnerFilterValue);

  handleDownloadCsvClick = event => {
    window.open(this.getCsvUrl(this.props.regionalPartnerFilter.value || ''));
  };

  handleViewCohortClick = () => {
    this.context.router.push(`/${this.props.route.path}_cohort`);
  };

  handleStateChange = selected => {
    const filter = selected ? selected.value : null;
    this.setState({filter});
  };

  render() {
    return (
      <div>
        {this.state.applications && (
          <CohortCalculator
            role={this.props.route.role}
            regionalPartnerFilterValue={this.props.regionalPartnerFilter.value}
            accepted={countAcceptedApplications(this.state.applications)}
          />
        )}
        {this.props.showRegionalPartnerDropdown && <RegionalPartnerDropdown />}
        <Row>
          <h1>{this.props.regionalPartnerFilter.label}</h1>
          <h2>{this.props.route.applicationType}</h2>
          <Col md={6} sm={6}>
            <Button style={styles.button} onClick={this.handleDownloadCsvClick}>
              Download CSV
            </Button>
            <Button style={styles.button} onClick={this.handleViewCohortClick}>
              View accepted cohort
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
                clearable={false}
                {...SelectStyleProps}
              />
            </FormGroup>
          </Col>
        </Row>
        {this.state.loading ? <Spinner /> : this.renderApplicationsTable()}
      </div>
    );
  }

  renderApplicationsTable() {
    return (
      <QuickViewTable
        path={this.props.route.path}
        applications={this.state.applications}
        statusFilter={this.state.filter}
        regionalPartnerName={this.props.regionalPartnerFilter.label}
        viewType={this.props.route.viewType}
      />
    );
  }
}

export default connect(state => ({
  regionalPartnerFilter: state.regionalPartners.regionalPartnerFilter,
  showRegionalPartnerDropdown:
    state.regionalPartners.regionalPartners.length > 1
}))(QuickView);
