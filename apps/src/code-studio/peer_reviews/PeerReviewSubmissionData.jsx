import PropTypes from 'prop-types';
import React from 'react';
import {Table} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports

import PeerReviewLinkSection from './PeerReviewLinkSection';

class PeerReviewSubmissionData extends React.Component {
  static propTypes = {
    submissions: PropTypes.arrayOf(PropTypes.object).isRequired,
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
                <PeerReviewLinkSection reviews={submission['review_ids']} />
              </td>
            </tr>
          );
        })}
      </tbody>
    );
  }

  render() {
    return (
      <Table striped>
        {this.renderTableHeader()}
        {this.renderTableBody()}
      </Table>
    );
  }
}

export default PeerReviewSubmissionData;
