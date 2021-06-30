import $ from 'jquery';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import jsonic from 'jsonic';
import {parseElement} from '@cdo/apps/xml';
import {installCustomBlocks} from '@cdo/apps/block_utils';
import {customInputTypes as spritelabCustomInputTypes} from '@cdo/apps/p5lab/spritelab/blocks';
import {customInputTypes as dancelabCustomInputTypes} from '@cdo/apps/dance/blocks';
import {valueTypeTabShapeMap} from '@cdo/apps/p5lab/P5Lab';
import animationList, {
  setInitialAnimationList
} from '@cdo/apps/p5lab/redux/animationList';
import defaultSprites from '@cdo/apps/p5lab/spritelab/defaultSprites.json';
import {getStore, registerReducers} from '@cdo/apps/redux';

const VALID_COLOR = 'black';
const INVALID_COLOR = '#d00';

let poolField, nameField, helperEditor, configEditor, validationDiv;

$(document).ready(() => {
  registerReducers({animationList: animationList});
  getStore().dispatch(setInitialAnimationList(defaultSprites));

  poolField = document.getElementById('block_pool');
  nameField = document.getElementById('block_name');
  Blockly.inject(document.getElementById('blockly-container'), {
    assetUrl,
    valueTypeTabShapeMap: valueTypeTabShapeMap(Blockly),
    typeHints: true
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
    onUpdateLinting: onUpdateLinting
  });

  helperEditor = initializeCodeMirror(helperCodeElement, 'javascript', {
    callback: _ => validateBlockConfig(),
    onUpdateLinting: onUpdateLinting
  });
  poolField.addEventListener('change', updateBlockPreview);

  if (blocks) {
    updateBlockPreview();
  }

  $('.alert.alert-success')
    .delay(5000)
    .fadeOut(1000);
});

function onUpdateLinting(_, errors) {
  const submitButton = document.querySelector('#block_submit');
  if (errors.length) {
    submitButton.setAttribute('disabled', 'disabled');
  } else {
    submitButton.removeAttribute('disabled');
  }
}

function validateBlockConfig(editor) {
  try {
    if (editor) {
      JSON.parse(editor.getValue());
    }
    updateBlockPreview();
    validationDiv.text('Config and helper code appear valid.');
    validationDiv.css('color', VALID_COLOR);
  } catch (err) {
    validationDiv.text(err.toString());
    validationDiv.css('color', INVALID_COLOR);
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
        helperCode: helperEditor && helperEditor.getValue()
      }
    ],
    customInputTypes
  });
  const blocksDom = parseElement(`<block type="${blockName}" />`);
  Blockly.mainBlockSpace.clear();
  Blockly.Xml.domToBlockSpace(Blockly.mainBlockSpace, blocksDom);
  Blockly.addChangeListener(onBlockSpaceChange);
}

function onBlockSpaceChange() {
  document.getElementById(
    'code-preview'
  ).innerText = Blockly.getWorkspaceCode();
}
