import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import PeerReviewSubmissions from '@cdo/apps/code-studio/peer_reviews/PeerReviewSubmissions';

document.addEventListener('DOMContentLoaded', function() {
  ReactDOM.render(
    <PeerReviewSubmissions
      courseList={getScriptData('courseList')}
      courseUnitMap={getScriptData('courseUnitMap')}
    />,
    document.getElementById('dashboard-container')
  );
});
