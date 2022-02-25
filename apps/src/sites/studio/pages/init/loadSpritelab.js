import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import SpriteLab from '@cdo/apps/p5lab/spritelab/SpriteLab';
import blocks from '@cdo/apps/p5lab/spritelab/blocks';
import skins from '@cdo/apps/p5lab/skins';
import levels from '@cdo/apps/p5lab/levels';
import {getDefaultListMetadata} from '@cdo/apps/assetManagement/animationLibraryApi';
import defaultSprites from '@cdo/apps/p5lab/spritelab/defaultSprites.json';

export default function loadSpritelab(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  return getDefaultListMetadata()
    .then(defaultSpritesList => {
      var spritelab = new SpriteLab(defaultSpritesList);
      return initializeOptionsAndSpritelab(spritelab, options);
    })
    .catch(() => {
      // If the S3 request for defaultSpriteList fails, use a backup list of just two sprites
      var spritelab = new SpriteLab(defaultSprites);

      // ToDo: log failed fetch

      return initializeOptionsAndSpritelab(spritelab);
    });
}

function initializeOptionsAndSpritelab(spritelab, options) {
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
