/**
 * Application Cohort View
 */
import React, {PropTypes} from 'react';
import Spinner from '../components/spinner';
import {
  Row,
  Col,
  Button,
  FormGroup,
  ControlLabel
} from 'react-bootstrap';
import Select from "react-select";
import $ from 'jquery';
import downloadCsv from '../downloadCsv';
import AdminCohortViewTable from './admin_cohort_view_table';

const styles = {
  downloadCsvButton: {
    marginTop: 25
  }
};

const roles = [
  'Teacher',
  'New Facilitator',
  'Lead Facilitator',
  'Regional Partner'
];

const dates = {
  TeacherCon: [
    {display: 'June 17-22, Atlanta, Georgia', city: 'Atlanta'},
    {display: 'July 22-27, Phoenix, Arizona', city: 'Phoenix'}
  ],
  FiT: [
    {display: 'June 23-24, Atlanta, Georgia', city: 'Atlanta'},
    {display: 'July 28-29, Phoenix, Arizona', city: 'Phoenix'}
  ]
};

export default class AdminCohortView extends React.Component {
  static propTypes = {
    route: PropTypes.shape({
      cohortType: PropTypes.oneOf(['TeacherCon', 'FiT'])
    })
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      cohort: null,
      filter: {
        role: null,
        date: null
      },
      filteredCohort: null
    };

    this.load();
  }

  componentWillUnmount() {
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
  }

  handleDownloadCsv = () => {
     const headers = {
      date_accepted: 'Date Accepted',
      applicant_name: 'Name',
      district_name: 'School District',
      school_name: 'School Name',
      email: 'Email',
      assigned_workshop: 'Assigned Workshop',
      registered_workshop: 'Registered Workshop',
      accepted_seat: 'Accepted Seat?'
    };

    const filteredCohortWithFormData = this.state.filteredCohort.map(row => {
      if (!row.form_data) {
        return row;
      }

      // The keys in form_data vary based on registration type (TC/FiT), and on other answers.
      // Make sure we include all form_data keys that appear on any row:
      Object.keys(row.form_data).forEach(formDataHeader => {
        if (!headers[formDataHeader]) {
          // Use the raw formData key as the column header
          headers[formDataHeader] = formDataHeader;
        }
      });

      return {...row, ...row.form_data};
    });

    downloadCsv({
      data: filteredCohortWithFormData,
      filename: `${this.props.route.cohortType.toLowerCase()}_cohort.csv`,
      headers
    });
  };

  handleRoleFilterChange = selected => {
    const role = selected ? selected.value : null;
    this.filterCohort({role});
  };

  handleDateFilterChange = selected => {
    const date = selected ? selected.value : null;
    this.filterCohort({date});
  };

  filterCohort(filterOverrides) {
    const filter = {...this.state.filter, ...filterOverrides};
    let filteredCohort = this.state.cohort;
    if (filter.role) {
      filteredCohort = filteredCohort.filter(a => a.role === filter.role);
    }
    if (filter.date) {
      filteredCohort = filteredCohort.filter(a => a.assigned_workshop.includes(filter.date));
    }

    this.setState({
      filter,
      filteredCohort
    });
  }

  getUrl = () => `/api/v1/pd/applications/${this.props.route.cohortType.toLowerCase()}_cohort`;

  load() {
    this.loadRequest = $.ajax({
      method: 'GET',
      url: this.getUrl(),
      dataType: 'json'
    }).done(data => {
      this.loadRequest = null;
      this.setState({
        loading: false,
        cohort: data,
        filteredCohort: data
      });
    });
  }

  render() {
    if (this.state.loading) {
      return <Spinner />;
    }

    return (
      <div>
        <h2>
          {this.props.route.cohortType} Cohort
        </h2>
        <Row>
          <Col sm={2}>
            <Button
              style={styles.downloadCsvButton}
              onClick={this.handleDownloadCsv}
            >
              Download CSV
            </Button>
          </Col>
          <Col sm={2} smOffset={6}>
            {this.props.route.cohortType === 'TeacherCon' &&
              <FormGroup>
                <ControlLabel>
                  Filter by Role
                </ControlLabel>
                <Select
                  value={this.state.filter.role}
                  options={roles.map(role => ({value: role, label: role}))}
                  placeholder="All Roles"
                  onChange={this.handleRoleFilterChange}
                />
              </FormGroup>
            }
          </Col>
          <Col sm={2}>
            <FormGroup>
              <ControlLabel>
                Filter by Date
              </ControlLabel>
              <Select
                value={this.state.filter.date}
                options={dates[this.props.route.cohortType].map(teachercon => (
                  {value: teachercon.city, label: teachercon.display}
                ))}
                placeholder="All Dates"
                onChange={this.handleDateFilterChange}
              />
            </FormGroup>
          </Col>
        </Row>
        <AdminCohortViewTable
          data={this.state.filteredCohort}
        />
      </div>
    );
  }
}
