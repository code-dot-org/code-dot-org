import React from 'react';
import Spinner from '../pd/workshop_dashboard/components/spinner';
import PeerReviewSubmissions from './PeerReviewSubmissions';

class PeerReviewDashboard extends React.Component {
  state = {}

  componentDidMount() {
    this.loadRequest = $.ajax({
      method: 'GET',
      url: '/api/v1/peer_review_submissions/index?filter=escalated',
      dataType: 'json'
    }).done(data => {
      this.setState({
        escalatedSubmissions: data
      });
    });

    this.loadRequest = $.ajax({
      method: 'GET',
      url: '/api/v1/peer_review_submissions/index?filter=open',
      dataType: 'json'
    }).done(data => {
      this.setState({
        openSubmissions: data
      });
    });

    this.loadRequest = $.ajax({
      method: 'GET',
      url: '/api/v1/peer_review_submissions/index',
      dataType: 'json'
    }).done(data => {
      this.setState({
        allSubmissions: data
      });
    });
  }

  render() {
    if (Object.keys(this.state).length) {
      return (
        <div>
          <h3>Escalated Submissions</h3>
          {
            this.state.escalatedSubmissions && (
              <PeerReviewSubmissions
                submissions={this.state.escalatedSubmissions}
              />
            )
          }
          <h3>Open Submissions</h3>
          {
            this.state.openSubmissions && (
              <PeerReviewSubmissions
                submissions={this.state.openSubmissions}
              />
            )
          }
          <h3>All Submissions</h3>
          {
            this.state.allSubmissions && (
              <PeerReviewSubmissions
                submissions={this.state.allSubmissions}
              />
            )
          }
        </div>
      );
    } else {
      return (
        <Spinner/>
      );
    }
  }
}

export default PeerReviewDashboard;
