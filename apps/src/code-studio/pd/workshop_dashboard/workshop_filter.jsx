/**
 * Workshop Filter.
 * Route: /workshops/filter
 */
import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import WorkshopTable from './components/workshop_table';
import WorkshopTableLoader from './components/workshop_table_loader';
import DatePicker from './components/date_picker';
import {DATE_FORMAT} from './workshopConstants';
import moment from 'moment';
import {
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel
} from 'react-bootstrap';

const WorkshopFilter = React.createClass({
  propTypes: {
    location: React.PropTypes.shape({
      pathname: React.PropTypes.string,
      query: React.PropTypes.shape({
        start: React.PropTypes.string,
        end: React.PropTypes.string,
        state: React.PropTypes.string,
        course: React.PropTypes.string,
        organizer: React.PropTypes.string
      })
    })
  },

  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      organizersLoading: true,
      organizers: undefined
    };
  },

  componentWillUnmount() {
    if (this.organizersLoadRequest) {
      this.organizersLoadRequest.abort();
    }
  },

  componentDidMount() {
    this.organizersLoadRequest = $.ajax({
      method: 'GET',
      url: '/api/v1/pd/workshop_organizers',
      dataType: 'json'
    })
    .done(data => {
      this.setState({
        organizersLoading: false,
        organizers: data
      });
    });
  },

  handleStartChange(date) {
    const dateString = this.formatDate(date);
    let newFilters = {start: dateString};
    if (date && date.isAfter(this.getFiltersFromUrlParams().end)) {
      newFilters.end = dateString;
    }
    this.updateLocationAndSetFilters(newFilters);
  },

  handleEndChange(date) {
    const dateString = this.formatDate(date);
    let newFilters = {end: dateString};
    if (date && date.isBefore(this.getFiltersFromUrlParams().start)) {
      newFilters.start = dateString;
    }
    this.updateLocationAndSetFilters(newFilters);
  },

  handleStateChange(selected) {
    const state = selected ? selected.value : null;
    this.updateLocationAndSetFilters({state});
  },

  handleCourseChange(selected) {
    const course = selected ? selected.value : null;
    this.updateLocationAndSetFilters({course});
  },

  handleOrganizerChange(selected) {
    const organizer = selected ? selected.value : null;
    this.updateLocationAndSetFilters({organizer});
  },

  formatDate(date) {
    return date ? date.format(DATE_FORMAT) : null;
  },

  parseDate(dateString) {
    if (dateString) {
      const parsed = moment(dateString, DATE_FORMAT);
      if (parsed.isValid()) {
        return parsed;
      }
    }

    return null;
  },

  omitEmptyValues(hash) {
    return _.omitBy(hash, value => !value);
  },

  getFiltersFromUrlParams() {
    const urlParams = this.props.location.query;
    return this.omitEmptyValues({
      start: urlParams.start,
      end: urlParams.end,
      state: urlParams.state,
      course: urlParams.course,
      organizer: urlParams.organizer
    });
  },

  getUrlParamsHash(newFilters = {}) {
    return this.omitEmptyValues({
      ...this.getFiltersFromUrlParams(),
      ...newFilters
    });
  },

  getUrl(newFilters=this.getFiltersFromUrlParams()) {
    return `${this.props.location.pathname}?${$.param(this.getUrlParamsHash(newFilters))}`;
  },

  // Updates the URL with the new query params so it can be shared.
  // This will trigger React-Router to pass new props and re-render with the new filters.
  updateLocationAndSetFilters(newFilters) {
    if (!_.isEmpty(newFilters)) {
      this.context.router.replace(this.getUrl(newFilters));
    }
  },

  getOrganizerOptions() {
    if (!this.state.organizers) {
      return null;
    }
    return this.state.organizers.map(organizer => ({
      value: organizer.id,
      label: `${organizer.name} (${organizer.email})`
    }));
  },

  render() {
    const filters = this.getFiltersFromUrlParams();

    const permission = window.dashboard.workshop.permission;
    const isAdmin = permission === "admin";
    const startDate = this.parseDate(filters.start);
    const endDate = this.parseDate(filters.end);


    return (
      <Grid fluid>
        <Row>
          <Col sm={4}>
            <FormGroup>
              <ControlLabel>Status</ControlLabel>
              <Select
                value={filters.state}
                onChange={this.handleStateChange}
                placeholder={null}
                options={window.dashboard.workshop.STATES.map(v => ({value: v, label: v}))}
              />
            </FormGroup>
          </Col>
          <Col sm={4}>
            <FormGroup>
              <ControlLabel>From</ControlLabel>
              <DatePicker
                date={startDate}
                onChange={this.handleStartChange}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                clearable
              />
            </FormGroup>
          </Col>
          <Col sm={4}>
            <FormGroup>
              <ControlLabel>To</ControlLabel>
              <DatePicker
                date={endDate}
                onChange={this.handleEndChange}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                clearable
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm={4}>
            <FormGroup>
              <ControlLabel>Course</ControlLabel>
              <Select
                value={filters.course}
                onChange={this.handleCourseChange}
                placeholder={null}
                options={window.dashboard.workshop.COURSES.map(v => ({value: v, label: v}))}
              />
            </FormGroup>
          </Col>
          {
            isAdmin &&
            <Col sm={8}>
              <FormGroup>
                <ControlLabel>Organizer</ControlLabel>
                <Select
                  value={parseInt(filters.organizer, 10)}
                  options={this.getOrganizerOptions()}
                  onChange={this.handleOrganizerChange}
                  isLoading={this.state.organizersLoading}
                  matchProp="label"
                  placeholder={null}
                />
              </FormGroup>
            </Col>
          }
        </Row>
        <Row>
          <WorkshopTableLoader
            queryUrl="/api/v1/pd/workshops/filter"
            params={filters}
            workshopCountParam="total_count"
          >
            <WorkshopTable
              showOrganizer={isAdmin}
            />
          </WorkshopTableLoader>
        </Row>
      </Grid>
    );
  }
});
export default WorkshopFilter;
