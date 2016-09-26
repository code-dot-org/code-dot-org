/** Workshop Survey page. Displays survey results. ...*/
import _ from 'lodash';
import React from 'react';
import {
  Row,
  Col,
  Button
} from 'react-bootstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

const SurveyResults = React.createClass({
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
      workshopOptions: []
    };
  },

  filterWorkshops(course) {
    let filteredWorkshops = _.filter(this.props.workshops, function (workshop) {
      return workshop.course === course;
    });

    let filteredWorkshopOptions = filteredWorkshops.map(function (workshop, i) {
      return (<option key={i} value={workshop.id}>{course} - {workshop.id}</option>)
    });

    console.log(filteredWorkshopOptions);

    this.setState({
      workshopsOptions: filteredWorkshopOptions
    });
  },

  handleChange(event) {
    console.log(event.target.value);

    this.filterWorkshops(event.target.value);
  },

  render() {
    let courseOptions = window.dashboard.workshop.COURSES.map(function (course, i) {
      return (<option key={i} value={course}>{course}</option>);
    });

    return (
      <div>
        <div> View Survey Results </div>
        <Row>
          <Col sm={4}>
            <select
              name="course_name"
              onChange={this.handleChange}
            >
              {courseOptions}
            </select>
          </Col>

          <Col sm={4}>
            <select
              name="workshop"
              defaultValue="Select a course..."
            >
              {this.state.workshopOptions}
            </select>
          </Col>

          <Col sm={4}>
            <Button>
              View Survey
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
});

export default SurveyResults;