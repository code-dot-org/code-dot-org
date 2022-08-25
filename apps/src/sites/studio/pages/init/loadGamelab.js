import appMain from '@cdo/apps/appMain';
import {singleton as studioApp} from '@cdo/apps/StudioApp';
import GameLab from '@cdo/apps/p5lab/gamelab/GameLab';
import skins from '@cdo/apps/p5lab/skins';
import levels from '@cdo/apps/p5lab/levels';
import {getDefaultListMetadata} from '@cdo/apps/assetManagement/animationLibraryApi';
import defaultSprites from '@cdo/apps/p5lab/spritelab/defaultSprites.json';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {getCurrentId} from '@cdo/apps/code-studio/initApp/project';

export default function loadGamelab(options) {
  options.skinsModule = skins;
  return getDefaultListMetadata()
    .then(defaultSpritesList => {
      let gamelab = new GameLab(defaultSpritesList);
      return initializeOptionsAndGamelab(gamelab, options);
    })
    .catch(() => {
      // If the S3 request for defaultSpriteList fails, use a backup list of just two sprites.
      let gamelab = new GameLab(defaultSprites);

      // Log data that we're using the backup default sprites.
      firehoseClient.putRecord({
        study: 'sprite_default_load',
        study_group: 'gamelab',
        event: 'backup_sprites_used',
        project_id: getCurrentId()
      });

      return initializeOptionsAndGamelab(gamelab, options);
    });
}

function initializeOptionsAndGamelab(gamelab, options) {
  // Bind helper that provides project metadata for gamelab autosave
  options.getAnimationList = gamelab.getSerializedAnimationList.bind(gamelab);
  options.getGeneratedProperties = gamelab.getGeneratedProperties.bind(gamelab);

  gamelab.injectStudioApp(studioApp());
  appMain(gamelab, levels, options);

  return gamelab;
}
