/** @file JavaScript run only on the gamelab level edit page. */
import $ from 'jquery';
import jsonic from 'jsonic';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import {throwIfSerializedAnimationListIsInvalid} from '@cdo/apps/gamelab/shapes';

const VALID_COLOR = 'black';
const INVALID_COLOR = '#d00';

$(document).ready(function () {

  // Live-validate animations JSON using same validation code we use in Gamelab
  const levelStartAnimationsValidationDiv = $('#level-start-animations-validation');
  const validateAnimationJSON = function (json) {
    json = json.trim();
    try {
      if (json.length > 0) {
        const animationList = JSON.parse(json);
        throwIfSerializedAnimationListIsInvalid(animationList);
      }
      levelStartAnimationsValidationDiv.text('Animations JSON appears valid.');
      levelStartAnimationsValidationDiv.css('color', VALID_COLOR);
    } catch (err) {
      levelStartAnimationsValidationDiv.text(err.toString());
      levelStartAnimationsValidationDiv.css('color', INVALID_COLOR);
    }
  };
  // Run validation at start, and then on every codeMirror change
  validateAnimationJSON(document.getElementById('level_start_animations').value);
  initializeCodeMirror('level_start_animations', 'json', codeMirror => {
    validateAnimationJSON(codeMirror.getValue());
  });

  // Leniently validate and fix up custom block JSON using jsonic
  if (document.getElementById('level_custom_blocks')) {
    const customBlocksValidationDiv = $('#custom-blocks-validation');
    const customBlocksEditor =
      initializeCodeMirror('level_custom_blocks', 'application/json');
    customBlocksEditor.on('blur', () => {
      try {
        if (customBlocksEditor.getValue().trim()) {
          let blocks = jsonic(customBlocksEditor.getValue().trim());
          if (!Array.isArray(blocks)) {
            blocks = [blocks];
          }
          customBlocksEditor.setValue(JSON.stringify(blocks, null, 2));
        } else {
          customBlocksEditor.setValue('');
        }
        customBlocksValidationDiv.text('Custom block JSON appears valid.');
        customBlocksValidationDiv.css('color', VALID_COLOR);
      } catch (err) {
        customBlocksValidationDiv.text(err.toString());
        customBlocksValidationDiv.css('color', INVALID_COLOR);
      }
    });
  }
  if (document.getElementById('level_custom_helper_library')) {
    initializeCodeMirror('level_custom_helper_library', 'javascript');
  }
});
