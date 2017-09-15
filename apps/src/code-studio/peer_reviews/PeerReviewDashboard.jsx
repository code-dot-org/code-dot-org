import React from 'react';
import Spinner from '../pd/workshop_dashboard/components/spinner';
import PeerReviewSubmissions from './PeerReviewSubmissions';
import {Tabs, Tab} from 'react-bootstrap';

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
    return (
      <Tabs defaultActiveKey={1}>
        <Tab eventKey={1} title="Escalated Submissions">
          {
            this.state.escalatedSubmissions ? (
              <PeerReviewSubmissions
                submissions={this.state.escalatedSubmissions}
              />
            ) : (<Spinner/>)
          }
        </Tab>
        <Tab eventKey={2} title="Open Submissions">
          {
            this.state.openSubmissions ? (
              <PeerReviewSubmissions
                submissions={this.state.openSubmissions}
              />
            ) : (<Spinner/>)
          }
        </Tab>
        <Tab eventKey={3} title="All Submissions">
          {
            this.state.allSubmissions ? (
              <PeerReviewSubmissions
                submissions={this.state.allSubmissions}
              />
            ) : (<Spinner/>)
          }
        </Tab>
      </Tabs>
    );
  }
}

export default PeerReviewDashboard;
