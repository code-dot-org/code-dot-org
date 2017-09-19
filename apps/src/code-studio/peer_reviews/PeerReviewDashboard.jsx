import React from 'react';
import PeerReviewSubmissions from './PeerReviewSubmissions';
import {Tabs, Tab} from 'react-bootstrap';

class PeerReviewDashboard extends React.Component {
  render() {
    return (
      <Tabs id="peer review dashboard" defaultActiveKey={1}>
        <Tab eventKey={1} title="Escalated Submissions">
          <PeerReviewSubmissions
            filterType="escalated"
          />
        </Tab>
        <Tab eventKey={2} title="Open Submissions">
          <PeerReviewSubmissions
            filterType="open"
          />
        </Tab>
        <Tab eventKey={3} title="All Submissions">
          <PeerReviewSubmissions
            filterType="all"
          />
        </Tab>
      </Tabs>
    );
  }
}

export default PeerReviewDashboard;
