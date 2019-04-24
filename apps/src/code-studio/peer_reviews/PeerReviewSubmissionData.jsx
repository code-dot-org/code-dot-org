import React from 'react';
import PropTypes from 'prop-types';
import {Table} from 'react-bootstrap';
import Pagination from './Pagination';
import PeerReviewLinkSection from './PeerReviewLinkSection';

class PeerReviewSubmissionData extends React.Component {
  static propTypes = {
    submissions: PropTypes.arrayOf(PropTypes.object).isRequired,
    pagination: PropTypes.shape({
      total_pages: PropTypes.number,
      current_page: PropTypes.number
    }).isRequired,
    onPageChange: PropTypes.func.isRequired
  };

  renderTableHeader() {
    return (
      <thead>
        <tr>
          <th>Submitter</th>
          <th>Course</th>
          <th>Unit</th>
          <th>Activity</th>
          <th>Submitted</th>
          <th style={{width: '115px'}}>Link</th>
        </tr>
      </thead>
    );
  }

  renderTableBody() {
    return (
      <tbody>
        {this.props.submissions.map((submission, i) => {
          return (
            <tr key={i}>
              <td>{submission['submitter']}</td>
              <td>{submission['course_name']}</td>
              <td>{submission['unit_name']}</td>
              <td>{submission['level_name']}</td>
              <td>{submission['submission_date']}</td>
              <td>
                <PeerReviewLinkSection
                  reviews={submission['review_ids']}
                  escalatedReviewId={submission['escalated_review_id']}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  }

  renderPagination() {
    const {pagination, onPageChange} = this.props;
    return (
      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.total_pages}
        onPageChange={onPageChange}
      />
    );
  }

  render() {
    return (
      <div>
        {this.renderPagination()}
        <Table striped>
          {this.renderTableHeader()}
          {this.renderTableBody()}
        </Table>
        {this.renderPagination()}
      </div>
    );
  }
}

export default PeerReviewSubmissionData;
