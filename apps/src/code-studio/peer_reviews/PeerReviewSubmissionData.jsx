import React from 'react';
import PropTypes from 'prop-types';
import {Table} from 'react-bootstrap';

class PeerReviewSubmissionData extends React.Component {
  static propTypes = {
    filterType: PropTypes.string.isRequired,
    submissions: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  renderTableHeader() {
    return (
      <thead>
      <tr>
        <th>
          Submitter
        </th>
        <th>
          Course Name
        </th>
        <th>
          Unit
        </th>
        <th>
          Activity
        </th>
        <th>
          Submit Date
        </th>
        {
          this.props.filterType === 'escalated' && (
            <th>
              Escalated Date
            </th>
          )
        }
        <th>
          Link
        </th>
      </tr>
      </thead>
    );
  }

  renderTableBody() {
    return (
      <tbody>
      {
        this.props.submissions.map((submission, i) => {
          return (
            <tr key={i}>
              <td>
                {submission['submitter']}
              </td>
              <td>
                {submission['course_name']}
              </td>
              <td>
                {submission['unit_name']}
              </td>
              <td>
                {submission['level_name']}
              </td>
              <td>
                {submission['submission_date']}
              </td>
              {
                this.props.filterType === 'escalated' && (
                  <td>
                    {submission['escalation_date']}
                  </td>
                )
              }
              <td>
                <a href={`/peer_reviews/${submission['review_id']}`}>
                  Submission
                </a>
              </td>
            </tr>
          );
        })
      }
      </tbody>
    );
  }


  render() {
    return (
      <Table striped>
        {this.renderTableHeader()}
        {this.renderTableBody()}
      </Table>
    )
  }
}

export default PeerReviewSubmissionData;
