import React from 'react';
import ReactDOM from 'react-dom';
import Dataset from '@cdo/apps/storage/levelbuilder/Dataset';

$(document).ready(function() {
  ReactDOM.render(<Dataset />, document.querySelector('.dataset'));
});
