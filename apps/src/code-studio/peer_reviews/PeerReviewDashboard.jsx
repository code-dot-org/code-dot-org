import React from 'react';
import PeerReviewSubmissions from './PeerReviewSubmissions';
import {Tabs, Tab} from 'react-bootstrap';
import getScriptData from '@cdo/apps/util/getScriptData';

class PeerReviewDashboard extends React.Component {
  render() {
    let courseList = getScriptData('courseList');
    let courseUnitMap = getScriptData('courseUnitMap');

    return (
      <Tabs id="peer review dashboard" defaultActiveKey={1}>
        <Tab eventKey={1} title="Escalated Submissions">
          <PeerReviewSubmissions
            filterType="escalated"
            courseList={courseList}
            courseUnitMap={courseUnitMap}
          />
        </Tab>
        <Tab eventKey={2} title="Open Submissions">
          <PeerReviewSubmissions
            filterType="open"
            courseList={courseList}
            courseUnitMap={courseUnitMap}
          />
        </Tab>
        <Tab eventKey={3} title="All Submissions">
          <PeerReviewSubmissions
            filterType="all"
            courseList={courseList}
            courseUnitMap={courseUnitMap}
          />
        </Tab>
      </Tabs>
    );
  }
}

export default PeerReviewDashboard;
