import React from 'react';
import {Button, FormControl} from 'react-bootstrap';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Spinner from '../pd/components/spinner';
import PeerReviewSubmissionData from './PeerReviewSubmissionData';
import Pagination from '../../lib/ui/Pagination';
import $ from 'jquery';

class PeerReviewSubmissions extends React.Component {
  static propTypes = {
    courseList: PropTypes.arrayOf(PropTypes.array).isRequired,
    courseUnitMap: PropTypes.object.isRequired
  };

  state = {
    loading: true,
    emailFilter: '',
    plcCourseId: '',
    plcCourseUnitId: '',
    pagination: {
      current_page: 1,
      total_pages: 1
    }
  };

  componentWillMount() {
    this.getFilteredResults = _.debounce(this.getFilteredResults, 1000);

    this.getFilteredResults();
  }

  handleCourseUnitFilterChange = event => {
    this.setState({plcCourseUnitId: event.target.value});
    this.getFilteredResults(
      this.state.emailFilter,
      this.state.plcCourseId,
      event.target.value,
      this.state.pagination.current_page
    );
  };

  handleCourseFilterChange = event => {
    if (event.target.value === '') {
      this.setState({plcCourseId: '', plcCourseUnitId: ''});
      this.getFilteredResults(
        this.state.emailFilter,
        '',
        '',
        this.state.pagination.current_page
      );
    } else {
      this.setState({plcCourseId: event.target.value});
      this.getFilteredResults(
        this.state.emailFilter,
        event.target.value,
        this.state.plcCourseUnitId,
        this.state.pagination.current_page
      );
    }
  };

  handleEmailFilterChange = event => {
    this.setState({emailFilter: event.target.value});
    this.getFilteredResults(
      event.target.value,
      this.state.plcCourseId,
      this.state.plcCourseUnitId,
      this.state.pagination.current_page
    );
  };

  handlePageChange = newPageNumber => {
    this.getFilteredResults(
      this.state.emailFilter,
      this.state.plcCourseId,
      this.state.plcCourseUnitId,
      newPageNumber
    );
  };

  handleDownloadCsvClick = () => {
    window.open(
      `/api/v1/peer_review_submissions/report_csv?plc_course_unit_id=${
        this.state.plcCourseUnitId
      }`
    );
  };

  getFilteredResults = (
    emailFilter,
    plcCourseId,
    plcCourseUnitId,
    pageNumber
  ) => {
    this.setState({loading: true});

    this.loadRequest = $.ajax({
      method: 'GET',
      url: `/api/v1/peer_review_submissions/index?email=${emailFilter ||
        ''}&plc_course_id=${plcCourseId ||
        ''}&plc_course_unit_id=${plcCourseUnitId || ''}&page=${pageNumber ||
        1}&per=30`,
      dataType: 'json'
    }).done(data => {
      this.setState({
        submissions: data.submissions,
        pagination: data.pagination,
        loading: false
      });

      // REACT <16 WORKAROUND
      // The react-paginate library depends on the React 16 rename of componentWillReceiveProps
      // to UNSAFE_componentWillReceiveProps to implement its forcePage prop.  See:
      // https://github.com/AdeleD/react-paginate/blob/master/react_components/PaginationBoxView.js#L86-L93
      // This is a temporary workaround while we're still on 15.x.
      // We should remove this when we upgrade to React 16.
      [this.upperPagination, this.lowerPagination].forEach(ref =>
        ref.forcePage(data.pagination.current_page)
      );
    });
  };

  renderFilterOptions() {
    return (
      <div>
        <FormControl
          style={{margin: '0px', verticalAlign: 'middle'}}
          id="EmailFilter"
          type="text"
          placeholder="Filter by submitter email"
          onChange={this.handleEmailFilterChange}
          value={this.state.emailFilter}
        />
        <FormControl
          id="PlcCourseSelect"
          style={{
            marginLeft: '10px',
            marginBottom: '0px',
            verticalAlign: 'middle'
          }}
          componentClass="select"
          placeholder="Filter by course"
          onChange={this.handleCourseFilterChange}
          value={this.state.plcCourseId}
        >
          <option value="">All Courses</option>
          {this.props.courseList.map((course, i) => {
            return (
              <option key={i} value={course[1]}>
                {course[0]}
              </option>
            );
          })}
        </FormControl>
        <FormControl
          id="PlcCourseUnitSelect"
          style={{
            marginLeft: '10px',
            marginBottom: '0px',
            verticalAlign: 'middle'
          }}
          componentClass="select"
          placeholder="Filter by course unit"
          disabled={!this.state.plcCourseId}
          onChange={this.handleCourseUnitFilterChange}
          value={this.state.plcCourseUnitId}
        >
          <option value="">All Course Units</option>
          {this.state.plcCourseId &&
            this.props.courseUnitMap[this.state.plcCourseId].map(
              (courseUnit, i) => {
                return (
                  <option key={i} value={courseUnit[1]}>
                    {courseUnit[0]}
                  </option>
                );
              }
            )}
        </FormControl>
        <Button
          id="DownloadCsvReport"
          style={{
            float: 'right',
            marginTop: '0px',
            marginBottom: '10px',
            verticalAlign: 'middle'
          }}
          disabled={!this.state.plcCourseUnitId}
          onClick={this.handleDownloadCsvClick}
        >
          CSV report for this course unit
        </Button>
      </div>
    );
  }

  render() {
    const {current_page, total_pages} = this.state.pagination;
    return (
      <div>
        {this.renderFilterOptions()}
        <Pagination
          currentPage={current_page}
          totalPages={total_pages}
          onPageChange={this.handlePageChange}
          ref={ref => (this.upperPagination = ref)}
        />
        {this.state.loading ? (
          <Spinner />
        ) : (
          <PeerReviewSubmissionData submissions={this.state.submissions} />
        )}
        <Pagination
          currentPage={current_page}
          totalPages={total_pages}
          onPageChange={this.handlePageChange}
          ref={ref => (this.lowerPagination = ref)}
        />
      </div>
    );
  }
}

export default PeerReviewSubmissions;
