/**
 * Report View
 * Route: /reports
 * Contains query fields (from, to, queryBy, report) and generates a report based on the response.
 */
import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import OrganizerReport from './organizer_report';
import TeacherProgressReport from './teacher_progress_report';
import DatePicker from '../components/date_picker';

import {
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl
} from 'react-bootstrap';
import {QUERY_BY_OPTIONS, QUERY_BY_VALUES} from './report_constants';

const REPORT_OPTIONS = ['Organizer', 'Teacher Progress'];
const API_DATE_FORMAT = "YYYY-MM-DD";

const ReportView = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  propTypes: {
    location: React.PropTypes.object
  },

  getInitialState() {
    // Get url query parameters, if present and valid
    const urlParams = this.props.location.query;
    const start = urlParams.start ? moment(urlParams.start, API_DATE_FORMAT) : null;
    const end = urlParams.end ? moment(urlParams.end, API_DATE_FORMAT) : null;
    const queryBy = urlParams.queryBy && QUERY_BY_VALUES.includes(urlParams.queryBy) ? urlParams.queryBy : null;
    const report = urlParams.report && REPORT_OPTIONS.includes(urlParams.report) ? urlParams.report : null;

    // Default to the last week, if no start and end are specified
    return {
      startDate: start || moment().subtract(1, 'week'),
      endDate: end || moment(),
      queryBy: queryBy || QUERY_BY_VALUES[0],
      report: report || REPORT_OPTIONS[0]
    };
  },

  componentDidMount() {
    this.updateLocationAndSetState();
  },

  handleStartDateChange(date) {
    let newState = {startDate: date};
    if (date.isAfter(this.state.endDate)) {
      newState.endDate = date;
    }
    this.updateLocationAndSetState(newState);
  },

  handleEndDateChange(date) {
    let newState = {endDate: date};
    if (date.isBefore(this.state.startDate)) {
      newState.startDate = date;
    }
    this.updateLocationAndSetState(newState);
  },

  handleQueryByChange(e) {
    this.updateLocationAndSetState({queryBy: e.target.value});
  },

  handleReportChange(e) {
    this.updateLocationAndSetState({report: e.target.value});
  },

  // Updates the URL with the new query params so it can be shared,
  // and sets state (which will perform the query).
  updateLocationAndSetState(newState = {}) {
    const startDate = (newState.startDate || this.state.startDate).format(API_DATE_FORMAT);
    const endDate = (newState.endDate || this.state.endDate).format(API_DATE_FORMAT);
    const queryBy = newState.queryBy || this.state.queryBy;
    const report = newState.report || this.state.report;
    const url = `${this.props.location.pathname}?start=${startDate}&end=${endDate}&queryBy=${queryBy}&report=${report}`;
    this.context.router.replace(url);

    if (!_.isEmpty(newState)) {
      this.setState(newState);
    }
  },

  renderReport() {
    const {startDate, endDate, queryBy, report} = this.state;
    if (report === 'Organizer') {
      return (
        <OrganizerReport
          startDate={startDate.format(API_DATE_FORMAT)}
          endDate={endDate.format(API_DATE_FORMAT)}
          queryBy={queryBy}
        />
      );
    } else { // Teacher Progress
      return (
        <TeacherProgressReport
          startDate={startDate.format(API_DATE_FORMAT)}
          endDate={endDate.format(API_DATE_FORMAT)}
          queryBy={queryBy}
        />
      );
    }
  },

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
          <Col sm={3}>
            <FormGroup>
              <ControlLabel>Report</ControlLabel>
              <FormControl
                componentClass="select"
                value={this.state.report}
                onChange={this.handleReportChange}
              >
                {REPORT_OPTIONS.map((o, i) => <option key={i} value={o}>{o}</option>)}
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
});
export default ReportView;
