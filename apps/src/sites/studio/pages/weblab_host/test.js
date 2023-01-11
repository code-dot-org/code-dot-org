import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import WebLabTest from '@cdo/apps/music/MusicView';

$(document).ready(function() {
  ReactDOM.render(
    <WebLabTest />,
    document.getElementById('weblab-test-container')
  );
});
