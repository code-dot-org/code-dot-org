import appMain from "@cdo/apps/appMain";

/**
 * Simple Minecraft (maze-style, control avatar with blocks)
 */
import Craft from '@cdo/apps/craft/simple/craft';
import blocks from "@cdo/apps/craft/simple/blocks";
import levels from "@cdo/apps/craft/simple/levels";
import skins from "@cdo/apps/craft/simple/skins";

/**
 * Minecraft Designer ("events" style, program entities & player controls character)
 */
import DesignerCraft from '@cdo/apps/craft/designer/craft';
import * as designerBlocks from "@cdo/apps/craft/designer/blocks";
import designerLevels from "@cdo/apps/craft/designer/levels";
import designerSkins from "@cdo/apps/craft/designer/skins";

/**
 * Minecraft Code Connection
 */
import CodeConnectionCraft from '@cdo/apps/craft/code-connection/craft';
import * as ccBlocks from "@cdo/apps/craft/code-connection/blocks";
import ccLevels from "@cdo/apps/craft/code-connection/levels";
import ccSkins from "@cdo/apps/craft/code-connection/skins";

export default function loadCraft(options) {
  const appWidth = 434;
  const appHeight = 477;
  options.nativeVizWidth = appWidth;
  options.vizAspectRatio = appWidth / appHeight;
  options.maxVisualizationWidth = 600;

  if (options.level.isConnectionLevel) {
    window.Craft = CodeConnectionCraft;
    options.skinsModule = ccSkins;
    options.blocksModule = ccBlocks;
    appMain(window.Craft, ccLevels, options);
  } else if (options.level.isEventLevel) {
    window.Craft = DesignerCraft;
    options.skinsModule = designerSkins;
    options.blocksModule = designerBlocks;
    appMain(window.Craft, designerLevels, options);
  } else {
    window.Craft = Craft;
    options.skinsModule = skins;
    options.blocksModule = blocks;
    appMain(window.Craft, levels, options);
  }
}
