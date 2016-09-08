import appMain from '../appMain';
import {singleton as studioApp} from '../StudioApp';
import WebLab from './WebLab';
import skins from '../skins';

window.weblabMain = function (options) {
  options.skinsModule = skins;
  options.isEditorless = true;
  const weblab = new WebLab();

  // Bind helper that provides project metadata for gamelab autosave
  // options.getAnimationMetadata = gamelab.getAnimationMetadata.bind(gamelab);

  weblab.injectStudioApp(studioApp);
  appMain(weblab, null, options);
};
