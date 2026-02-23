/** @file JavaScript run only on the gamelab level edit page. */
import $ from 'jquery';

import initializeCodeMirror6 from '@cdo/apps/code-studio/initializeCodeMirror6';

$(document).ready(function () {
  if (document.getElementById('level_custom_helper_library')) {
    initializeCodeMirror6('level_custom_helper_library');
  }
});
