import $ from 'jquery';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import jsonic from 'jsonic';
import {parseElement} from '@cdo/apps/xml';
import {installCustomBlocks} from '@cdo/apps/block_utils';
import {customInputTypes} from '@cdo/apps/p5lab/spritelab/blocks';
import {
  valueTypeTabShapeMap,
  exampleSprites
} from '@cdo/apps/p5lab/spritelab/constants';
import {shrinkBlockSpaceContainer} from '@cdo/apps/templates/instructions/utils';
import animationList, {
  setInitialAnimationList
} from '@cdo/apps/p5lab/redux/animationList';
import {getStore, registerReducers} from '@cdo/apps/redux';

function renderBlock(element) {
  const name = element.id;
  const config = element.getAttribute('config');
  const pool = element.getAttribute('pool');
  const parsedConfig = jsonic(config);
  const blocksInstalled = installCustomBlocks({
    blockly: Blockly,
    blockDefinitions: [
      {
        name: name,
        pool: pool,
        category: 'Custom',
        config: parsedConfig
      }
    ],
    customInputTypes
  });
  const blockName = Object.values(blocksInstalled)[0][0];
  const blocksDom = parseElement(`<block type='${blockName}' />`);
  const blockSpace = Blockly.BlockSpace.createReadOnlyBlockSpace(
    element,
    blocksDom,
    {
      noScrolling: true,
      inline: false
    }
  );
  shrinkBlockSpaceContainer(blockSpace, true);
}

$(document).ready(() => {
  registerReducers({animationList: animationList});
  getStore().dispatch(setInitialAnimationList(exampleSprites));
  Blockly.assetUrl = assetUrl;
  Blockly.valueTypeTabShapeMap = valueTypeTabShapeMap(Blockly);
  Blockly.typeHints = true;
  Blockly.Css.inject(document);

  const divs = document.getElementsByClassName('blockly-container');
  for (let i = 0; i < divs.length; i++) {
    renderBlock(divs[i]);
  }
});
