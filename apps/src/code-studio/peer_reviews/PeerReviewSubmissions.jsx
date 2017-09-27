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

  state = {
    loading: true
  }

  componentWillMount() {
    this.getFilteredResults = _.debounce(this.getFilteredResults, 1000);

    this.getFilteredResults();
  }

  handleCourseFilterChange = (event) => {
    this.setState({plc_course_id: event.target.value});
    this.getFilteredResults('', event.target.value);
  }

  handleEmailFilterChange = (event) => {
    this.getFilteredResults(event.target.value, this.state.plc_course_id);
  }

  handleDownloadCsvClick = () => {
    window.open(`/api/v1/peer_review_submissions/report_csv?plc_course_id=${this.state.plc_course_id}`);
  }

  getFilteredResults = (emailFilter, plcCourseId) => {
    this.setState({loading: true});

    this.loadRequest = $.ajax({
      method: 'GET',
      url: `/api/v1/peer_review_submissions/index?filter=${this.props.filterType}&email=${emailFilter || ''}&plc_course_id=${plcCourseId || ''}`,
      dataType: 'json'
    }).done(data => {
      this.setState({
        submissions: data,
        loading: false
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
          placeholder="Filter by submitter email"
          onChange={this.handleEmailFilterChange}
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
          id="DownloadCsvReport"
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
    return (
      <div>
        {this.renderFilterOptions()}
        {
          this.state.loading ? (
            <Spinner/>
          ) : (
            <PeerReviewSubmissionData
              filterType={this.props.filterType}
              submissions={this.state.submissions}
            />
          )
        }
      </div>
    );
  }
}

export default PeerReviewSubmissions;
