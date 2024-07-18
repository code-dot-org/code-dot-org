import Ailab from '@cdo/apps/ailab/Ailab';
import levels from '@cdo/apps/ailab/levels';
import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';

export default function loadAilab(options) {
  options.isEditorless = true;
  const ailab = new Ailab();

  ailab.injectStudioApp(studioApp());
  appMain(ailab, levels, options);
}
