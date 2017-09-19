import React from 'react';
import {Table, FormControl} from 'react-bootstrap';
import PropTypes from 'prop-types';
import _ from 'lodash';

class PeerReviewSubmissions extends React.Component {
  static propTypes = {
    submissions: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  state = {}

  componentWillMount() {
    this.getFilteredResults = _.debounce(this.getFilteredResults, 1000)
    this.setState({submissions: this.props.submissions})
  }

  handleTeacherEmailChange = (event) => {
    this.setState({email_filter: event.target.value});

    // Find something to do email regex
    this.getFilteredResults();
  }

  getFilteredResults() {
    this.loadRequest = $.ajax({
      method: 'GET',
      url: `/api/v1/peer_review_submissions/index?filter=escalated&email=${this.state.email_filter}`,
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
        <p>
          {this.state.other_filter}
        </p>
      </div>
    )
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
          <th>
            Escalated Date
          </th>
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
          this.state.submissions.map((submission, i) => {
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
                <td>
                  {submission['escalation_date']}
                </td>
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
      <div>
        {this.renderFilterOptions()}
        <Table striped>
          {this.renderTableHeader()}
          {this.renderTableBody()}
        </Table>
      </div>
    );
  }
}

export default PeerReviewSubmissions;
