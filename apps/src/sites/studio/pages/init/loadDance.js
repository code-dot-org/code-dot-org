import appMain from '@cdo/apps/appMain';
import blocks from '@cdo/apps/dance/blockly/blocks';
import {MAX_GAME_WIDTH, MIN_GAME_WIDTH} from '@cdo/apps/dance/constants';
import Dance from '@cdo/apps/dance/Dance';
import {singleton as studioApp} from '@cdo/apps/StudioApp';

export default function loadDancelab(options) {
  options.blocksModule = blocks;
  options.maxVisualizationWidth = MAX_GAME_WIDTH;
  options.minVisualizationWidth = MIN_GAME_WIDTH;
  const dance = new Dance();

  dance.injectStudioApp(studioApp());
  appMain(dance, {custom: {}}, options);

  return dance;
}
