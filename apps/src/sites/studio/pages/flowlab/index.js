import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import FlowLab from '@cdo/apps/flowlab/views/flow/FlowLab';

$(document).ready(function () {
  ReactDOM.render(<FlowLab />, document.getElementById('flowlab-container'));
});
