import $ from 'jquery';
import initializeCodeMirror, {
  initializeCodeMirrorForJson,
} from '@cdo/apps/code-studio/initializeCodeMirror';

$(document).ready(() => {
  initializeCodeMirrorForJson('block_config');
  initializeCodeMirror('block_helper_code', 'javascript');
});
