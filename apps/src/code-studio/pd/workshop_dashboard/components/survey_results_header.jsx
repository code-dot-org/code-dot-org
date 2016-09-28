/** Workshop Survey page. Displays survey results. ...*/
import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import {
  Row,
  Col,
  Button
} from 'react-bootstrap';
import moment from 'moment';
import 'react-select/dist/react-select.css';
import {DATE_FORMAT} from '../workshopConstants';

const rowOrder = [
  {text: 'Number of attending teachers', key: 'number_teachers'},
  {text: 'Number of survey responses', key: 'response_count'},
  {text: 'Facilitator Effectiveness (out of 5)', key: 'facilitator_effectiveness'},
  {text: 'Overall Success Score (out of 6)', key: 'overall_success'},
];

const SurveyResultsHeader = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  propTypes: {
    workshops: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        id: React.PropTypes.number.isRequired,
        sessions: React.PropTypes.array.isRequired,
        location_name: React.PropTypes.string.isRequired,
        workshop_type: React.PropTypes.string.isRequired,
        course: React.PropTypes.string.isRequired,
        enrolled_teacher_count: React.PropTypes.number.isRequired,
        capacity: React.PropTypes.number.isRequired,
        facilitators: React.PropTypes.array.isRequired,
        organizer: React.PropTypes.shape({
          name: React.PropTypes.string.isRequired,
          email: React.PropTypes.string.isRequired
        }).isRequired
      })
    )
  },

  getInitialState() {
    return {
      course: '',
      filteredWorkshops: [],
      workshopSurveyData: undefined
    };
  },

  componentDidMount() {
    this.filterWorkshops('CS Fundamentals');
  },

  filterWorkshops(course) {
    let filteredWorkshops = _.filter(this.props.workshops, function (workshop) {
      return workshop.course === course;
    });

    let firstWorkshopId = filteredWorkshops[0] ? filteredWorkshops[0].id : undefined;

    this.setState({
      selectedCourse: course,
      filteredWorkshops: filteredWorkshops,
      selectedWorkshopId: firstWorkshopId
    });

    this.setSurveyPanel(firstWorkshopId);
  },

  setSurveyPanel(workshopId) {
    if (workshopId === undefined) {
      this.setState({
        workshopSurveyData: undefined
      });
    } else {
      $.ajax({
        method: 'GET',
        url: "/api/v1/pd/workshops/" + workshopId + "/workshop_survey_report",
        dataType: 'json'
      })
        .done(data => {
          this.setState({
            workshopSurveyData: data
          });
        });
    }
  },

  handleCourseChange(event) {
    this.filterWorkshops(event.target.value);
  },

  handleCourseIdChange(event) {
    this.setSurveyPanel(event.target.value);
  },

  renderSurveyResults() {
    let thisWorkshop = this.state.workshopSurveyData['this_workshop'];
    let allMyWorkshops = this.state.workshopSurveyData['all_my_workshops'];

    return (
      <tbody>
        {
          rowOrder.map(function (row, i) {
            return (
              <tr key={i}>
                <td>{row['text']}</td>
                <td>{thisWorkshop[row['key']]}</td>
                <td>{allMyWorkshops[row['key']]}</td>
              </tr>
            );
          })
        }
      </tbody>
    );
  },

  renderSurveyPanel() {
    if (this.state.workshopSurveyData === undefined) {
      return (
        <div>
          Select a workshop
        </div>
      );
    } else {
      return (
        <table className="table table-striped table-bordered" style={{width: 'auto'}}>
          <thead>
            <tr>
              <th/>
              <th>
                Selected workshop
              </th>
              <th>
                Across all my workshops
              </th>
            </tr>
          </thead>
          {this.renderSurveyResults()}
        </table>
      );
    }
  },

  getWorkshopFriendlyName(workshop) {
    return workshop.course + ' - ' + (workshop.sessions[0] ? moment.utc(workshop.sessions[0].start).format(DATE_FORMAT) : 'no sessions');
  },

  render() {
    const courseOptions = window.dashboard.workshop.COURSES.map(function (course, i) {
      return (<option key={i} value={course}>{course}</option>);
    });

    const workshopOptions = this.state.filteredWorkshops.map( (workshop, i) => {
      return (
        <option key={i} value={workshop.id}>
          {this.getWorkshopFriendlyName(workshop)}
        </option>
      );
    });

    return (
      <div>
        <div> View Survey Results </div>
        <Row>
          <Col sm={2}>
            <select
              name="course_name"
              onChange={this.handleCourseChange}
            >
              {courseOptions}
            </select>
          </Col>

          <Col sm={2}>
            <select
              name="workshop"
              onChange={this.handleCourseIdChange}
            >
              {workshopOptions}
            </select>
          </Col>
        </Row>
        <br/>
        {this.renderSurveyPanel()}
      </div>
    );
  }
});

export default SurveyResultsHeader;
