import $ from 'jquery';
import jsonic from 'jsonic';

import {installCustomBlocks} from '@cdo/apps/block_utils';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import {customInputTypes as danceInputTypes} from '@cdo/apps/dance/blockly/blocks';
import animationList, {
  setInitialAnimationList,
} from '@cdo/apps/p5lab/redux/animationList';
import {customInputTypes as spriteLabInputTypes} from '@cdo/apps/p5lab/spritelab/blocks';
import {
  valueTypeTabShapeMap,
  exampleSprites,
} from '@cdo/apps/p5lab/spritelab/constants';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {shrinkBlockSpaceContainer} from '@cdo/apps/templates/instructions/utils';
import {parseElement} from '@cdo/apps/xml';

function renderBlock(element) {
  const name = element.id;
  const config = element.getAttribute('config');
  const pool = element.getAttribute('pool');
  const parsedConfig = jsonic(config);
  const customInputTypes =
    pool === 'Dancelab' ? danceInputTypes : spriteLabInputTypes;
  const blocksInstalled = installCustomBlocks({
    blockly: Blockly,
    blockDefinitions: [
      {
        name: name,
        pool: pool,
        category: 'Custom',
        config: parsedConfig,
      },
    ],
    customInputTypes,
  });
  const blockName = Object.values(blocksInstalled)[0][0];
  const blocksDom = parseElement(`<block type='${blockName}' />`);
  const blockSpace = Blockly.createEmbeddedWorkspace(element, blocksDom, {
    noScrolling: true,
    inline: false,
  });
  shrinkBlockSpaceContainer(blockSpace, true);
}

$(document).ready(() => {
  registerReducers({animationList: animationList});
  getStore().dispatch(setInitialAnimationList(exampleSprites));
  Blockly.assetUrl = assetUrl;
  Blockly.valueTypeTabShapeMap = valueTypeTabShapeMap(Blockly);
  Blockly.typeHints = true;
  Blockly.cdoUtils.injectCss(document);

  const divs = document.getElementsByClassName('blockly-container');
  for (let i = 0; i < divs.length; i++) {
    renderBlock(divs[i]);
  }
});
