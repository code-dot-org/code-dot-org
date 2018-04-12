/**
 * Workshop Filter.
 * Route: /workshops/filter
 */
import React, {PropTypes} from "react";
import {connect} from 'react-redux';
import $ from "jquery";
import _ from "lodash";
import Select from "react-select";
import "react-select/dist/react-select.css";
import {SelectStyleProps} from '../constants';
import ServerSortWorkshopTable from "./components/server_sort_workshop_table";
import DatePicker from "./components/date_picker";
import {DATE_FORMAT} from "./workshopConstants";
import {
  PermissionPropType,
  WorkshopAdmin
} from "./permission";
import moment from "moment";
import {
  Grid,
  Row,
  Col,
  FormGroup,
  FormControl,
  InputGroup,
  ControlLabel,
  DropdownButton,
  Button,
  MenuItem,
  Clearfix
} from "react-bootstrap";
import {
  Courses,
  Subjects,
  States
} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

const limitOptions = [
  {value: 25, text: 'first 25'},
  {value: 50, text: 'first 50'},
  {value: null, text: 'all'}
];

const QUERY_API_URL = "/api/v1/pd/workshops/filter";

export class WorkshopFilter extends React.Component {
  static propTypes = {
    permission: PermissionPropType.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string,
      query: PropTypes.shape({
        start: PropTypes.string,
        end: PropTypes.string,
        state: PropTypes.string,
        course: PropTypes.string,
        subject: PropTypes.string,
        organizer_id: PropTypes.string,
        teacher_email: PropTypes.string,
        only_attended: PropTypes.string,
      })
    })
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  state = {
    organizersLoading: true,
    organizers: undefined,
    limit: limitOptions[0]
  };

  componentDidMount() {
    if (this.props.permission.has(WorkshopAdmin)) {
      this.loadOrganizers();
    }
  }

  loadOrganizers() {
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
    })
    .fail((data) => {
      if (data.statusText !== "abort") {
        console.log(`Failed to load available workshop organizers: ${data.statusText}`);
        alert("We're sorry, we were unable to load available workshop organizers. Please refresh this page to try again");
      }
    });
  }

  componentWillUnmount() {
    if (this.organizersLoadRequest) {
      this.organizersLoadRequest.abort();
    }
  }

  handleStartChange = (date) => {
    const dateString = this.formatDate(date);
    let newFilters = {start: dateString};
    if (date && date.isAfter(this.getFiltersFromUrlParams().end)) {
      newFilters.end = dateString;
    }
    this.updateLocationAndSetFilters(newFilters);
  };

  handleEndChange = (date) => {
    const dateString = this.formatDate(date);
    let newFilters = {end: dateString};
    if (date && date.isBefore(this.getFiltersFromUrlParams().start)) {
      newFilters.start = dateString;
    }
    this.updateLocationAndSetFilters(newFilters);
  };

  handleStateChange = (selected) => {
    const state = selected ? selected.value : null;
    this.updateLocationAndSetFilters({state});
  };

  handleCourseChange = (selected) => {
    const course = selected ? selected.value : null;
    this.updateLocationAndSetFilters({course, subject: null});
  };

  handleSubjectChange = (selected) => {
    const subject = selected ? selected.value : null;
    this.updateLocationAndSetFilters({subject});
  };

  handleOrganizerChange = (selected) => {
    const organizer_id = selected ? selected.value : null;
    this.updateLocationAndSetFilters({organizer_id});
  };

  handleTeacherEmailChange = (data) => {
    const teacher_email = data.target.value;
    this.updateLocationAndSetFilters({teacher_email});
  };

  handleOnlyAttendedChange = (data) => {
    const only_attended = data.target.checked;
    this.updateLocationAndSetFilters({only_attended});
  };

  handleLimitChange = (limit) => {
    this.setState({limit});
  };

  handleDownloadCSVClick = () => {
    const downloadUrl=`${QUERY_API_URL}.csv?${$.param(this.getFiltersFromUrlParams())}`;
    window.open(downloadUrl);
  };

  generateCaptionFromWorkshops = (workshops) => {
    return (
      <div>
        {"Show "}
        <DropdownButton
          bsSize="xsmall"
          title={this.state.limit.text}
          id="workshop-limit-dropdown"
          noCaret
        >
          {limitOptions.map((option, i) =>
            <MenuItem
              key={i}
              eventKey={option}
              onSelect={this.handleLimitChange}
            >
              {option.text}
            </MenuItem>
          )}
        </DropdownButton>
        {` of ${workshops.total_count} workshops.`}
        &nbsp;
        <Button
          bsSize="xsmall"
          onClick={this.handleDownloadCSVClick}
        >
          Download all as CSV
        </Button>
      </div>
    );
  };

  formatDate(date) {
    return date ? date.format(DATE_FORMAT) : null;
  }

  parseDate(dateString) {
    if (dateString) {
      const parsed = moment(dateString, DATE_FORMAT);
      if (parsed.isValid()) {
        return parsed;
      }
    }

    return null;
  }

  omitEmptyValues(hash) {
    return _.omitBy(hash, value => !value);
  }

  getFiltersFromUrlParams() {
    const urlParams = this.props.location.query;
    return this.omitEmptyValues({
      start: urlParams.start,
      end: urlParams.end,
      state: urlParams.state,
      course: urlParams.course,
      subject: urlParams.subject,
      organizer_id: urlParams.organizer_id,
      teacher_email: urlParams.teacher_email,
      only_attended: urlParams.only_attended,
    });
  }

  getUrlParamsHash(newFilters = {}) {
    return this.omitEmptyValues({
      ...this.getFiltersFromUrlParams(),
      ...newFilters
    });
  }

  getUrl(newFilters=this.getFiltersFromUrlParams()) {
    return `${this.props.location.pathname}?${$.param(this.getUrlParamsHash(newFilters))}`;
  }

  // Updates the URL with the new query params so it can be shared.
  // This will trigger React-Router to pass new props and re-render with the new filters.
  updateLocationAndSetFilters(newFilters) {
    if (!_.isEmpty(newFilters)) {
      this.context.router.replace(this.getUrl(newFilters));
    }
  }

  getOrganizerOptions() {
    if (!this.state.organizers) {
      return null;
    }
    return this.state.organizers.map(organizer => ({
      value: organizer.id,
      label: `${organizer.name} (${organizer.email})`
    }));
  }

  render() {
    // limit is intentionally stored in state and not reflected in the URL
    const filters = {
      ...this.getFiltersFromUrlParams(),
      limit: this.state.limit.value
    };

    const startDate = this.parseDate(filters.start);
    const endDate = this.parseDate(filters.end);

    return (
      <Grid fluid>
        <Row>
          <Col md={3} sm={4}>
            <FormGroup>
              <ControlLabel>Status</ControlLabel>
              <Select
                value={filters.state}
                onChange={this.handleStateChange}
                placeholder={null}
                options={States.map(v => ({value: v, label: v}))}
              />
            </FormGroup>
          </Col>
          <Col md={3} sm={4}>
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
          <Col md={3} sm={4}>
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
          <Clearfix visibleMdBlock />
          <Col lg={3} md={4} sm={6}>
            <FormGroup>
              <ControlLabel>Course</ControlLabel>
              <Select
                value={filters.course}
                onChange={this.handleCourseChange}
                placeholder={null}
                options={Courses.map(v => ({value: v, label: v}))}
                {...SelectStyleProps}
              />
            </FormGroup>
          </Col>
          <Clearfix visibleLgBlock />
          {
            filters.course && Subjects[filters.course] &&
            <Col md={5} sm={6}>
              <FormGroup>
                <ControlLabel>Subject</ControlLabel>
                <Select
                  value={filters.subject}
                  onChange={this.handleSubjectChange}
                  placeholder={null}
                  options={Subjects[filters.course].map(v => ({value: v, label: v}))}
                  {...SelectStyleProps}
                />
              </FormGroup>
            </Col>
          }
          <Clearfix visibleSmBlock />
          {
            this.props.permission.has(WorkshopAdmin) &&
            <Col md={6}>
              <FormGroup>
                <ControlLabel>Organizer</ControlLabel>
                <Select
                  value={parseInt(filters.organizer_id, 10)}
                  options={this.getOrganizerOptions()}
                  onChange={this.handleOrganizerChange}
                  isLoading={this.state.organizersLoading}
                  matchProp="label"
                  placeholder={null}
                  {...SelectStyleProps}
                />
              </FormGroup>
            </Col>
          }
          {
            this.props.permission.has(WorkshopAdmin) &&
            <Col md={4}>
              <FormGroup>
                <ControlLabel>Teacher Email</ControlLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    value={filters.teacher_email || ''}
                    placeholder="Enter email"
                    onChange={this.handleTeacherEmailChange}
                  />
                  <InputGroup.Addon>
                    <FormControl.Static componentClass="span">
                      Only Attended? &nbsp;
                    </FormControl.Static>
                    <input
                      type="checkbox"
                      checked={filters.only_attended === "true"}
                      onChange={this.handleOnlyAttendedChange}
                    />
                  </InputGroup.Addon>
                </InputGroup>
              </FormGroup>
            </Col>
          }
        </Row>
        <Row>
          <ServerSortWorkshopTable
            queryUrl={QUERY_API_URL}
            queryParams={filters}
            canDelete
            showStatus
            showOrganizer={this.props.permission.has(WorkshopAdmin)}
            generateCaptionFromWorkshops={this.generateCaptionFromWorkshops}
          />
        </Row>
      </Grid>
    );
  }
}

export default connect(state => ({
  permission: state.permission
}))(WorkshopFilter);
