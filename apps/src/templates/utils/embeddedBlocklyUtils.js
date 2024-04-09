import {installCustomBlocks} from '@cdo/apps/block_utils';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import {getStore} from '@cdo/apps/code-studio/redux';
import animationList, {
  setInitialAnimationList,
} from '@cdo/apps/p5lab/redux/animationList';
import {customInputTypes} from '@cdo/apps/p5lab/spritelab/blocks';
import {
  valueTypeTabShapeMap,
  exampleSprites,
} from '@cdo/apps/p5lab/spritelab/constants';
import {registerReducers} from '@cdo/apps/redux';

/**
 * Prepares the blockly environment to allow for embedding blocks in divs
 * Note that this function dispatches to redux
 *
 * @param {object[]} list of blocks that can be embedded
 */
export const prepareBlocklyForEmbedding = function (customBlocksConfig) {
  if (!customBlocksConfig) {
    return;
  }
  Blockly.assetUrl = assetUrl;
  Blockly.typeHints = true;
  Blockly.cdoUtils.injectCss(document);

  // Spritelab-specific logic but not harmful to other labs.
  registerReducers({
    animationList,
  });
  const store = getStore();
  store.dispatch(setInitialAnimationList(exampleSprites));
  Blockly.valueTypeTabShapeMap = valueTypeTabShapeMap(Blockly);

  installCustomBlocks({
    blockly: Blockly,
    blockDefinitions: customBlocksConfig,
    customInputTypes,
  });
};
