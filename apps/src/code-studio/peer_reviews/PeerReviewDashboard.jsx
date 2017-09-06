import React from 'react';
import Spinner from '../pd/workshop_dashboard/components/spinner';
import EscalatedSubmissions from './EscalatedSubmissions';

const PeerReviewDashboard = React.createClass({
  getInitialState() {
    return {
      escalatedSubmissions: undefined
    };
  },

  componentDidMount() {
    this.loadRequest = $.ajax({
      method: 'GET',
      url: '/api/v1/peer_review_submissions/index_escalated',
      dataType: 'json'
    }).done(data => {
      this.setState({
        escalatedSubmissions: data
      });
    });
  },

  renderEscalatedReviews() {
    if (this.state.escalatedSubmissions) {
      return (
        <EscalatedSubmissions
          submissions={this.state.escalatedSubmissions}
        />
      );
    } else {
      return (
        <Spinner/>
      );
    }
  },

  render() {
    return (
      <div>
        {this.renderEscalatedReviews()}
      </div>
    );
  }
});

export default PeerReviewDashboard;
