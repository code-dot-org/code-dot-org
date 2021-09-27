import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import Poetry from '@cdo/apps/p5lab/poetry/Poetry';
import blocks from '@cdo/apps/p5lab/spritelab/blocks';
import skins from '@cdo/apps/p5lab/skins';
import levels from '@cdo/apps/p5lab/levels';

export default function loadPoetry(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  var poetry = new Poetry();

  // Bind helper that provides project metadata for gamelab autosave
  options.getAnimationList = poetry.getSerializedAnimationList.bind(poetry);
  options.getGeneratedProperties = poetry.getGeneratedProperties.bind(poetry);

  poetry.injectStudioApp(studioApp());
  appMain(poetry, levels, options);

  return poetry;
}
