// TODO(javalab-lab2): delete after migration completes.
// Java Lab now loads through the lab2 stack (see
// apps/src/javalab/lab2/entrypoint.ts); this loader is no longer reached
// once uses_lab2? returns true on the Javalab Rails level.
import appMain from '@cdo/apps/appMain';
import Javalab from '@cdo/apps/javalab/Javalab';
import levels from '@cdo/apps/javalab/levels';
import skins from '@cdo/apps/maze/skins';
import {singleton as studioApp} from '@cdo/apps/StudioApp';

export default function loadJavalab(options) {
  options.isEditorless = true;
  const javalab = new Javalab();

  javalab.injectStudioApp(studioApp());
  // TODO: Update this to "neighborhood" once the skin has been created. Create a const for the skinId.
  options.skinsModule = skins;
  options.skinId = 'neighborhood';
  appMain(javalab, levels, options);
}
