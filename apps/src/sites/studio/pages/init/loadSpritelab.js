import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import SpriteLab from '@cdo/apps/spritelab/SpriteLab';
import blocks from '@cdo/apps/gamelab/blocks';
import skins from '@cdo/apps/gamelab/skins';
import levels from '@cdo/apps/gamelab/levels';

export default function loadSpritelab(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  var spritelab = new SpriteLab();
  var gamelab = spritelab.gamelab;

  // Bind helper that provides project metadata for gamelab autosave
  options.getAnimationList = gamelab.getSerializedAnimationList.bind(gamelab);
  options.getGeneratedProperties = gamelab.getGeneratedProperties.bind(gamelab);

  gamelab.injectStudioApp(studioApp());
  appMain(gamelab, levels, options);

  return gamelab;
}
