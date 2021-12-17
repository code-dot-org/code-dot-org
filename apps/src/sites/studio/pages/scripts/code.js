import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import UnitRollup from '@cdo/apps/templates/courseRollupPages/UnitRollup';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/code-studio/redux';
import {customInputTypes} from '@cdo/apps/p5lab/spritelab/blocks';
import animationList, {
  setInitialAnimationList
} from '@cdo/apps/p5lab/redux/animationList';
import {
  valueTypeTabShapeMap,
  exampleSprites
} from '@cdo/apps/p5lab/spritelab/constants';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import {installCustomBlocks} from '@cdo/apps/block_utils';
import getScriptData from '@cdo/apps/util/getScriptData';
import {registerReducers} from '@cdo/apps/redux';

$(document).ready(() => {
  prepareBlockly();
  initPage();
});

function prepareBlockly() {
  const customBlocksConfig = getScriptData('customBlocksConfig');
  if (!customBlocksConfig) {
    return;
  }
  registerReducers({
    animationList
  });
  const store = getStore();
  store.dispatch(setInitialAnimationList(exampleSprites));
  Blockly.assetUrl = assetUrl;
  Blockly.valueTypeTabShapeMap = valueTypeTabShapeMap(Blockly);
  Blockly.typeHints = true;
  Blockly.Css.inject(document);

  installCustomBlocks({
    blockly: window.Blockly,
    blockDefinitions: customBlocksConfig,
    customInputTypes
  });
}

function initPage() {
  const script = document.querySelector('script[data-unit-rollup]');
  const unitData = JSON.parse(script.dataset.unitRollup);
  const unitSummary = unitData.unit_summary;

  const store = getStore();

  ReactDOM.render(
    <Provider store={store}>
      <UnitRollup objectToRollUp={'Code'} unit={unitSummary} />
    </Provider>,
    document.getElementById('roll_up')
  );
}
