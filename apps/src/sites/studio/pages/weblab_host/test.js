import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import WebLabTest from '@cdo/apps/music/MusicView';

$(document).ready(function() {
  console.log('i am here!');
  ReactDOM.render(
    <WebLabTest />,
    document.getElementById('weblab-test-container')
  );
});
