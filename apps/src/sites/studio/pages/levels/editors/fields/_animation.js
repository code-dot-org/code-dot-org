import $ from 'jquery';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import {throwIfSerializedAnimationListIsInvalid} from '@cdo/apps/p5lab/shapes';

const VALID_COLOR = 'black';
const INVALID_COLOR = '#d00';

$(document).ready(function() {
  // Live-validate animations JSON using same validation code we use in Gamelab
  const levelStartAnimationsValidationDiv = $(
    '#level-start-animations-validation'
  );
  const validateAnimationJSON = function(json) {
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
  validateAnimationJSON(
    document.getElementById('level_start_animations').value
  );
  initializeCodeMirror('level_start_animations', 'application/json', {
    callback: codeMirror => {
      validateAnimationJSON(codeMirror.getValue());
    }
  });

  if (document.getElementById('level_custom_helper_library')) {
    initializeCodeMirror('level_custom_helper_library', 'javascript');
  }
});
