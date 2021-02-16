import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import Idelab from '@cdo/apps/idelab/Idelab';
import levels from '@cdo/apps/idelab/levels';

export default function loadIdelab(options) {
  options.isEditorless = true;
  const idelab = new Idelab();

  idelab.injectStudioApp(studioApp());
  appMain(idelab, levels, options);
}
