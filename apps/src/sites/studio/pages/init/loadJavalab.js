import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import Javalab from '@cdo/apps/javalab/Javalab';
import levels from '@cdo/apps/javalab/levels';
import skins from '@cdo/apps/maze/skins';

export default function loadJavalab(options) {
  options.isEditorless = true;
  const javalab = new Javalab();

  javalab.injectStudioApp(studioApp());
  // TODO: Update this to "neighborhood" once the skin has been created.
  options.skinsModule = skins;
  options.skinId = "birds";
  appMain(javalab, levels, options);
}
