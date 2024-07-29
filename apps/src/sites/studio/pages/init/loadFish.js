import appMain from '@cdo/apps/appMain';
import Fish from '@cdo/apps/fish/Fish';
import levels from '@cdo/apps/fish/levels';
import skins from '@cdo/apps/skins';
import {singleton as studioApp} from '@cdo/apps/StudioApp';

export default function loadFish(options) {
  options.skinsModule = skins;
  options.isEditorless = true;
  options.skinId = 'fish';
  const fish = new Fish();

  fish.injectStudioApp(studioApp());
  appMain(fish, levels, options);
}
