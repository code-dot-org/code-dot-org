import React from 'react';
import {FormControl} from 'react-bootstrap';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Spinner from '../pd/workshop_dashboard/components/spinner';
import PeerReviewSubmissionData from "./PeerReviewSubmissionData";

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
      <FormControl
        type="text"
        value={this.state.email_filter || ''}
        placeholder="Filter by submitter email"
        onChange={this.handleTeacherEmailChange}
      />
    );
  }

  render() {
    if (this.state.reviews) {
      return (
        <div>
          {this.renderFilterOptions()}
          <PeerReviewSubmissionData
            filterType={this.props.filterType}
            submissions={this.state.reviews}
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
