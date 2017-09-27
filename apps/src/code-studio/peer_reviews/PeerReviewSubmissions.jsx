import React from 'react';
import {Button, FormControl} from 'react-bootstrap';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Spinner from '../pd/workshop_dashboard/components/spinner';
import PeerReviewSubmissionData from "./PeerReviewSubmissionData";
import $ from 'jquery';

class PeerReviewSubmissions extends React.Component {
  static propTypes = {
    filterType: PropTypes.string.isRequired,
    courseList: PropTypes.arrayOf(PropTypes.array).isRequired
  }

  state = {}

  componentWillMount() {
    this.getFilteredResults = _.debounce(this.getFilteredResults, 1000);

    this.getFilteredResults();
  }

  handleCourseFilterChange = (event) => {
    this.setState({plc_course_id: event.target.value}, () => {
      this.getFilteredResults();
    });
  }

  handleTeacherEmailChange = (event) => {
    this.setState({email_filter: event.target.value}, () => {
      this.getFilteredResults();
    });
  }

  handleDownloadCsvClick = () => {
    window.open(`/api/v1/peer_review_submissions/report_csv?plc_course_id=${this.state.plc_course_id}`);
  }

  getFilteredResults() {
    this.loadRequest = $.ajax({
      method: 'GET',
      url: `/api/v1/peer_review_submissions/index?filter=${this.props.filterType}&email=${this.state.email_filter || ''}&plc_course_id=${this.state.plc_course_id || ''}`,
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
          style={{margin: '0px', verticalAlign: 'middle'}}
          id="EmailFilter"
          type="text"
          value={this.state.email_filter || ''}
          placeholder="Filter by submitter email"
          onChange={this.handleTeacherEmailChange}
        />
        <FormControl
          id="PlcCourseSelect"
          style={{marginLeft: '20px', marginBottom: '0px', verticalAlign: 'middle'}}
          componentClass="select"
          placeholder="Filter by course"
          onChange={this.handleCourseFilterChange}
        >
          <option value="">
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
        <Button
          style={{float: 'right', marginTop: '0px', marginBottom: '10px', verticalAlign: 'middle'}}
          disabled={!this.state.plc_course_id}
          onClick={this.handleDownloadCsvClick}
        >
          Download CSV report for this course
        </Button>
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
