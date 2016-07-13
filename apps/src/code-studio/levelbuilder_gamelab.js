/** @file JavaScript run only on the gamelab level edit page. */
import $ from 'jquery';
import initializeCodeMirror from './initializeCodeMirror';
import {throwIfSerializedAnimationListIsInvalid} from '@cdo/apps/gamelab/PropTypes';

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
      levelStartAnimationsValidationDiv.css('color', 'black');
    } catch (err) {
      levelStartAnimationsValidationDiv.text(err.toString());
      levelStartAnimationsValidationDiv.css('color', '#dd0000');
    }
  };
  // Run validation at start, and then on every codeMirror change
  validateAnimationJSON(document.getElementById('level_start_animations').value);
  initializeCodeMirror('level_start_animations', 'json', codeMirror => {
    validateAnimationJSON(codeMirror.getValue());
  });
});

