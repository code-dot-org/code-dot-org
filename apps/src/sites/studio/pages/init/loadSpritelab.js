import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import SpriteLab from '@cdo/apps/p5lab/spritelab/SpriteLab';
import blocks from '@cdo/apps/p5lab/spritelab/blocks';
import skins from '@cdo/apps/p5lab/skins';
import levels from '@cdo/apps/p5lab/levels';
import {getDefaultListMetadata} from '@cdo/apps/assetManagement/animationLibraryApi';
import defaultSprites from '@cdo/apps/p5lab/spritelab/defaultSprites.json';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {getCurrentId} from '@cdo/apps/code-studio/initApp/project';

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

      // Log data that we're using the backup default animations.
      firehoseClient.putRecord({
        study: 'sprite_default_load',
        study_group: 'spritelab',
        event: 'backup_animations_used',
        project_id: getCurrentId()
      });

      return initializeOptionsAndSpritelab(spritelab, options);
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
