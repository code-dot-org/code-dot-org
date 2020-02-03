import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import Dance from '@cdo/apps/dance/Dance';
import blocks from '@cdo/apps/dance/blocks';

export default function loadGamelab(options) {
  options.blocksModule = blocks;
  const dance = new Dance();

  dance.injectStudioApp(studioApp());
  appMain(dance, {custom: {}}, options);

  return dance;
}
