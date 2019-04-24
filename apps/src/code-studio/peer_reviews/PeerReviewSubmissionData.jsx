import React from 'react';
import PropTypes from 'prop-types';
import {Table} from 'react-bootstrap';
import PeerReviewLinkSection from './PeerReviewLinkSection';
import PaginationWrapper from '../../templates/PaginationWrapper';

class PeerReviewSubmissionData extends React.Component {
  static propTypes = {
    submissions: PropTypes.arrayOf(PropTypes.object).isRequired,
    pagination: PropTypes.shape({
      total_pages: PropTypes.number,
      current_page: PropTypes.number
    }).isRequired,
    onChangePage: PropTypes.func.isRequired
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
    const {pagination, onChangePage} = this.props;
    return (
      <div style={{textAlign: 'center'}}>
        <PaginationWrapper
          totalPages={pagination.total_pages}
          currentPage={pagination.current_page}
          onChangePage={onChangePage}
        />
      </div>
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
