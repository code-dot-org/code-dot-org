import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import GraphLab from '@cdo/apps/graphlab/GraphLab';

$(document).ready(function () {
  ReactDOM.render(<GraphLab />, document.getElementById('musiclab-container'));
});
