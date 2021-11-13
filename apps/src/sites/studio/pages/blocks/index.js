import $ from 'jquery';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import jsonic from 'jsonic';
import {parseElement} from '@cdo/apps/xml';
import {installCustomBlocks} from '@cdo/apps/block_utils';
import {customInputTypes} from '@cdo/apps/p5lab/spritelab/blocks';
import {valueTypeTabShapeMap} from '@cdo/apps/p5lab/spritelab/constants';
import {shrinkBlockSpaceContainer} from '@cdo/apps/templates/instructions/utils';
import animationList, {
  setInitialAnimationList
} from '@cdo/apps/p5lab/redux/animationList';
import {getStore, registerReducers} from '@cdo/apps/redux';

// Blocks in the index are readonly. Use a single costume and a single background for previews.
let defaultThumbnails = {
  orderedKeys: [
    '2223bab1-0b27-4ad1-ad2e-7eb3dd0997c2',
    '8ca751af-ef34-4fd4-9e96-6e985f93f4c2'
  ],
  propsByKey: {
    '2223bab1-0b27-4ad1-ad2e-7eb3dd0997c2': {
      name: 'bear',
      sourceUrl:
        'https://studio.code.org/api/v1/animation-library/spritelab/wAQoTe9lNAp19q.JxOmT6hRtv1GceGwp/category_animals/bear.png',
      frameSize: {x: 254, y: 333},
      frameCount: 1,
      looping: true,
      frameDelay: 2,
      version: 'wAQoTe9lNAp19q.JxOmT6hRtv1GceGwp',
      categories: ['animals']
    },
    '8ca751af-ef34-4fd4-9e96-6e985f93f4c2': {
      name: 'cave',
      sourceUrl:
        'https://studio.code.org/api/v1/animation-library/spritelab/3LUT4MZxHDWhZbAtYtEmQD1ZrfwQ7jFG/category_backgrounds/background_cave.png',
      frameSize: {
        x: 400,
        y: 400
      },
      frameCount: 1,
      looping: true,
      frameDelay: 2,
      version: '3LUT4MZxHDWhZbAtYtEmQD1ZrfwQ7jFG',
      categories: ['backgrounds']
    }
  }
};

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
  getStore().dispatch(setInitialAnimationList(defaultThumbnails));
  Blockly.assetUrl = assetUrl;
  Blockly.valueTypeTabShapeMap = valueTypeTabShapeMap(Blockly);
  Blockly.typeHints = true;
  Blockly.Css.inject(document);

  const divs = document.getElementsByClassName('blockly-container');
  for (let i = 0; i < divs.length; i++) {
    renderBlock(divs[i]);
  }
});
