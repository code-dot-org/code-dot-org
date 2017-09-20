import React from 'react';
import {Table, FormControl} from 'react-bootstrap';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Spinner from '../pd/workshop_dashboard/components/spinner';

class PeerReviewSubmissions extends React.Component {
  static propTypes = {
    filterType: PropTypes.string.isRequired
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

  handleTeacherEmailChange = (event) => {
    this.setState({email_filter: event.target.value});

    this.getFilteredResults();
  }

  getFilteredResults() {
    this.loadRequest = $.ajax({
      method: 'GET',
      url: `/api/v1/peer_review_submissions/index?filter=${this.props.filterType}&email=${this.state.email_filter}`,
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
    );
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
    if (this.state.submissions) {
      return (
        <div>
          {this.renderFilterOptions()}
          <Table striped>
            {this.renderTableHeader()}
            {this.renderTableBody()}
          </Table>
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
