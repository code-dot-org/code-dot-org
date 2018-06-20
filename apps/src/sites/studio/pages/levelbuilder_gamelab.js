/** @file JavaScript run only on the gamelab level edit page. */
import $ from 'jquery';
import animationListModule, {
  setInitialAnimationList,
} from '@cdo/apps/gamelab/animationListModule';
import defaultSprites from '@cdo/apps/gamelab/defaultSprites.json';
import initializeCodeMirror, {
  initializeCodeMirrorForJson,
} from '@cdo/apps/code-studio/initializeCodeMirror';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {throwIfSerializedAnimationListIsInvalid} from '@cdo/apps/gamelab/shapes';

const VALID_COLOR = 'black';
const INVALID_COLOR = '#d00';

registerReducers({animationList: animationListModule});
getStore().dispatch(setInitialAnimationList(defaultSprites));
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
  const autoRunSetup = document.getElementById('level_auto_run_setup');
  const customSetupCode = document.getElementById('level_custom_setup_code');
  if (autoRunSetup && customSetupCode) {
    const changeHandler = () => {
      if (autoRunSetup.value === 'CUSTOM') {
        customSetupCode.previousElementSibling.style.display = '';
        if (customSetupCode.editor) {
          customSetupCode.editor.getWrapperElement().style.display = '';
        } else {
          customSetupCode.editor = initializeCodeMirror(
            'level_custom_setup_code', 'javascript');
        }
      } else {
        customSetupCode.previousElementSibling.style.display = 'none';
        customSetupCode.style.display = 'none';
        if (customSetupCode.editor) {
          customSetupCode.editor.getWrapperElement().style.display = 'none';
        }
      }
    };
    autoRunSetup.onchange = changeHandler;
    changeHandler();
  }
});
