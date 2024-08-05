import $ from 'jquery';
import React from 'react';
import {createRoot} from 'react-dom/client';

import Lab2 from '@cdo/apps/lab2/views/Lab2';

$(document).ready(function () {
  const root = createRoot(document.getElementById('lab2-container'));
  root.render(<Lab2 />);
});
