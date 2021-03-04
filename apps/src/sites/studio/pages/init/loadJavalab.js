import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import Javalab from '@cdo/apps/javalab/Javalab';
window.Javalab = Javalab;
if (typeof global !== 'undefined') {
  global.Javalab = window.Javalab;
}
import levels from '@cdo/apps/javalab/levels';

export default function loadJavalab(options) {
  options.isEditorless = true;
  const javalab = new Javalab();

  javalab.injectStudioApp(studioApp());
  appMain(javalab, levels, options);
}
