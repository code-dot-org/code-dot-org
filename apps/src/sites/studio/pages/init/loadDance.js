import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import Dance from '@cdo/apps/dance/Dance';
import {MAX_GAME_WIDTH, MIN_GAME_WIDTH} from '@cdo/apps/dance/constants';
import blocks from '@cdo/apps/dance/blocks';
import generators from '@cdo/apps/dance/generators';

export default function loadDancelab(options) {
  options.blocksModule = blocks;
  options.blocksGenerators = generators;
  options.maxVisualizationWidth = MAX_GAME_WIDTH;
  options.minVisualizationWidth = MIN_GAME_WIDTH;
  const dance = new Dance();

  dance.injectStudioApp(studioApp());
  appMain(dance, {custom: {}}, options);

  return dance;
}
