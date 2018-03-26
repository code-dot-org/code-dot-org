import React from 'react';
import ReactDOM from 'react-dom';
import CensusInaccuracyReview from '@cdo/apps/templates/census2017/CensusInaccuracyReview';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
      <CensusInaccuracyReview
        {...getScriptData('props')}
      />,
    document.getElementById('application-container')
  );
});
