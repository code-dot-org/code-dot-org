import React from 'react';

import _ from 'lodash';
import Spinner from './components/spinner';

const rowOrder = [
  {text: 'Number of enrollments', key: 'num_enrollments'},
  {text: 'Number of survey responses', key: 'num_surveys'},
  {text: 'I received clear communication about when and where the workshop would take place', key: 'received_clear_communication', score_base: 6},
  {text: 'Overall, how much have you learned about computer science from your workshop?', key: 'how_much_learned', score_base: 5},
  {text: 'For this workshop, how clearly did your facilitator present the information that you needed to learn?', key: 'how_clearly_presented', score_base: 5},
  {text: 'During your workshop, how much did you participate?', key: 'how_much_participated', score_base: 5},
  {text: 'When you are not in workshops about the Code.org {course} curriculum how often do you talk about the ideas from the workshops?', key: 'how_often_talk_about_ideas_outside', score_base: 5},
  {text: 'How often did you get so focused on workshop activities that you lost track of time?', key: 'how_often_lost_track_of_time', score_base: 5},
  {text: 'Before the workshop, how excited were you about going to your workshop?', key: 'how_excited_before', score_base: 5},
  {text: 'Overall, how interested were you in the in-person workshop?', key: 'overall_how_interested', score_base: 5},
  {text: 'I feel more prepared to teach the material covered in this workshop than before I came.', key: 'more_prepared_than_before', score_base: 6},
  {text: 'I know where to go if I need help preparing to teach this material.', key: 'know_where_to_go_for_help', score_base: 6},
  {text: 'This professional development was suitable for my level of experience with teaching this course.', key: 'suitable_for_my_experience', score_base: 6},
  {text: 'I would recommend this professional development to others.', key: 'would_recommend', score_base: 6},
  {text: 'I look forward to continuing my training throughout the year.', key: 'anticipate_continuing', score_base: 6},
  {text: 'I feel confident I can teach this course to my students this year.', key: 'confident_can_teach', score_base: 6},
  {text: 'I believe all students should take this course', key: 'believe_all_students', score_base: 6},
  {text: "This was the absolute best professional development I've ever participated in.", key: 'best_pd_ever', score_base: 6},
  {text: "I feel more connected to the community of computer science teachers after this workshop.", key: 'part_of_community', score_base: 6}
];

const freeResponseQuestions = [
  {text: 'Venue Feedback', key: 'venue_feedback'},
  {text: 'Things you liked', key: 'things_you_liked'},
  {text: 'Things you would change', key: 'things_you_would_change'},
  {text: 'Things the facilitator did well', key: 'things_facilitator_did_well', facilitator_breakdown: true},
  {text: 'Things the facilitator could improve', key: 'things_facilitator_could_improve', facilitator_breakdown: true}
];

const LocalSummerWorkshopSurveyResults = React.createClass({
  propTypes: {
    params: React.PropTypes.shape({
      workshopId: React.PropTypes.string.isRequired,
      facilitators: React.PropTypes.arrayOf(React.PropTypes.string)
    })
  },

  getInitialState() {
    return {
      loading: true
    };
  },

  componentDidMount() {
    this.load();
  },

  load() {
    const url = `/api/v1/pd/workshops/${this.props.params['workshopId']}/local_workshop_survey_report`;

    this.loadRequest = $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json'
    }).done(data => {
      this.setState({
        loading: false,
        results: data,
        thisWorkshop: data['this_workshop'],
        allMyLocalWorkshops: data['all_my_local_workshops']
      });
    });
  },

  renderLocalSummerWorkshopSurveyResultsTable() {
    let thisWorkshop = this.state.results['this_workshop'];
    let allMyLocalWorkshops = this.state.results['all_my_local_workshops'];

    return (
      <table className="table table-bordered" style={{width: 'auto'}}>
        <thead>
          <tr>
            <th/>
            <th>
              This workshop
            </th>
            <th>
              All my local summer workshops
            </th>
          </tr>
        </thead>
        <tbody>
          {
            rowOrder.map((row, i) => {
              return (
                <tr key={i}>
                  <td>{row['text']}</td>
                  <td>{this.renderScore(row, thisWorkshop[row['key']])}</td>
                  <td>{this.renderScore(row, allMyLocalWorkshops[row['key']])}</td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    );
  },

  renderScore(row, score) {
    if (score && row['score_base']) {
      return `${score} / ${row['score_base']}`;
    } else {
      return score || '';
    }
  },

  renderFreeResponseFeedback() {
    const freeResponseAnswers = freeResponseQuestions.map((question, i) => {
      return (
        <div key={i} className="well">
          <b>{question['text']}</b>
          {
            this.state.thisWorkshop[question['key']].map((answer, j) => {
              return !!(_.trim(answer)) && (
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
  },

  render() {
    if (this.state.loading) {
      return (
        <div>
          <Spinner/>
        </div>
      );
    } else {
      return (
        <div>
          {this.renderLocalSummerWorkshopSurveyResultsTable()}
          <br/>
          {this.renderFreeResponseFeedback()}
        </div>
      );
    }

  }
});

export default LocalSummerWorkshopSurveyResults;
