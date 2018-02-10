import React from 'react';
import PropTypes from 'prop-types';
import {Table} from 'react-bootstrap';
import PeerReviewLinkSection from "./PeerReviewLinkSection";

class PeerReviewSubmissionData extends React.Component {
  static propTypes = {
    filterType: PropTypes.string.isRequired,
    submissions: PropTypes.arrayOf(PropTypes.object).isRequired
  };

  renderTableHeader() {
    return (
      <thead>
      <tr>
        <th>
          Submitter
        </th>
        <th>
          Course
        </th>
        <th>
          Unit
        </th>
        <th>
          Activity
        </th>
        <th>
          Submitted
        </th>
        {
          this.props.filterType === 'escalated' ? (
            <th>
              Escalated
            </th>
          ) : [
            (
              <th key={0}>
                Accepted Reviews
              </th>
            ), (
              <th key={1}>
                Rejected Reviews
              </th>
            )
          ]
        }
        <th style={{width: '115px'}}>
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
                this.props.filterType === 'escalated' ? (
                  <td>
                    {submission['escalation_date']}
                  </td>
                ) : [
                  (
                    <td key="accepted">
                      {submission['accepted_reviews']}
                    </td>
                  ), (
                    <td key="rejected">
                      {submission['rejected_reviews']}
                    </td>
                  )
                ]
              }
              <td>
                <PeerReviewLinkSection
                  reviews={submission['review_ids']}
                  escalatedReviewId={submission['escalated_review_id']}
                />
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
    );
  }
}

export default PeerReviewSubmissionData;
