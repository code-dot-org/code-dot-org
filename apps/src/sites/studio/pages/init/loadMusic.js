import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import Music from '@cdo/apps/music/Music';
import levels from '@cdo/apps/music/levels';

export default function loadMusic(options) {
  options.isEditorless = true;
  const music = new Music();

  music.injectStudioApp(studioApp());
  appMain(music, levels, options);
}
