/** Workshop Survey page. Displays survey results. ...*/
import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import {
  Row,
  Col,
} from 'react-bootstrap';
import moment from 'moment';
import {DATE_FORMAT} from '../workshopConstants';
import { workshopShape } from '../types.js';

const styles = {
  questionGroupCell: {
    borderTopWidth: '2px',
    borderTopColor: 'black'
  },
  questionGroupHeader: {
    fontWeight: 'bolder',
    borderTopWidth: '2px',
    borderTopColor: 'black'
  },
  individualQuestion: {
    paddingLeft: '50px'
  }
};

const rowOrder = [
  {heading: true, text: 'Number of attending teachers', key: 'number_teachers'},
  {heading: true, text: 'Number of survey responses', key: 'response_count'},
  {heading: true, text: 'Facilitator Effectiveness (out of 5)', key: 'facilitator_effectiveness'},
  {text: 'Overall, how much have you learned from your workshop about computer science?', key: 'how_much_learned_s'},
  {text: 'During your workshop, how motivating were the activities that this program had you do?', key: 'how_motivating_s'},
  {text: 'For this workshop, how clearly did your facilitator present the information that you needed to learn?', key: 'how_clearly_presented_s'},
  {text: 'How interesting did your facilitator make what you learned in the workshop?', key: 'how_interesting_s'},
  {text: 'How often did your facilitator give you feedback that helped you learn?', key: 'how_often_given_feedback_s'},
  {text: 'How comfortable were you asking your facilitator questions about what you were learning in his or her workshop?', key: 'how_comfortable_asking_questions_s'},
  {text: 'How often did your facilitator teach you things that you didn\'t know before taking this workshop?', key: 'how_often_taught_new_things_s'},
  {heading: true, text: 'Teacher Engagement (out of 5)', key: 'teacher_engagement'},
  {text: 'During your workshop, how much did you participate?', key: 'how_much_participated_s'},
  {text: 'When you are not in Code.org workshops how often do you talk about the ideas from the workshops?', key: 'how_often_talk_about_ideas_outside_s'},
  {text: 'How often did you get so focused on Code.org workshop activities that you lost track of time?', key: 'how_often_lost_track_of_time_s'},
  {text: 'Before the workshop, how excited were you about going to your Code.org workshop?', key: 'how_excited_before_s'},
  {text: 'Overall, how interested were you in the Code.org in-person workshop?', key: 'overall_how_interested_s'},
  {heading: true, text: 'Overall Success Score (out of 6)', key: 'overall_success'},
  {text: 'I feel more prepared to teach the material covered in this workshop than before I came.', key: 'more_prepared_than_before_s'},
  {text: 'I know where to go if I need help preparing to teach this material.', key: 'know_where_to_go_for_help_s'},
  {text: 'This professional development was suitable for my level of experience with teaching CS.', key: 'suitable_for_my_experience_s'},
  {text: 'I would recommend this professional development to others.', key: 'would_recommend_s'},
  {text: 'I feel like I am a part of a community of teachers.', key: 'part_of_community_s'},
];

const freeResponseQuestions = [
  {text: 'What were two things your facilitator(s) did well?', key: 'things_facilitator_did_well_s'},
  {text: 'What were two things your facilitator(s) could do better?', key: 'things_facilitator_could_improve_s'},
  {text: 'What were the two things you liked most about the activities you did in this workshop and why?', key: 'things_you_liked_s'},
  {text: 'What are the two things you would change about the activities you did in this workshop?', key: 'things_you_would_change_s'},
  {text: 'Is there anything else you’d like to tell us about your experience at this workshop?', key: 'anything_else_s'},
];

