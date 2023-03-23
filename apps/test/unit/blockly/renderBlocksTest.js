import GoogleBlockly from 'blockly/core';
import initializeGoogleBlocklyWrapper from '@cdo/apps/blockly/googleBlocklyWrapper';
import {parseElement} from '@cdo/apps/xml';
Blockly = initializeGoogleBlocklyWrapper(GoogleBlockly); // eslint-disable-line no-global-assign
import {installCustomBlocks} from '@cdo/apps/block_utils';
import {customInputTypes as spritelabCustomInputTypes} from '@cdo/apps/p5lab/spritelab/blocks';

describe('block rendering', () => {
  // need to reset blockly every time?
  // we're not modifying it, but need to make sure it exists globally (and that global version is whatever we want it to be)

  it('renders', () => {
    const config = {
      func: 'avoidingTargets',
      blockText: 'avoiding targets',
      returnType: 'Behavior',
      color: [136, '.84', '.80']
    };

    // questions to answer:
    // should we check block styles (eg, look for black?)
    // read only vs not?

    // customInputTypes may be unnecessary
    // hard coding just to get this initial version working
    // category may also be unnecessary
    installCustomBlocks({
      blockly: Blockly,
      blockDefinitions: [
        {
          name: 'gamelab_avoidingTargets',
          pool: 'GamelabJr',
          category: 'SL1',
          config: config,
          helperCode: undefined
        }
      ],
      customInputTypes: spritelabCustomInputTypes
    });

    // headless workspace
    const workspace = new Blockly.Workspace();
    const blocksDom = parseElement(
      `<block type="gamelab_avoidingTargets" />`,
      true
    );
    const block = Blockly.Xml.domToBlock(blocksDom, workspace);

    // returns null for known block, and "unknown block" for unknown blocks
    // need better expectation that block is known
    console.log(block.getFieldValue('NAME'));
  });
});
