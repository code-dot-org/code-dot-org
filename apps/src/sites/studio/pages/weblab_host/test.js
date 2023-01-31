import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import WebLabTest from '@cdo/apps/templates/testPages/WebLabTest';

$(document).ready(function() {
  const scriptData = document.querySelector('script[data-bramble]');
  const brambleConfig = JSON.parse(scriptData.dataset.bramble);

  ReactDOM.render(
    <WebLabTest studioUrl={brambleConfig.studioUrl} />,
    document.getElementById('weblab-test-container')
  );
});
