import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import GameLab from '@cdo/apps/p5lab/gamelab/GameLab';
import blocks from '@cdo/apps/p5lab/gamelab/blocks';
import skins from '@cdo/apps/p5lab/gamelab/skins';
import levels from '@cdo/apps/p5lab/gamelab/levels';

export default function loadGamelab(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  var gamelab = new GameLab();

  // Bind helper that provides project metadata for gamelab autosave
  options.getAnimationList = gamelab.getSerializedAnimationList.bind(gamelab);
  options.getGeneratedProperties = gamelab.getGeneratedProperties.bind(gamelab);

  gamelab.injectStudioApp(studioApp());
  appMain(gamelab, levels, options);

  return gamelab;
}
