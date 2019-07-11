import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import SpriteLab from '@cdo/apps/spritelab/SpriteLab';
import blocks from '@cdo/apps/gamelab/blocks';
import skins from '@cdo/apps/gamelab/skins';
import levels from '@cdo/apps/gamelab/levels';

export default function loadSpritelab(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  var spritelab = new SpriteLab();

  // Bind helper that provides project metadata for gamelab autosave
  options.getAnimationList = spritelab.getSerializedAnimationList.bind(
    spritelab
  );
  options.getGeneratedProperties = spritelab.getGeneratedProperties.bind(
    spritelab
  );

  spritelab.injectStudioApp(studioApp());
  appMain(spritelab, levels, options);

  return spritelab;
}
