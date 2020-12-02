/** @file JavaScript run only on the gamelab level edit page. */
import $ from 'jquery';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';

$(document).ready(function() {
  if (document.getElementById('level_custom_helper_library')) {
    initializeCodeMirror('level_custom_helper_library', 'javascript');
  }
});
