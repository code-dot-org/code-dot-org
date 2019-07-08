import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';

import('@cdo/apps/code-studio/peer_reviews/PeerReviewSubmissions').then(
  ({default: PeerReviewSubmissions}) => {
    $(document).ready(function() {
      ReactDOM.render(
        <PeerReviewSubmissions
          courseList={getScriptData('courseList')}
          courseUnitMap={getScriptData('courseUnitMap')}
        />,
        document.getElementById('dashboard-container')
      );
    });
  }
);