const SurveyResultsHeader = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  propTypes: {
    workshops: React.PropTypes.arrayOf(workshopShape),
    organizerView: React.PropTypes.bool
  },

  getInitialState() {
    return {
      selectedCourse: '',
      filteredWorkshops: [],
      workshopSurveyData: undefined,
      selectedWorkshopId: undefined,
      workshopName: undefined,
    };
  },

  componentDidMount() {
    this.filterWorkshops('CS Fundamentals');
  },

  filterWorkshops(course) {
    let filteredWorkshops = _.filter(this.props.workshops, function (workshop) {
      return workshop.course === course;
    });

    let firstWorkshopId = this.props.organizerView ? undefined : (filteredWorkshops[0] ? filteredWorkshops[0].id : undefined);

    this.setState({
      selectedCourse: course,
      filteredWorkshops: filteredWorkshops,
      selectedWorkshopId: firstWorkshopId,
    });

    this.setSurveyPanel(course, firstWorkshopId, firstWorkshopId && this.getWorkshopFriendlyName(filteredWorkshops[0]));
  },

  setSurveyPanel(course, workshopId, workshopName) {
    if (!this.props.organizerView && !workshopId) {
      this.setState({
        workshopSurveyData: undefined,
        workshopName: undefined
      });
    } else {
      if (!this.props.organizerView || workshopId) {
        $.ajax({
          method: 'GET',
          url: "/api/v1/pd/workshops/" + workshopId + "/workshop_survey_report",
          dataType: 'json'
        }).done(data => {
          this.setState({
            selectedWorkshopId: workshopId,
            workshopSurveyData: data,
            workshopName: workshopName
          });
        });
      } else {
        $.ajax({
          method: 'GET',
          url: '/api/v1/pd/workshop_organizer_survey_report_for_course/' + course
        }).done(data => {
          this.setState({
            selectedWorkshopId: '',
            workshopSurveyData: data,
            workshopName: workshopName
          });
        });
      }
    }
  },

  handleCourseChange(event) {
    this.filterWorkshops(event.target.value);
  },

  handleWorkshopIdChange(event) {
    this.setSurveyPanel(this.state.selectedCourse, event.target.value, event.target.selectedOptions[0].innerHTML);
  },

  renderSurveyResults() {
    const thisWorkshop = this.state.workshopSurveyData['this_workshop'];
    const allMyWorkshopsForCourse = this.state.workshopSurveyData['all_my_workshops_for_course'];
    const allWorkshopsForCourse = this.state.workshopSurveyData['all_workshops_for_course'];

    return (
      <table className="table table-bordered" style={{width: 'auto'}}>
        <thead>
          <tr>
            <th/>
            <th>
              {this.state.workshopName}
            </th>
            <th>
              Across all my workshops for {this.state.selectedCourse}
            </th>
            <th>
              Across all workshops for {this.state.selectedCourse}
            </th>
          </tr>
        </thead>
        <tbody>
          {
            rowOrder.map((row, i) => {
              return (
                <tr key={i}>
                  <td style={row['heading'] ? styles.questionGroupHeader : styles.individualQuestion}>{row['text']}</td>
                  <td style={row['heading'] && styles.questionGroupCell}>{thisWorkshop[row['key']]}</td>
                  <td style={row['heading'] && styles.questionGroupCell}>{allMyWorkshopsForCourse[row['key']]}</td>
                  <td style={row['heading'] && styles.questionGroupCell}>{allWorkshopsForCourse[row['key']]}</td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    );
  },

  renderOrganizerSurveyResults() {
    const allWorkshopsForCourse = this.state.workshopSurveyData['all_workshops_for_course'];
    const allMyWorkshopsForCourse = this.state.workshopSurveyData['all_my_workshops_for_course'];
    const breakoutData = _.omit(this.state.workshopSurveyData, ['all_workshops_for_course', 'all_my_workshops_for_course']);

    let headings = ['', 'Across all workshops for ' + this.state.selectedCourse, 'Across all workshops I organized for ' + this.state.selectedCourse];

    if (this.state.selectedWorkshopId) {
      headings.push(this.state.workshopName);
    } else {
      headings = headings.concat(Object.keys(breakoutData));
    }

    const rows = rowOrder.map((row, i) => {
      return (
        <tr key={i}>
          <td style={row['heading'] ? styles.questionGroupHeader : styles.individualQuestion}>{row['text']}</td>
          <td style={row['heading'] && styles.questionGroupCell}>{allWorkshopsForCourse[row['key']]}</td>
          <td style={row['heading'] && styles.questionGroupCell}>{allMyWorkshopsForCourse[row['key']]}</td>
          {
            headings.slice(3).map((heading, j) => {
              return (
                <td key={j} style={row['heading'] && styles.questionGroupCell}>
                  {
                    this.state.selectedWorkshopId ? breakoutData['this_workshop'][row['key']] : breakoutData[heading][row['key']]
                  }
                </td>
              );
            })
          }
        </tr>
      );
    });

    return (
      <table className="table table-bordered" style={{width: 'auto'}}>
        <thead>
          <tr>
            {
              headings.map((heading, i) => {
                return (
                  <th key={i}>
                    {heading}
                  </th>
                );
              })
            }
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
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
      return this.props.organizerView ? this.renderOrganizerSurveyResults() : this.renderSurveyResults();
    }
  },

  renderFreeResponseAnswers() {
    if (this.state.workshopSurveyData && this.state.selectedWorkshopId) {
      const thisWorkshop = this.state.workshopSurveyData['this_workshop'];

      const freeResponseAnswers = freeResponseQuestions.map((question, i) => {
        return (
          <div key={i} className="well">
            <b>{question['text']}</b>
            {
              thisWorkshop[question['key']].map((answer, j) => {
                return (
                  <li key={j}>
                    {answer}
                  </li>
                );
              })
            }
          </div>
        );
      });

      return (
        <div>
          {freeResponseAnswers}
        </div>
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

    if (this.props.organizerView) {
      workshopOptions.unshift(
        (
          <option key={-1} value={''}>
            View all workshops
          </option>
        )
      );
    }

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
              onChange={this.handleWorkshopIdChange}
            >
              {workshopOptions}
            </select>
          </Col>
        </Row>
        <br/>
        {this.renderSurveyPanel()}
        {this.renderFreeResponseAnswers()}
      </div>
    );
  }
});

export default SurveyResultsHeader;
