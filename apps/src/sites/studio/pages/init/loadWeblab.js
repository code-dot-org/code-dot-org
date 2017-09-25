import appMain from "@cdo/apps/appMain";
import {singleton as studioApp} from "@cdo/apps/StudioApp";
import WebLab from "@cdo/apps/weblab/WebLab";
import skins from "@cdo/apps/skins";
import levels from '@cdo/apps/weblab/levels';

export default function loadweblab(options) {
  options.skinsModule = skins;
  options.isEditorless = true;
  options.skinId = 'weblab';
  const weblab = new WebLab();

  // Bind helper that provides project metadata for gamelab autosave
  // options.getAnimationMetadata = gamelab.getAnimationMetadata.bind(gamelab);

  weblab.injectStudioApp(studioApp());
  appMain(weblab, levels, options);
}
