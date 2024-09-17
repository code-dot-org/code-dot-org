import $ from 'jquery';
import jsonic from 'jsonic';

import {getDefaultListMetadata} from '@cdo/apps/assetManagement/animationLibraryApi';
import {installCustomBlocks} from '@cdo/apps/block_utils';
import {BlocklyVersion} from '@cdo/apps/blockly/constants';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import {customInputTypes as dancelabCustomInputTypes} from '@cdo/apps/dance/blockly/blocks';
import animationList, {
  setInitialAnimationList,
} from '@cdo/apps/p5lab/redux/animationList';
import {customInputTypes as spritelabCustomInputTypes} from '@cdo/apps/p5lab/spritelab/blocks';
import {valueTypeTabShapeMap} from '@cdo/apps/p5lab/spritelab/constants';
import {getStore, registerReducers} from '@cdo/apps/redux';

const VALID_COLOR = 'black';
const INVALID_COLOR = '#d00';

let poolField, nameField, helperEditor, configEditor, validationDiv;
let hasLintingErrors = false;
let isValidBlockConfig = false;

$(document).ready(() => {
  registerReducers({animationList: animationList});
  getDefaultListMetadata()
    .then(initializeEditPage)
    .catch(() => {
      console.error(
        'Unable to render sprite costumes in block preview. Please refresh the page.'
      );
    });
});

function initializeEditPage(defaultSprites) {
  getStore().dispatch(setInitialAnimationList(defaultSprites));

  poolField = document.getElementById('block_pool');
  nameField = document.getElementById('block_name');
  Blockly.inject(document.getElementById('blockly-container'), {
    assetUrl,
    valueTypeTabShapeMap: valueTypeTabShapeMap(Blockly),
    typeHints: true,
    isBlockEditMode: true,
  });

  const blockConfigElement = document.getElementById('block_config');

  // Pretty print the config
  let blocks = blockConfigElement.value;
  if (blocks) {
    blockConfigElement.value = JSON.stringify(JSON.parse(blocks), null, 2);
  }

  validationDiv = $(
    blockConfigElement.parentNode.insertBefore(
      document.createElement('div'),
      blockConfigElement.nextSibling
    )
  );

  const helperCodeElement = document.getElementById('block_helper_code');
  configEditor = initializeCodeMirror(blockConfigElement, 'application/json', {
    callback: validateBlockConfig,
    onUpdateLinting: onUpdateLinting,
  });

  helperEditor = initializeCodeMirror(helperCodeElement, 'javascript', {
    callback: _ => validateBlockConfig(),
    onUpdateLinting: onUpdateLinting,
  });
  poolField.addEventListener('change', updateBlockPreview);

  if (blocks) {
    updateBlockPreview();
    validateBlockConfig();
  }
  setSubmitButtonState();

  $('.alert.alert-success').delay(5000).fadeOut(1000);
}

function onUpdateLinting(_, errors) {
  if (errors.length) {
    hasLintingErrors = true;
  } else {
    hasLintingErrors = false;
  }
  setSubmitButtonState();
}

const setSubmitButtonState = () => {
  const disabled = hasLintingErrors || !isValidBlockConfig;
  ['#block_clone', '#block_submit'].forEach(buttonId => {
    const button = document.querySelector(buttonId);
    if (disabled) {
      button.setAttribute('disabled', 'disabled');
    } else {
      button.removeAttribute('disabled');
    }
  });
};

function validateBlockConfig(editor) {
  try {
    if (editor) {
      JSON.parse(editor.getValue());
    }
    updateBlockPreview();
    validateBlockRenders();
    isValidBlockConfig = true;
    validationDiv.text('Config and helper code appear valid.');
    validationDiv.css('color', VALID_COLOR);
  } catch (err) {
    isValidBlockConfig = false;
    validationDiv.text(err.toString());
    validationDiv.css('color', INVALID_COLOR);
  }
}

// Only apply this validation to pools being rendered in Google Blockly,
// as those are the pools where we have UI tests and want to prevent
// levelbuilder changes from causing them to fail
function validateBlockRenders() {
  if (
    Blockly.version === BlocklyVersion.GOOGLE &&
    Blockly.mainBlockSpace.getAllBlocks().some(block => !!block.unknownBlock)
  ) {
    throw 'Blockly is unable to render a block with the given configuration.';
  }
}

function getBlockName(name, pool) {
  if (!pool || pool === 'GamelabJr') {
    pool = 'gamelab';
  }
  return `${pool}_${name}`;
}

function updateBlockPreview() {
  const parsedConfig = jsonic(configEditor.getValue());

  // Only Dancelab and Spritelab use customInputTypes.
  const customInputTypes =
    poolField.value === 'Dancelab'
      ? dancelabCustomInputTypes
      : spritelabCustomInputTypes;

  const blockName = getBlockName(
    parsedConfig.func || parsedConfig.name,
    poolField.value
  );
  nameField.value = blockName;
  // Calling this function just so that we can catch and show errors (if any)
  installCustomBlocks({
    blockly: Blockly,
    blockDefinitions: [
      {
        name: nameField.value,
        pool: poolField.value,
        category: 'Custom',
        config: parsedConfig,
        helperCode: helperEditor && helperEditor.getValue(),
      },
    ],
    customInputTypes,
  });
  const block = `<block type="${blockName}" />`;
  Blockly.mainBlockSpace.clear();
  Blockly.cdoUtils.loadBlocksToWorkspace(Blockly.mainBlockSpace, block);
  Blockly.addChangeListener(Blockly.mainBlockSpace, onBlockSpaceChange);
}

function onBlockSpaceChange() {
  document.getElementById('code-preview').innerText =
    Blockly.getWorkspaceCode();
}
