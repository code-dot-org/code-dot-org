import appMain from '@cdo/apps/appMain';
import {getDefaultListMetadata} from '@cdo/apps/assetManagement/animationLibraryApi';
import {getCurrentId} from '@cdo/apps/code-studio/initApp/project';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import levels from '@cdo/apps/p5lab/levels';
import Poetry from '@cdo/apps/p5lab/poetry/Poetry';
import skins from '@cdo/apps/p5lab/skins';
import blocks from '@cdo/apps/p5lab/spritelab/blocks';
import defaultSprites from '@cdo/apps/p5lab/spritelab/defaultSprites.json';
import {singleton as studioApp} from '@cdo/apps/StudioApp';

export default function loadPoetry(options) {
  options.skinsModule = skins;
  options.blocksModule = blocks;

  return getDefaultListMetadata()
    .then(defaultAnimationsList => {
      let poetry = new Poetry(defaultAnimationsList);
      return initializeOptionsAndPoetry(poetry, options);
    })
    .catch(() => {
      // If the S3 request for defaultAnimationList fails, use a backup mini list of animations.
      let poetry = new Poetry(defaultSprites);

      // Log data that we're using the backup default animations.
      firehoseClient.putRecord({
        study: 'sprite_default_load',
        study_group: 'poetry',
        event: 'backup_animations_used',
        project_id: getCurrentId(),
      });
      return initializeOptionsAndPoetry(poetry, options);
    });
}

function initializeOptionsAndPoetry(poetry, options) {
  // Bind helper that provides project metadata for gamelab autosave
  options.getAnimationList = poetry.getSerializedAnimationList.bind(poetry);

  poetry.injectStudioApp(studioApp());
  appMain(poetry, levels, options);

  return poetry;
}
