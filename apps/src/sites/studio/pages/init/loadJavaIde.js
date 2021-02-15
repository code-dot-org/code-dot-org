import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import JavaIde from '@cdo/apps/javaide/JavaIde';
import levels from '@cdo/apps/javaide/levels';

export default function loadJavaIde(options) {
  options.isEditorless = true;
  const javaIde = new JavaIde();

  javaIde.injectStudioApp(studioApp());
  appMain(javaIde, levels, options);
}
