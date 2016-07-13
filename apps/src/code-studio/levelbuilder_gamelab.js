/** @file JavaScript run only on the gamelab level edit page. */
import $ from 'jquery';
import initializeCodeMirror from './initializeCodeMirror';
import {throwIfSerializedAnimationListIsInvalid} from '@cdo/apps/gamelab/PropTypes';

$(document).ready(function () {

  // Live-validate animations JSON using same validation code we use in Gamelab
  let levelStartAnimationsValidationDiv = $('#level-start-animations-validation');
  initializeCodeMirror('level_start_animations', 'json', codeMirror => {
    const editorContent = codeMirror.getValue().trim();
    try {
      if (editorContent.length > 0) {
        const animationList = JSON.parse(codeMirror.getValue());
        throwIfSerializedAnimationListIsInvalid(animationList);
      }
      levelStartAnimationsValidationDiv.text('Animations JSON appears valid.');
      levelStartAnimationsValidationDiv.css('color', 'black');
    } catch (err) {
      levelStartAnimationsValidationDiv.text(err.toString());
      levelStartAnimationsValidationDiv.css('color', '#dd0000');
    }
  });
});
