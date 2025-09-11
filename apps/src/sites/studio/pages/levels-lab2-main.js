import $ from 'jquery';
import React from 'react';

import Lab2 from '@cdo/apps/lab2/views/Lab2';
import bootstrap from '@cdo/apps/util/GlobalBootstrapper';

$(document).ready(function () {
  bootstrap(<Lab2 />, document.getElementById('lab2-container'));
});
