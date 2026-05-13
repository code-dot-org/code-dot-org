import appMain from '@cdo/apps/appMain';
import {getDefaultListMetadata} from '@cdo/apps/assetManagement/animationLibraryApi';
import levels from '@cdo/apps/p5lab/levels';
import skins from '@cdo/apps/p5lab/skins';
import blocks from '@cdo/apps/p5lab/spritelab/blocks';
import defaultSprites from '@cdo/apps/p5lab/spritelab/defaultSprites.json';
import SpriteLab from '@cdo/apps/p5lab/spritelab/SpriteLab';
import {singleton as studioApp} from '@cdo/apps/StudioApp';

export default function loadSpritelab(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;
  return getDefaultListMetadata()
    .then(defaultAnimationsList => {
      let spritelab = new SpriteLab(defaultAnimationsList);
      return initializeOptionsAndSpritelab(spritelab, options);
    })
    .catch(() => {
      // If the S3 request for defaultAnimationList fails, use a backup mini list of animations.
      let spritelab = new SpriteLab(defaultSprites);
      return initializeOptionsAndSpritelab(spritelab, options);
    });
}

function initializeOptionsAndSpritelab(spritelab, options) {
  // Bind helper that provides project metadata for gamelab autosave
  options.getAnimationList =
    spritelab.getSerializedAnimationList.bind(spritelab);

  spritelab.injectStudioApp(studioApp());
  appMain(spritelab, levels, options);

  return spritelab;
}
