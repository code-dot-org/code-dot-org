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

export default function loadCraft(options) {
  window.Craft = options.level.isEventLevel ? DesignerCraft : Craft;
  if (typeof global !== 'undefined') {
    global.Craft = window.Craft;
  }

  options.skinsModule = options.level.isEventLevel ? designerSkins : skins;
  options.blocksModule = options.level.isEventLevel ? designerBlocks : blocks;

  const appWidth = 434;
  const appHeight = 477;
  options.nativeVizWidth = appWidth;
  options.vizAspectRatio = appWidth / appHeight;
  options.maxVisualizationWidth = 600;

  const levelsToUse = options.level.isEventLevel ? designerLevels : levels;
  appMain(window.Craft, levelsToUse, options);
}
