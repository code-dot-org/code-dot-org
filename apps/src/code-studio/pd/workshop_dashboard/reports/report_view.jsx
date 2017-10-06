/**
 * Report View
 * Route: /reports
 * Contains query fields (from, to, queryBy, course, report) and generates a report based on the response.
 */
import React, {PropTypes} from 'react';
import _ from 'lodash';
import moment from 'moment';
import WorkshopSummaryReport from './workshop_summary_report';
import TeacherAttendanceReport from './teacher_attendance_report';
import DatePicker from '../components/date_picker';

import {
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl
} from 'react-bootstrap';
import {
  QUERY_BY_OPTIONS,
  QUERY_BY_VALUES,
  COURSE_OPTIONS,
  COURSE_VALUES
} from './report_constants';

const REPORT_VALUES = ['Teacher Attendance', 'Workshop Summary'];
const API_DATE_FORMAT = "YYYY-MM-DD";

export default class ReportView extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    location: PropTypes.object
  };

  constructor(props) {
    super(props);
    // Get url query parameters, if present and valid
    const urlParams = this.props.location.query;
    const start = urlParams.start ? moment(urlParams.start, API_DATE_FORMAT) : null;
    const end = urlParams.end ? moment(urlParams.end, API_DATE_FORMAT) : null;
    const queryBy = urlParams.queryBy && QUERY_BY_VALUES.includes(urlParams.queryBy) ? urlParams.queryBy : null;
    const course = urlParams.course && COURSE_VALUES.includes(urlParams.course) ? urlParams.course : null;
    const report = urlParams.report && REPORT_VALUES.includes(urlParams.report) ? urlParams.report : null;

    // Default to the last week, if no start and end are specified
    this.state = {
      startDate: start || moment().subtract(1, 'week'),
      endDate: end || moment(),
      queryBy: queryBy || QUERY_BY_VALUES[0],
      course: course,
      report: report || REPORT_VALUES[0]
    };
  }

  componentDidMount() {
    this.updateLocationAndSetState();
  }

  handleStartDateChange = (date) => {
    let newState = {startDate: date};
    if (date.isAfter(this.state.endDate)) {
      newState.endDate = date;
    }
    this.updateLocationAndSetState(newState);
  };

  handleEndDateChange = (date) => {
    let newState = {endDate: date};
    if (date.isBefore(this.state.startDate)) {
      newState.startDate = date;
    }
    this.updateLocationAndSetState(newState);
  };

  handleQueryByChange = (e) => {
    this.updateLocationAndSetState({queryBy: e.target.value});
  };

  handleCourseChange = (e) => {
    this.updateLocationAndSetState({course: e.target.value});
  };

  handleReportChange = (e) => {
    this.updateLocationAndSetState({report: e.target.value});
  };

  // Updates the URL with the new query params so it can be shared,
  // and sets state (which will perform the query).
  updateLocationAndSetState(newState = {}) {
    const startDate = (newState.startDate || this.state.startDate).format(API_DATE_FORMAT);
    const endDate = (newState.endDate || this.state.endDate).format(API_DATE_FORMAT);
    const queryBy = newState.queryBy || this.state.queryBy;
    const course = newState.hasOwnProperty('course') ? newState.course : this.state.course;
    const report = newState.report || this.state.report;

    const course_param = course ? `&course=${course}` : "";
    const url = `${this.props.location.pathname}?start=${startDate}&end=${endDate}&queryBy=${queryBy}${course_param}&report=${report}`;
    this.context.router.replace(url);

    if (!_.isEmpty(newState)) {
      this.setState(newState);
    }
  }

  renderReport() {
    const {startDate, endDate, queryBy, course, report} = this.state;
    if (report === 'Workshop Summary') {
      return (
        <WorkshopSummaryReport
          startDate={startDate.format(API_DATE_FORMAT)}
          endDate={endDate.format(API_DATE_FORMAT)}
          queryBy={queryBy}
          course={course}
        />
      );
    } else { // Teacher Attendance
      return (
        <TeacherAttendanceReport
          startDate={startDate.format(API_DATE_FORMAT)}
          endDate={endDate.format(API_DATE_FORMAT)}
          queryBy={queryBy}
          course={course}
        />
      );
    }
  }

  render() {
    return (
      <Grid fluid>
        <Row>
          <Col sm={2}>
            <FormGroup>
              <ControlLabel>From</ControlLabel>
              <DatePicker
                date={this.state.startDate}
                onChange={this.handleStartDateChange}
                selectsStart
                startDate={this.state.startDate}
                endDate={this.state.endDate}
              />
            </FormGroup>
          </Col>
          <Col sm={2}>
            <FormGroup>
              <ControlLabel>To</ControlLabel>
              <DatePicker
                date={this.state.endDate}
                onChange={this.handleEndDateChange}
                selectsEnd
                startDate={this.state.startDate}
                endDate={this.state.endDate}
              />
            </FormGroup>
          </Col>
          <Col sm={3}>
            <FormGroup>
              <ControlLabel>Query By</ControlLabel>
              <FormControl
                componentClass="select"
                value={this.state.queryBy}
                onChange={this.handleQueryByChange}
              >
                {QUERY_BY_OPTIONS.map((o, i) => <option key={i} value={o.value}>{o.option}</option>)}
              </FormControl>
            </FormGroup>
          </Col>
          <Col sm={2}>
            <FormGroup>
              <ControlLabel>Course</ControlLabel>
              <FormControl
                componentClass="select"
                value={this.state.course || ""}
                onChange={this.handleCourseChange}
              >
                {COURSE_OPTIONS.map((o, i) => <option key={i} value={o.value}>{o.option}</option>)}
              </FormControl>
            </FormGroup>
          </Col>
          <Col sm={3}>
            <FormGroup>
              <ControlLabel>Report</ControlLabel>
              <FormControl
                componentClass="select"
                value={this.state.report}
                onChange={this.handleReportChange}
              >
                {REPORT_VALUES.map((v, i) => <option key={i} value={v}>{v}</option>)}
              </FormControl>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            {this.renderReport()}
          </Col>
        </Row>
      </Grid>
    );
  }
}
