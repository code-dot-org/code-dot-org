import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import Aichat from '@cdo/apps/aichat/Aichat';
import levels from '@cdo/apps/aichat/levels';

export default function loadAichat(options) {
  options.isEditorless = true;
  const aichat = new Aichat();

  aichat.injectStudioApp(studioApp());
  appMain(aichat, levels, options);
}
