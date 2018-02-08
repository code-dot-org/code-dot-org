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
  UnmatchedFilter,
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

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      applications: null,
      filter: '',
      regionalPartnerName: props.regionalPartnerName,
      regionalPartnerFilter: props.isWorkshopAdmin ? UnmatchedFilter : ''
    };
    this.loadRequest = null;
  }

  componentWillMount() {
    this.load();

    const statusList = ApplicationStatuses[this.props.route.viewType];
    this.statuses = statusList.map(v => ({value: v.toLowerCase(), label: v}));
    this.statuses.unshift({value: '', label: "All statuses"});
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

    this.loadRequest = $.ajax({
      method: 'GET',
      url: this.getJsonUrl(regionalPartnerFilter),
      dataType: 'json'
    }).done(data => {
      this.setState({
        loading: false,
        applications: data
      });
    });
  }

  getApiUrl = (format, regionalPartnerFilter) => (
    `/api/v1/pd/applications/quick_view${format}?${$.param(this.getApiParams(regionalPartnerFilter))}`
  );
  getApiParams = (regionalPartnerFilter) => ({
    role: this.props.route.path,
    regional_partner_filter: regionalPartnerFilter
  });
  getJsonUrl = (regionalPartnerFilter) => this.getApiUrl('', regionalPartnerFilter);
  getCsvUrl = (regionalPartnerFilter) => this.getApiUrl('.csv', regionalPartnerFilter);

  handleDownloadCsvClick = event => {
    window.open(this.getCsvUrl(this.state.regionalPartnerFilter || ''));
  };

  handleStateChange = (selected) => {
    const filter = selected ? selected.value : null;
    this.setState({ filter });
  };

  handleRegionalPartnerChange = (selected) => {
    const regionalPartnerFilter = selected ? selected.value : null;
    const regionalPartnerName = regionalPartnerFilter ? selected.label : this.props.regionalPartnerName;
    this.setState({ regionalPartnerName, regionalPartnerFilter });

    this.load(regionalPartnerFilter);
  };

  render() {
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
        regionalPartnerName={this.props.regionalPartnerName}
        viewType={this.props.route.viewType}
      />
    );
  }
}

export default connect(state => ({
  regionalPartnerName: state.regionalPartnerName,
  isWorkshopAdmin: state.permissions.workshopAdmin,
}))(QuickView);
