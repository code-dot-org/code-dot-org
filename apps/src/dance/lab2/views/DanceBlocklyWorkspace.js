import {MAX_GAME_WIDTH, MIN_GAME_WIDTH} from '@cdo/apps/dance/constants';
import danceBlocks from '@cdo/apps/dance/blocks';
import * as commonBlocks from '@cdo/apps/blocksCommon';
import * as blockUtils from '@cdo/apps/block_utils';
import {valueOr} from '@cdo/apps/utils';
import {Renderers} from '@cdo/apps/blockly/constants';
import ModernTheme from '@cdo/apps/blockly/themes/cdoTheme';

export default class DanceBlocklyWorkspace {
  constructor(blockInstallOptions, levelProperties, container) {
    this.levelProperties = levelProperties;
    console.log('inside DanceBlocklyWorkspace constructor');
    this.blocksModule = danceBlocks;
    this.maxVisualizationWidth = MAX_GAME_WIDTH;
    this.minVisualizationWidth = MIN_GAME_WIDTH;
    console.log('blocksModule', this.blocksModule);
    commonBlocks.install(Blockly, blockInstallOptions);
    this.blocksModule.install(Blockly, blockInstallOptions);
    console.log('Blockly', Blockly);
  }
  /**
   * Initialize the Blockly workspace
   * @param {*} container HTML element to inject the workspace into
   * @param {*} onBlockSpaceChange callback fired when any block space change events occur
   * @param {*} isReadOnlyWorkspace is the workspace readonly
   * @param {*} toolbox information about the toolbox
   *
   */
  init(container) {
    //, onBlockSpaceChange, isReadOnlyWorkspace, toolbox) {
    // Need to access edit_blocks to for wrapNumberValidatorsForLevelBuilder() - or is
    // this only legacy validation?
    console.log('inside init');
    console.log('container', container);
    this.workspace = Blockly.inject(container, {
      toolbox: null,
      theme: ModernTheme,
      renderer: Renderers.DEFAULT,
      noFunctionBlockFrame: true,
      zoom: 1,
      readOnly: false,
    });
    console.log('this.workspace', this.workspace);
    const sharedBlocksConfig = this.levelProperties.sharedBlocks || [];
    console.log('sharedBlocksConfig', sharedBlocksConfig);
    if (sharedBlocksConfig.length > 0) {
      console.log('installCustomBlocks');
      const blocksByCategory = blockUtils.installCustomBlocks({
        blockly: Blockly,
        blockDefinitions: sharedBlocksConfig,
        customInputTypes: this.blocksModule.customInputTypes,
      });
      console.log('blocksByCategory', blocksByCategory);

      if (
        !valueOr(this.levelProperties.hideCustomBlocks, true) ||
        this.levelProperties.edit_blocks
      ) {
        console.log('appendBlocksByCategory');
        this.levelProperties.toolboxBlocks = blockUtils.appendBlocksByCategory(
          this.levelProperties.toolboxBlocks,
          blocksByCategory
        );
      }
    }
  }
}
