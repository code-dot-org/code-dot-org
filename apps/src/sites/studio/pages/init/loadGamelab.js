import appMain from '@cdo/apps/appMain';
import GameLab from '@cdo/apps/p5lab/gamelab/GameLab';
import levels from '@cdo/apps/p5lab/levels';
import skins from '@cdo/apps/p5lab/skins';
import {singleton as studioApp} from '@cdo/apps/StudioApp';

export default function loadGamelab(options) {
  options.skinsModule = skins;
  const gamelab = new GameLab();

  // Bind helper that provides project metadata for gamelab autosave
  options.getAnimationList = gamelab.getSerializedAnimationList.bind(gamelab);

  gamelab.injectStudioApp(studioApp());
  appMain(gamelab, levels, options);

  return gamelab;
}
