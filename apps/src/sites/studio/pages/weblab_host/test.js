import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import WebLabTest from '@cdo/apps/templates/testPages/WebLabTest';

const scriptData = document.querySelector('script[data-bramble]');
const brambleConfig = JSON.parse(scriptData.dataset.bramble);

$(document).ready(function() {
  ReactDOM.render(
    <WebLabTest brambleConfig={brambleConfig} />,
    document.getElementById('weblab-test-container')
  );
});
