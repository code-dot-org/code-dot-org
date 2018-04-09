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
import CohortCalculator from './cohort_calculator';
import RegionalPartnerDropdown from './regional_partner_dropdown';
import QuickViewTable from './quick_view_table';
import Spinner from '../components/spinner';
import $ from 'jquery';
import {
  ApplicationStatuses,
  RegionalPartnerDropdownOptions as dropdownOptions,
  RegionalPartnerFilterPropType
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

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      applications: null,
      filter: ''
    };
    this.loadRequest = null;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.regionalPartnerFilter !== nextProps.regionalPartnerFilter) {
      this.load(nextProps.regionalPartnerFilter.value);
    }
  }

  componentWillMount() {
    const statusList = ApplicationStatuses[this.props.route.viewType];
    this.statuses = statusList.map(v => ({value: v.toLowerCase(), label: v}));
    this.statuses.unshift({value: '', label: "All statuses"});

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

  load(regionalPartnerValue = this.props.regionalPartnerFilter.value) {
    this.abortLoad();
    this.setState({loading: true});

    this.loadRequest = $.ajax({
      method: 'GET',
      url: this.getJsonUrl(regionalPartnerValue),
      dataType: 'json'
    }).done(data => {
      this.setState({
        loading: false,
        applications: data
      });
      this.loadRequest = null;
    });
  }

  getApiUrl = (format, regionalPartnerValue) => (
    `/api/v1/pd/applications/quick_view${format}?${$.param(this.getApiParams(regionalPartnerValue))}`
  );
  getApiParams = (regionalPartnerValue) => ({
    role: this.props.route.role,
    regional_partner_value: regionalPartnerValue
  });
  getJsonUrl = (regionalPartnerValue) => this.getApiUrl('', regionalPartnerValue);
  getCsvUrl = (regionalPartnerValue) => this.getApiUrl('.csv', regionalPartnerValue);

  handleDownloadCsvClick = event => {
    window.open(this.getCsvUrl(this.props.regionalPartnerFilter.value || ''));
  };

  handleStateChange = (selected) => {
    const filter = selected ? selected.value : null;
    this.setState({ filter });
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
            regionalPartnerValue={this.props.regionalPartnerFilter.value}
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
        <Row>
          <h1>{this.props.regionalPartnerFilter.label}</h1>
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
                clearable={false}
                {...SelectStyleProps}
              />
            </FormGroup>
          </Col>
        </Row>
        {this.state.loading
          ? <Spinner />
          : this.renderApplicationsTable()
        }
      </div>
    );
  }

  renderApplicationsTable() {
    return (
      <QuickViewTable
        path={this.props.route.path}
        data={this.state.applications}
        statusFilter={this.state.filter}
        regionalPartnerName={this.props.regionalPartnerFilter.label}
        viewType={this.props.route.viewType}
      />
    );
  }
}

export default connect(state => ({
  regionalPartnerFilter: state.regionalPartnerFilter,
  isWorkshopAdmin: state.permissions.workshopAdmin,
}))(QuickView);
