import $ from 'jquery';
import React from 'react';

import Lab2 from '@cdo/apps/lab2/views/Lab2';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(function () {
  createReactRoot(<Lab2 />, document.getElementById('lab2-container'));
});
