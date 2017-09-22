import React from 'react';
import {FormControl} from 'react-bootstrap';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Spinner from '../pd/workshop_dashboard/components/spinner';
import PeerReviewSubmissionData from "./PeerReviewSubmissionData";

class PeerReviewSubmissions extends React.Component {
  static propTypes = {
    filterType: PropTypes.string.isRequired,
    courseList: PropTypes.arrayOf(PropTypes.array)
  }

  state = {}

  componentWillMount() {
    this.getFilteredResults = _.debounce(this.getFilteredResults, 1000);

    this.loadRequest = $.ajax({
      method: 'GET',
      url: `/api/v1/peer_review_submissions/index?filter=${this.props.filterType}`,
      dataType: 'json'
    }).done(data => {
      this.setState({
        submissions: data
      });
    });
  }

  handleCourseFilterChange = (event) => {
    let course = event.target.value === 'all' ? '' : event.target.value;
    this.setState({course_id: course});

    this.getFilteredResults();
  }

  handleTeacherEmailChange = (event) => {
    this.setState({email_filter: event.target.value});

    this.getFilteredResults();
  }

  getFilteredResults() {
    this.loadRequest = $.ajax({
      method: 'GET',
      url: `/api/v1/peer_review_submissions/index?filter=${this.props.filterType}&email=${this.state.email_filter}&course=${this.state.course_id}`,
      dataType: 'json'
    }).done(data => {
      this.setState({
        submissions: data
      });
    });
  }

  renderFilterOptions() {
    return (
      <div>
        <FormControl
          type="text"
          value={this.state.email_filter || ''}
          placeholder="Filter by submitter email"
          onChange={this.handleTeacherEmailChange}
        />
        <FormControl
          componentClass="select"
          placeholder="Filter by course"
          onChange={this.handleCourseFilterChange}
        >
          <option value="all">
            All Courses
          </option>
          {this.props.courseList.map((course, i) => {
            return (
              <option key={i} value={course[1]}>
                {course[0]}
              </option>
            );
          })}
        </FormControl>
      </div>
    );
  }

  render() {
    if (this.state.submissions) {
      return (
        <div>
          {this.renderFilterOptions()}
          <PeerReviewSubmissionData
            filterType={this.props.filterType}
            submissions={this.state.submissions}
          />
        </div>
      );
    } else {
      return (
        <Spinner/>
      );
    }
  }
}

export default PeerReviewSubmissions;
