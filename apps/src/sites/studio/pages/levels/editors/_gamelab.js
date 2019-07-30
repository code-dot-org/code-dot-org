/** @file JavaScript run only on the gamelab level edit page. */
import $ from 'jquery';
import animationListModule, {
  setInitialAnimationList
} from '@cdo/apps/p5lab/animationListModule';
import defaultSprites from '@cdo/apps/p5lab/spritelab/defaultSprites.json';
import initializeCodeMirror, {
  initializeCodeMirrorForJson
} from '@cdo/apps/code-studio/initializeCodeMirror';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {throwIfSerializedAnimationListIsInvalid} from '@cdo/apps/p5lab/shapes';

const VALID_COLOR = 'black';
const INVALID_COLOR = '#d00';

registerReducers({animationList: animationListModule});
getStore().dispatch(setInitialAnimationList(defaultSprites));
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
  initializeCodeMirror('level_start_animations', 'json', {
    callback: codeMirror => {
      validateAnimationJSON(codeMirror.getValue());
    }
  });

  // Leniently validate and fix up custom block JSON using jsonic
  if (document.getElementById('level_custom_blocks')) {
    initializeCodeMirrorForJson('level_custom_blocks', {
      validationDiv: 'custom-blocks-validation',
      onBlur(blocks) {
        if (!Array.isArray(blocks)) {
          return [blocks];
        }
        return blocks;
      }
    });
  }
  if (document.getElementById('level_custom_helper_library')) {
    initializeCodeMirror('level_custom_helper_library', 'javascript');
  }
  if (document.getElementById('level_validation_code')) {
    initializeCodeMirror('level_validation_code', 'javascript');
  }
});
