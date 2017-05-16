/**
 * Teacher Attendance Report
 */
import React from "react";
import ReportTable from "./report_table";
import {Button} from 'react-bootstrap';
import {QUERY_BY_VALUES, COURSE_VALUES} from './report_constants';
import Spinner from '../components/spinner';

const QUERY_URL = "/api/v1/pd/teacher_attendance_report";

const styles = {
  link: {cursor: 'pointer'}
};

const TeacherAttendanceReport = React.createClass({
  propTypes: {
    startDate: React.PropTypes.string.isRequired,
    endDate: React.PropTypes.string.isRequired,
    queryBy: React.PropTypes.oneOf(QUERY_BY_VALUES).isRequired,
    course: React.PropTypes.oneOf(COURSE_VALUES)
  },

  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      loading: true,
      rows: null,
      showFacilitatorDetails: false
    };
  },

  componentDidMount() {
    this.load();
  },

  componentWillUnmount() {
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
  },

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.startDate !== this.props.startDate ||
      nextProps.endDate !== this.props.endDate ||
      nextProps.queryBy !== this.props.queryBy ||
      nextProps.course !== this.props.course
    ) {
      this.load(nextProps);
    }
  },

  formatQueryParams(props = this.props) {
    const {startDate, endDate, queryBy, course} = props;
    const course_param = course ? `&course=${course}` : null;
    return `start=${startDate}&end=${endDate}&query_by=${queryBy}${course_param}`;
  },

  load(props = this.props) {
    const url = `${QUERY_URL}?${this.formatQueryParams(props)}`;

    // Abort any existing load request.
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
    this.setState({loading: true});
    this.loadRequest = $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    })
    .done(data => {
      this.setState({
        loading: false,
        rows: data
      });
    });
  },

  formatWorkshopId(workshop_id) {
    const href = this.context.router.createHref(`/workshops/${workshop_id}`);
    return <a href={href} target="_blank" style={styles.link}>{workshop_id}</a>;
  },

  formatUrl(url) {
    return <a href={url} target="_blank" style={styles.link}>{url}</a>;
  },

  formatYesNo(value) {
    return value ? "YES" : "NO";
  },

  formatCurrency(amount) {
    return amount ? `$${Number(amount).toFixed(2)}` : null;
  },

  isWorkshopAdmin() {
    return window.dashboard.workshop.permission === 'workshop_admin';
  },

  getColumns() {
    let columns = [{
      property: 'teacher_first_name',
      header: {label: 'Teacher First Name'}
    }, {
      property: 'teacher_last_name',
      header: {label: 'Teacher Last Name'}
    }, {
      property: 'teacher_id',
      header: {label: 'Teacher Id'}
    }, {
      property: 'teacher_email',
      header: {label: 'Teacher Email'}
    }, {
      property: 'plp_name',
      header: {label: 'PLP Name'}
    }, {
      property: 'state',
      header: {label: 'State'}
    }, {
      property: 'district_name',
      header: {label: 'District Name'},
    }, {
      property: 'district_id',
      header: {label: 'District Id'},
    }, {
      property: 'school',
      header: {label: 'School'},
    }, {
      property: 'course',
      header: {label: 'Course'},
    }, {
      property: 'subject',
      header: {label: 'Subject'},
    }, {
      property: 'workshop_id',
      header: {label: 'Workshop Id'},
      cell: {format: this.formatWorkshopId}
    }, {
      property: 'workshop_dates',
      header: {label: 'Workshop Dates'},
    }, {
      property: 'workshop_name',
      header: {label: 'Workshop Name'},
    }, {
      property: 'on_map',
      header: {label: 'Shown on Map'},
    }, {
      property: 'funded',
      header: {label: 'Funded'},
    }, {
      property: 'organizer_name',
      header: {label: 'Organizer Name'},
    }, {
      property: 'organizer_email',
      header: {label: 'Organizer Email'},
    }, {
      property: 'year',
      header: {label: 'Year'},
    }, {
      property: 'hours',
      header: {label: 'Hours'},
    }, {
      property: 'days',
      header: {label: 'Days'}
    }];

    if (this.isWorkshopAdmin()) {
      columns.push({
        property: `pay_period`,
        header: {label: `Pay Period`}
      }, {
        property: `payment_type`,
        header: {label: `Payment Type`}
      }, {
        property: `payment_rate`,
        header: {label: `Payment Rate`}
      }, {
        property: `qualified`,
        header: {label: `Qualified`},
        cell: {format: this.formatYesNo}
      }, {
        property: `payment_amount`,
        header: {label: `Payment Amount`},
        cell: {format: this.formatCurrency}
      });
    }

    return columns;
  },

  handleDownloadCSVClick() {
    const downloadUrl = `${QUERY_URL}.csv?${this.formatQueryParams()}`;
    window.open(downloadUrl);
  },

  handleFacilitatorDetailsChange(e) {
    this.setState({showFacilitatorDetails: e.target.checked});
  },

  render() {
    if (this.state.loading) {
      return <Spinner/>;
    }

    return (
      <div>
        <Button
          style={{marginBottom: 20}}
          onClick={this.handleDownloadCSVClick}
        >
          Download CSV
        </Button>
        <ReportTable
          columns={this.getColumns()}
          rows={this.state.rows}
        />
      </div>
    );
  },
});
export default TeacherAttendanceReport;
